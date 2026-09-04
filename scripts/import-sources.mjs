import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import { toKatakana } from 'wanakana'
import { z } from 'zod'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceBaseUrl = 'http://www.kaom.net'
const ziToolsBaseUrl = 'https://zi.tools'
const outputPath = resolve(projectRoot, 'src/data/source-reflexes.json')
const requestDelayMs = 400
const sourceRetryLimit = 3



const japaneseLayerByLabel = {
  日本吳音: { layerId: 'goon', sourcePointId: 'Z101', label: '日本吴音·《漢字源》第五版' },
  日本漢音: { layerId: 'kanon', sourcePointId: 'Z102', label: '日本汉音·《漢字源》第五版' },
  日本唐音: { layerId: 'toon', sourcePointId: 'Z103', label: '日本唐音·《漢字源》第五版' },
}

const ziToolsBookByLayer = {
  beijing: 'beijing',
  jinan: 'jinan',
  shanghai: 'shanghai',
  suzhou: 'suzhou',
  guangzhou: 'guangzhou',
  fuzhou: 'fuzhou',
}
const ziToolsRowSchema = z.object({
  con: z.string().optional(),
  id: z.string(),
  note: z.string().optional(),
  syl: z.string().optional(),
  ton: z.string().optional(),
  vow: z.string().optional(),
  zi: z.string().optional(),
}).passthrough()
const ziToolsResponseSchema = z.object({
  yi: z.object({
    yin: z.object({
      boks: z.record(z.string(), z.array(z.string())),
      rows: z.record(z.string(), ziToolsRowSchema),
      zibokrows: z.record(z.string(), z.record(z.string(), z.array(z.string()))),
    }),
  }),
})

const qieyunData = JSON.parse(await readFile(resolve(projectRoot, 'src/data/qieyun.json'), 'utf8'))
const allCharacters = Array.from(new Set(qieyunData.slots.map((slot) => slot.representativeCharacter)))
const importLimit = Number.parseInt(process.env.IMPORT_LIMIT ?? '70', 10)
const characters = Number.isFinite(importLimit) && importLimit > 0 ? allCharacters.slice(0, importLimit) : allCharacters
const readings = {}
const japaneseReadings = {}
let issuedRequests = 0
const importWarnings = []


function readingLayerFromNote(note) {
  if (note.includes('白')) return '白读'
  if (note.includes('文')) return '文读'
  if (note.includes('又')) return '特殊读'
  return '常读'
}


function storeDialectRecord(character, layerId, record) {
  readings[character] ??= {}
  readings[character][layerId] ??= []
  const existing = readings[character][layerId].find((item) =>
    item.ipa === record.ipa && item.readingLayer === record.readingLayer)
  if (!existing) {
    readings[character][layerId].push(record)
    return
  }
  if (!existing.toneValue && record.toneValue) existing.toneValue = record.toneValue
  if (!existing.toneCategory && record.toneCategory) existing.toneCategory = record.toneCategory
}


async function loadZiToolsCharacter(character) {
  for (let attempt = 1; attempt <= sourceRetryLimit; attempt += 1) {
    try {
      issuedRequests += 1
      const response = await fetch(`${ziToolsBaseUrl}/api/zi/${encodeURIComponent(character)}`, {
        headers: {
          'User-Agent': 'RigelNana/dialect data importer; structured API snapshot with source attribution',
        },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const parsed = ziToolsResponseSchema.safeParse(await response.json())
      if (parsed.success) return parsed.data
      throw new Error(parsed.error.issues[0]?.message ?? 'schema mismatch')
    } catch (error) {
      if (attempt < sourceRetryLimit) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, requestDelayMs * attempt))
        continue
      }
      importWarnings.push(`zi.tools ${character}: ${String(error)}`)
    }
  }
  return undefined
}

