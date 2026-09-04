import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import { toKatakana } from 'wanakana'
import { z } from 'zod'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const kaomBaseUrl = 'http://www.kaom.net'
const ziToolsBaseUrl = 'https://zi.tools'
const outputDirectory = resolve(projectRoot, 'public/data/layers')
const requestDelayMs = 500
const sourceRetryLimit = 3
const batchSize = 96

const dialectBooks = ['beijing', 'jinan', 'shanghai', 'suzhou', 'guangzhou', 'xiamen', 'fuzhou']
const japaneseLayerByLabel = {
  日本吳音: { layerId: 'goon', sourcePointId: 'Z101', label: '日本吴音·《漢字源》第五版' },
  日本漢音: { layerId: 'kanon', sourcePointId: 'Z102', label: '日本汉音·《漢字源》第五版' },
  日本唐音: { layerId: 'toon', sourcePointId: 'Z103', label: '日本唐音·《漢字源》第五版' },
}

const sourceRowSchema = z.object({
  con: z.string().optional(),
  id: z.string(),
  note: z.string().optional(),
  syl: z.string().optional(),
  ton: z.string().optional(),
  vow: z.string().optional(),
  zi: z.string().optional(),
}).passthrough()
const toneEntrySchema = z.object({ ipa: z.string().optional() }).passthrough()
const vowelEntrySchema = z.object({
  glide: z.string().optional(),
  main: z.string().optional(),
  coda: z.string().optional(),
}).passthrough()
const bookEntriesSchema = z.object({
  ton: z.record(z.string(), toneEntrySchema).optional(),
  vow: z.record(z.string(), vowelEntrySchema).optional(),
}).passthrough()
const ziToolsBatchSchema = z.object({
  boks: z.record(z.string(), z.array(z.string())),
  entries: z.record(z.string(), bookEntriesSchema),
  rows: z.record(z.string(), sourceRowSchema),
  zibokrows: z.record(z.string(), z.record(z.string(), z.array(z.string()))),
})
const bookCatalogSchema = z.object({
  map: z.record(z.string(), z.object({
    id: z.string(),
    name: z.string(),
    dir: z.string(),
    sub_dir: z.string(),
  })),
})

const qieyunData = JSON.parse(await readFile(resolve(projectRoot, 'public/data/qieyun.json'), 'utf8'))
const representativeCharacters = Array.from(new Set(qieyunData.slots.map((slot) => slot.representativeCharacter)))
const allCharacters = Array.from(new Set(qieyunData.slots.flatMap((slot) => slot.characters)))
const dialectLimit = Number.parseInt(process.env.DIALECT_LIMIT ?? '0', 10)
const japaneseLimit = Number.parseInt(process.env.JAPANESE_LIMIT ?? '70', 10)
const dialectCharacters = Number.isFinite(dialectLimit) && dialectLimit > 0 ? allCharacters.slice(0, dialectLimit) : allCharacters
const japaneseCharacters = Number.isFinite(japaneseLimit) && japaneseLimit > 0 ? representativeCharacters.slice(0, japaneseLimit) : representativeCharacters
const dialectReadings = {}
const japaneseReadings = {}
const importWarnings = []
let issuedRequests = 0
issuedRequests += 1
const catalogResponse = await fetch(`${ziToolsBaseUrl}/api/yin/bok`, {
  headers: { 'User-Agent': 'RigelNana/dialect source importer; related-point discovery' },
})
if (!catalogResponse.ok) throw new Error(`zi.tools 方言目录加载失败：HTTP ${catalogResponse.status}`)
const bookCatalog = bookCatalogSchema.parse(await catalogResponse.json()).map
const relatedBooksBySeed = Object.fromEntries(dialectBooks.map((seedBook) => {
  const seed = bookCatalog[seedBook]
  if (!seed) throw new Error(`zi.tools 方言目录缺少 ${seedBook}`)
  const signature = seed.sub_dir.split(/\s+/u)[0]
  const relatedBooks = [
    seedBook,
    ...Object.values(bookCatalog)
      .filter((book) =>
        book.id !== seedBook &&
        (book.sub_dir === signature || book.sub_dir.startsWith(`${signature} `)))
      .map((book) => book.id),
  ]
  return [seedBook, relatedBooks]
}))
const dialectBookIds = Array.from(new Set(Object.values(relatedBooksBySeed).flat()))


function readingLayerFromNote(note) {
  if (note.includes('白')) return '白读'
  if (note.includes('文')) return '文读'
  if (note.includes('又')) return '特殊读'
  return '常读'
}
function targetLayers(seedBook, readingLayer) {
  if (!seedBook) return []
  if (seedBook !== 'xiamen') return [seedBook]
  if (readingLayer === '文读') return ['xiamen-literary']
  if (readingLayer === '白读') return ['xiamen-colloquial']
  return ['xiamen-literary', 'xiamen-colloquial']
}

