import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceBaseUrl = 'http://www.kaom.net'
const outputPath = resolve(projectRoot, 'src/data/kaom-reflexes.json')
const requestDelayMs = 400

const pointById = {
  A004: { layerIds: ['shanghai'], label: '吴语·上海宝山霜草墩' },
  A030: { layerIds: ['suzhou'], label: '吴语·江苏苏州一' },
  A069: { layerIds: ['beijing'], label: '燕京官话·北京北京市区' },
  A100: { layerIds: ['jinan'], label: '冀鲁官话·山东济南' },
  A260: { layerIds: ['guangzhou'], label: '粤语·广东广州' },
  Y0565: { layerIds: ['fuzhou'], label: '闽语·福州鼓楼' },
  Y1109: { layerIds: ['xiamen-literary', 'xiamen-colloquial'], label: '闽语·厦门思明' },
}

const sourceText = await readFile(resolve(projectRoot, 'src/data.ts'), 'utf8')
const characters = Array.from(sourceText.matchAll(/^\s+\['[^']+', '[^']+', '([^']+)'/gmu), (match) => match[1])
const wantedPointIds = new Set(Object.keys(pointById))
const readings = {}

function decodeTooltip(value) {
  try {
    return JSON.parse(`"${value}"`)
  } catch {
    return value.replaceAll('\\/', '/')
  }
}

function textFromTooltip(tooltip) {
  return tooltip
    .replace(/<br\s*\/?\s*>/giu, '\n')
    .replace(/<[^>]+>/gu, '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ')
}

function readingLayerFromNote(note) {
  if (note.includes('白')) return '白读'
  if (note.includes('文')) return '文读'
  if (note.includes('又')) return '特殊读'
  return '常读'
}

function destinationLayers(pointId, readingLayer) {
  if (pointId !== 'Y1109') return pointById[pointId].layerIds
  if (readingLayer === '白读') return ['xiamen-colloquial']
  if (readingLayer === '文读') return ['xiamen-literary']
  return []
}

function addReading(character, pointId, tooltip) {
  const point = pointById[pointId]
  const lines = textFromTooltip(tooltip).split('\n').map((line) => line.trim()).filter(Boolean)

  for (const line of lines.slice(1)) {
    const match = line.match(/^(.+?)：(.+?)‹([^›]+)›\s*(.*)$/u)
    if (!match || match[1] !== character) continue
    const [, , ipa, toneDescriptor, note] = match
    const [toneValue, ...toneCategoryParts] = toneDescriptor.split('-')
    const readingLayer = readingLayerFromNote(note)

    for (const layerId of destinationLayers(pointId, readingLayer)) {
      readings[character] ??= {}
      readings[character][layerId] ??= []
      const record = {
        ipa: ipa.normalize('NFC'),
        toneValue: toneValue || undefined,
        toneCategory: toneCategoryParts.join('-') || undefined,
        readingLayer,
        note: note || undefined,
        sourcePointId: pointId,
        sourceLabel: point.label,
        sourceUrl: `${sourceBaseUrl}/si_x8.php?c=${pointId}`,
      }
      const duplicate = readings[character][layerId].some((item) =>
        item.ipa === record.ipa &&
        item.toneValue === record.toneValue &&
        item.readingLayer === record.readingLayer &&
        item.note === record.note,
      )
      if (!duplicate) readings[character][layerId].push(record)
    }
  }
}

async function importCharacter(character) {
  const body = new URLSearchParams({
    word: character,
    mode: 'shengyun',
    yuyan: '',
    map: '畫出地圖',
  })
  const response = await fetch(`${sourceBaseUrl}/si_word8.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'RigelNana/dialect data importer; one request per 400ms; source attributed in output',
    },
    body,
  })
  if (!response.ok) throw new Error(`古音小镜查询 ${character} 失败：HTTP ${response.status}`)

  const html = await response.text()
  const entryPattern = /\{"name":"([^"]+)","symbol":[\s\S]*?,"value":\[(-?[0-9.]+),"?(-?[0-9.]+)"?,"((?:\\.|[^"])*)"\],"url":"([^"]+)"\}/gu
  let match
  const seenTooltips = new Set()
  while ((match = entryPattern.exec(html))) {
    const pointId = match[1]
    if (!wantedPointIds.has(pointId)) continue
    const tooltip = decodeTooltip(match[4])
    const dedupeKey = `${pointId}\u0000${tooltip}`
    if (seenTooltips.has(dedupeKey)) continue
    seenTooltips.add(dedupeKey)
    addReading(character, pointId, tooltip)
  }
}

for (const [index, character] of characters.entries()) {
  await importCharacter(character)
  process.stderr.write(`\r古音小镜 ${index + 1}/${characters.length} ${character}`)
  if (index < characters.length - 1) await new Promise((resolveDelay) => setTimeout(resolveDelay, requestDelayMs))
}
process.stderr.write('\n')

const recordCount = Object.values(readings).reduce((characterTotal, layers) =>
  characterTotal + Object.values(layers).reduce((layerTotal, records) => layerTotal + records.length, 0), 0)
if (recordCount === 0) throw new Error('古音小镜未返回任何目标语言点记录')

const payload = {
  metadata: {
    sourceName: '古音小镜',
    sourceUrl: `${sourceBaseUrl}/si_word.php`,
    sourceAboutUrl: `${sourceBaseUrl}/admin_about.php`,
    retrievedAt: new Date().toISOString(),
    queryMode: '音节（不含声调）地图查询',
    requestedCharacters: characters.length,
    importedRecords: recordCount,
    requestDelayMs,
    siteWarning: '古音小镜说明语言点表由程序自动切分，未经校对，可能带电子文件和技术瑕疵。',
    rightsNote: '古音小镜原创内容声明采用 CC BY 4.0；语言点记录可能来自第三方材料，使用时仍须核查原始来源及权利。',
    points: pointById,
  },
  readings,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`写入 ${recordCount} 条读音：${outputPath}`)