async function importZiToolsCharacter(character) {
  const data = await loadZiToolsCharacter(character)
  if (!data) return
  const { boks, rows: sourceRows, zibokrows } = data.yi.yin
  const rowIdsByBook = zibokrows[character] ?? {}

  for (const [layerId, bookKey] of Object.entries(ziToolsBookByLayer)) {
    for (const rowId of rowIdsByBook[bookKey] ?? []) {
      const row = sourceRows[rowId]
      if (!row?.syl) continue
      storeDialectRecord(character, layerId, {
        initial: row.con,
        ipa: row.syl.normalize('NFC'),
        toneCategory: row.ton,
        readingLayer: readingLayerFromNote(row.note ?? ''),
        note: row.note || undefined,
        sourceCharacter: row.zi ?? character,
        sourcePointId: row.id,
        sourceLabel: `zi.tools · ${(boks[bookKey] ?? [bookKey]).join(' · ')}`,
        sourceUrl: `${ziToolsBaseUrl}/zi/${encodeURIComponent(character)}`,
      })
    }
  }

  for (const rowId of rowIdsByBook.xiamen ?? []) {
    const row = sourceRows[rowId]
    if (!row?.syl) continue
    const readingLayer = readingLayerFromNote(row.note ?? '')
    const layerIds = readingLayer === '文读'
      ? ['xiamen-literary']
      : readingLayer === '白读'
        ? ['xiamen-colloquial']
        : ['xiamen-literary', 'xiamen-colloquial']
    for (const layerId of layerIds) {
      storeDialectRecord(character, layerId, {
        initial: row.con,
        ipa: row.syl.normalize('NFC'),
        toneCategory: row.ton,
        readingLayer,
        note: row.note || undefined,
        sourceCharacter: row.zi ?? character,
        sourcePointId: row.id,
        sourceLabel: `zi.tools · ${(boks.xiamen ?? ['xiamen']).join(' · ')}`,
        sourceUrl: `${ziToolsBaseUrl}/zi/${encodeURIComponent(character)}`,
      })
    }
  }
}

async function importJapaneseCharacter(character) {
  const body = new URLSearchParams({ word: character })
  issuedRequests += 1
  const response = await fetch(`${sourceBaseUrl}/si_yuwaiyin8.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'RigelNana/dialect data importer; one request per 400ms; source attributed in output',
    },
    body,
  })
  if (!response.ok) throw new Error(`古音小镜日语查询 ${character} 失败：HTTP ${response.status}`)

  const html = await response.text()
  const $ = load(html)
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
      sourceUrl: `${sourceBaseUrl}/si_yuwaiyin.php`,
    }
    const duplicate = japaneseReadings[character][layer.layerId].some((item) =>
      item.historicalForm === record.historicalForm && item.sourceNote === record.sourceNote)
    if (!duplicate) japaneseReadings[character][layer.layerId].push(record)
  })
}

const totalRequests = characters.length * 2
let completedRequests = 0
for (const character of characters) {
  await importZiToolsCharacter(character)
  completedRequests += 1
  process.stderr.write(`\r资料导入 ${completedRequests}/${totalRequests} zi.tools ${character}`)
  await new Promise((resolveDelay) => setTimeout(resolveDelay, requestDelayMs))

  await importJapaneseCharacter(character)
  completedRequests += 1
  process.stderr.write(`\r资料导入 ${completedRequests}/${totalRequests} 古音小镜日语 ${character}`)
  if (completedRequests < totalRequests) await new Promise((resolveDelay) => setTimeout(resolveDelay, requestDelayMs))
}
process.stderr.write('\n')

const dialectRecordCount = Object.values(readings).reduce((characterTotal, layers) =>
  characterTotal + Object.values(layers).reduce((layerTotal, records) => layerTotal + records.length, 0), 0)
const japaneseRecordCount = Object.values(japaneseReadings).reduce((characterTotal, layers) =>
  characterTotal + Object.values(layers).reduce((layerTotal, records) => layerTotal + records.length, 0), 0)
const recordCount = dialectRecordCount + japaneseRecordCount
if (recordCount === 0) throw new Error('数据源未返回任何目标记录')

const payload = {
  metadata: {
    sourceName: 'zi.tools + 古音小镜',
    sourceUrl: `${ziToolsBaseUrl}/`,
    ziToolsSourceUrl: `${ziToolsBaseUrl}/api/zi/{character}`,
    japaneseSourceUrl: `${sourceBaseUrl}/si_yuwaiyin.php`,
    sourceAboutUrl: `${sourceBaseUrl}/admin_about.php`,
    retrievedAt: new Date().toISOString(),
    queryMode: 'zi.tools 结构化字音 API；古音小镜日语吴音、汉音、唐音查询',
    requestedCharacters: characters.length,
    issuedRequests,
    importedRecords: recordCount,
    importedDialectRecords: dialectRecordCount,
    importedJapaneseRecords: japaneseRecordCount,
    requestDelayMs,
    siteWarning: 'zi.tools 汇集多种音韵与方言资料，使用时须回查其来源列表和原始文献。',
    japaneseSourceNote: '古音小镜标注日本吴音、汉音、唐音来源为《漢字源》第五版，字表分享者为王赟（Maigo）。',
    rightsNote: '古音小镜原创内容声明采用 CC BY 4.0，但语言点与日语记录来自第三方材料；zi.tools 未见明确批量再发布许可。所有快照均保留来源，公开再利用前仍须核查原始来源及权利。',
    importWarnings,
  },
  readings,
  japaneseReadings,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`写入 ${recordCount} 条读音：${outputPath}`)