function storeDialectRecord(character, layerId, record) {
  dialectReadings[character] ??= {}
  dialectReadings[character][layerId] ??= []
  const existing = dialectReadings[character][layerId].find((item) =>
    item.ipa === record.ipa && item.readingLayer === record.readingLayer)
  if (!existing) {
    dialectReadings[character][layerId].push(record)
    return
  }
  if (!existing.toneValue && record.toneValue) existing.toneValue = record.toneValue
  if (!existing.toneCategory && record.toneCategory) existing.toneCategory = record.toneCategory
}

async function fetchZiToolsBatch(characters) {
  const books = dialectBookIds.join(',')
  const url = `${ziToolsBaseUrl}/api/yin/search/zi:${encodeURIComponent(characters.join(''))}/${books}`
  for (let attempt = 1; attempt <= sourceRetryLimit; attempt += 1) {
    try {
      issuedRequests += 1
      const response = await fetch(url, {
        headers: { 'User-Agent': 'RigelNana/dialect source importer; batched structured API request' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const parsed = ziToolsBatchSchema.safeParse(await response.json())
      if (parsed.success) return parsed.data
      throw new Error(parsed.error.issues[0]?.message ?? 'schema mismatch')
    } catch (error) {
      if (attempt < sourceRetryLimit) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, requestDelayMs * attempt))
        continue
      }
      importWarnings.push(`zi.tools ${characters[0]}…${characters.at(-1)}: ${String(error)}`)
    }
  }
  return undefined
}

async function importDialectBatch(characters) {
  const data = await fetchZiToolsBatch(characters)
  if (!data) return

  for (const character of characters) {
    const rowIdsByBook = data.zibokrows[character] ?? {}
    for (const seedBook of dialectBooks) {
      const candidatesByLayer = new Map()
      for (const bookKey of relatedBooksBySeed[seedBook]) {
        for (const rowId of rowIdsByBook[bookKey] ?? []) {
          const row = data.rows[rowId]
          if (!row?.syl) continue
          const readingLayer = readingLayerFromNote(row.note ?? '')
          const toneValue = row.ton ? data.entries[bookKey]?.ton?.[row.ton]?.ipa : undefined
          const vowel = row.vow ? data.entries[bookKey]?.vow?.[row.vow] : undefined
          const record = {
            initial: row.con,
            medial: vowel?.glide,
            nucleus: vowel?.main,
            coda: vowel?.coda,
            ipa: row.syl.normalize('NFC'),
            toneCategory: row.ton,
            toneValue,
            readingLayer,
            note: row.note || undefined,
            sourceCharacter: row.zi ?? character,
            sourcePointId: row.id,
            sourceLabel: `zi.tools · ${(data.boks[bookKey] ?? [bookKey]).join(' · ')}`,
            sourceUrl: `${ziToolsBaseUrl}/zi/${encodeURIComponent(character)}`,
          }
          for (const layerId of targetLayers(seedBook, readingLayer)) {
            const candidates = candidatesByLayer.get(layerId) ?? []
            candidates.push({ bookKey, record })
            candidatesByLayer.set(layerId, candidates)
          }
        }
      }
      for (const [layerId, candidates] of candidatesByLayer) {
        const direct = candidates.filter((candidate) => candidate.bookKey === seedBook)
        for (const candidate of direct.length > 0 ? direct : candidates) {
          storeDialectRecord(character, layerId, candidate.record)
        }
      }
    }
  }
}

async function importJapaneseCharacter(character) {
  issuedRequests += 1
  const body = new URLSearchParams({ word: character })
  const response = await fetch(`${kaomBaseUrl}/si_yuwaiyin8.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'RigelNana/dialect source importer; throttled and attributed',
    },
    body,
  })
  if (!response.ok) {
    importWarnings.push(`古音小镜 ${character}: HTTP ${response.status}`)
    return
  }

  const $ = load(await response.text())
  $('tr').each((_, row) => {
    const cells = $(row).find('td').map((__, cell) => $(cell).text().replace(/\s+/gu, ' ').trim()).get()
    const layer = japaneseLayerByLabel[cells[0]]
    if (!layer || cells.length < 3 || cells[1] === '未查詢到') return

    japaneseReadings[character] ??= {}
    japaneseReadings[character][layer.layerId] ??= []
    const historicalForm = cells[2].normalize('NFC')
    const record = {
      historicalForm,
      kana: toKatakana(historicalForm),
      romaji: historicalForm,
      sourceNote: cells[3] || undefined,
      sourcePointId: layer.sourcePointId,
      sourceLabel: layer.label,
      sourceUrl: `${kaomBaseUrl}/si_yuwaiyin.php`,
    }
    const duplicate = japaneseReadings[character][layer.layerId].some((item) =>
      item.historicalForm === record.historicalForm && item.sourceNote === record.sourceNote)
    if (!duplicate) japaneseReadings[character][layer.layerId].push(record)
  })
}

const dialectBatches = Array.from({ length: Math.ceil(dialectCharacters.length / batchSize) }, (_, index) =>
  dialectCharacters.slice(index * batchSize, (index + 1) * batchSize))
for (const [index, batch] of dialectBatches.entries()) {
  await importDialectBatch(batch)
  process.stderr.write(`\rzi.tools 方言批次 ${index + 1}/${dialectBatches.length}`)
  if (index < dialectBatches.length - 1) await new Promise((resolveDelay) => setTimeout(resolveDelay, requestDelayMs))
}
process.stderr.write('\n')

for (const [index, character] of japaneseCharacters.entries()) {
  await importJapaneseCharacter(character)
  process.stderr.write(`\r古音小镜日语 ${index + 1}/${japaneseCharacters.length} ${character}`)
  if (index < japaneseCharacters.length - 1) await new Promise((resolveDelay) => setTimeout(resolveDelay, requestDelayMs))
}
process.stderr.write('\n')

const dialectRecordCount = Object.values(dialectReadings).reduce((characterTotal, layers) =>
  characterTotal + Object.values(layers).reduce((layerTotal, records) => layerTotal + records.length, 0), 0)
const japaneseRecordCount = Object.values(japaneseReadings).reduce((characterTotal, layers) =>
  characterTotal + Object.values(layers).reduce((layerTotal, records) => layerTotal + records.length, 0), 0)
const recordCount = dialectRecordCount + japaneseRecordCount
if (recordCount === 0) throw new Error('数据源未返回任何目标记录')

const metadata = {
  sourceName: 'zi.tools + 古音小镜',
  sourceUrl: `${ziToolsBaseUrl}/`,
  ziToolsSourceUrl: `${ziToolsBaseUrl}/api/yin/search/zi:{characters}/{books}`,
  japaneseSourceUrl: `${kaomBaseUrl}/si_yuwaiyin.php`,
  sourceAboutUrl: `${kaomBaseUrl}/admin_about.php`,
  retrievedAt: new Date().toISOString(),
  queryMode: 'zi.tools 批量结构化方言 API；古音小镜日语吴音、汉音、唐音查询',
  requestedDialectCharacters: dialectCharacters.length,
  requestedJapaneseCharacters: japaneseCharacters.length,
  issuedRequests,
  importedRecords: recordCount,
  importedDialectRecords: dialectRecordCount,
  importedJapaneseRecords: japaneseRecordCount,
  requestDelayMs,
  batchSize,
  relatedBooksBySeed,
  siteWarning: 'zi.tools 汇集多种音韵与方言资料，使用时须回查其来源列表和原始文献。',
  japaneseSourceNote: '古音小镜标注日本吴音、汉音、唐音来源为《漢字源》第五版，字表分享者为王赟（Maigo）。',
  rightsNote: '古音小镜原创内容声明采用 CC BY 4.0，但日语记录来自第三方材料；zi.tools 未见明确批量再发布许可。所有快照均保留来源，公开再利用前仍须核查原始来源及权利。',
  importWarnings,
}
const japaneseLayerIds = new Set(Object.values(japaneseLayerByLabel).map((layer) => layer.layerId))
const exportedLayerIds = [
  ...dialectBooks.filter((book) => book !== 'xiamen'),
  'xiamen-literary',
  'xiamen-colloquial',
  ...japaneseLayerIds,
]

await mkdir(outputDirectory, { recursive: true })
await writeFile(resolve(outputDirectory, 'metadata.json'), `${JSON.stringify(metadata)}\n`, 'utf8')
for (const layerId of exportedLayerIds) {
  const source = japaneseLayerIds.has(layerId) ? japaneseReadings : dialectReadings
  const readings = Object.fromEntries(Object.entries(source)
    .filter(([, layerMap]) => layerMap[layerId]?.length)
    .map(([character, layerMap]) => [character, layerMap[layerId]]))
  const layerRecordCount = Object.values(readings).reduce((total, records) => total + records.length, 0)
  const payload = {
    metadata: {
      layerId,
      sourceName: japaneseLayerIds.has(layerId) ? '古音小镜' : 'zi.tools',
      sourceUrl: japaneseLayerIds.has(layerId) ? metadata.japaneseSourceUrl : metadata.sourceUrl,
      retrievedAt: metadata.retrievedAt,
      importedRecords: layerRecordCount,
      sourceNote: japaneseLayerIds.has(layerId) ? metadata.japaneseSourceNote : metadata.siteWarning,
      rightsNote: metadata.rightsNote,
    },
    readings,
  }
  await writeFile(resolve(outputDirectory, `${layerId}.json`), `${JSON.stringify(payload)}\n`, 'utf8')
}
console.log(`写入 ${dialectRecordCount} 条方言读音、${japaneseRecordCount} 条日语读音：${outputDirectory}`)
