import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import TshetUinh from 'tshet-uinh'
import { panwuyun } from 'tshet-uinh-examples'
import { pinyin } from 'pinyin-pro'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tshetUinhPackage = JSON.parse(await readFile(resolve(projectRoot, 'node_modules/tshet-uinh/package.json'), 'utf8'))
const examplesPackage = JSON.parse(await readFile(resolve(projectRoot, 'node_modules/tshet-uinh-examples/package.json'), 'utf8'))
const outputPath = resolve(projectRoot, 'public/data/qieyun.json')
const reconstruct = panwuyun({
  版本: '2023：漢語古音手冊',
  聲調記號: '隱藏',
})
const reconstructWithTone = panwuyun({
  版本: '2023：漢語古音手冊',
  聲調記號: '調值數字',
})
const graphemeSegmenter = new Intl.Segmenter('und', { granularity: 'grapheme' })
const consonantalCodas = new Set(['m', 'n', 'ŋ', 'p', 't', 'k'])
const positions = Array.from(TshetUinh.資料.iter音韻地位())
const positionsByInitial = new Map()
const rowsByKey = new Map()
const slots = []
const sheOrder = new Map()
const rhymeOrder = new Map()
for (const position of positions) {
  if (!sheOrder.has(position.攝)) sheOrder.set(position.攝, sheOrder.size)
  const rhymeKey = `${position.攝}\u0000${position.韻}`
  if (!rhymeOrder.has(rhymeKey)) rhymeOrder.set(rhymeKey, rhymeOrder.size)
}
const gradeOrder = new Map(['一', '二', '三', '四'].map((value, index) => [value, index]))
const opennessOrder = new Map(['中立', '開', '合'].map((value, index) => [value, index]))
const toneOrder = new Map(['平', '上', '去', '入'].map((value, index) => [value, index]))
const rhymeClassOrder = new Map(['', 'A', 'B', 'C'].map((value, index) => [value, index]))

function commonPrefix(values) {
  if (values.length === 0) return ''
  let prefix = values[0]
  for (const value of values.slice(1)) {
    while (prefix && !value.startsWith(prefix)) prefix = prefix.slice(0, -1)
    if (!prefix) break
  }
  return prefix.normalize('NFC')
}

function commonSuffix(values) {
  if (values.length === 0) return ''
  let suffix = values[0]
  for (const value of values.slice(1)) {
    while (suffix && !value.endsWith(suffix)) suffix = suffix.slice(1)
    if (!suffix) break
  }
  return suffix.normalize('NFC')
}

function decomposeReconstruction(fullReconstruction, initial) {
  const final = fullReconstruction.slice(initial.length)
  const graphemes = Array.from(graphemeSegmenter.segment(final), (segment) => segment.segment)
  const last = graphemes.at(-1) ?? ''
  const hasGlideCoda = (last === 'i' || last === 'u') && graphemes.length > 1
  const coda = consonantalCodas.has(last) || hasGlideCoda ? graphemes.pop() ?? '' : ''
  const nucleus = graphemes.pop() ?? ''
  return {
    medial: graphemes.join(''),
    nucleus,
    coda,
  }
}

for (const position of positions) {
  const entries = TshetUinh.資料.query音韻地位(position)
  if (entries.length === 0) continue
  const rowKey = [position.攝, position.韻, position.等, position.呼 ?? '中立', position.類 ?? '', position.聲].join('|')
  if (!rowsByKey.has(rowKey)) {
    rowsByKey.set(rowKey, {
      id: `R${String(rowsByKey.size + 1).padStart(4, '0')}`,
      she: position.攝,
      rhyme: position.韻,
      rhymeGroupId: pinyin(position.攝, { toneType: 'none', type: 'array' }).join('-'),
      grade: position.等,
      openness: position.呼 ?? '中立',
      rhymeClass: position.類 ?? undefined,
      chongniu: position.類 === 'A' || position.類 === 'B' ? position.類 : undefined,
      tone: position.聲,
    })
  }

  const reconstruction = reconstruct(position)
  const reconstructionWithTone = reconstructWithTone(position)
  const toneValue = reconstructionWithTone.slice(reconstruction.length).normalize('NFKC')
  positionsByInitial.set(position.母, [...(positionsByInitial.get(position.母) ?? []), { position, reconstruction }])
  const characters = Array.from(new Set(entries.map((entry) => entry.字頭)))
  const representativeCharacter = characters.find((character) => character.length === 1) ?? characters[0]
  const fanqie = Array.from(new Set(entries.map((entry) => entry.反切).filter(Boolean)))
  const sourceIds = Array.from(new Set(entries.map((entry) => entry.來源.小韻號)))
  const code = TshetUinh.壓縮表示.encode音韻編碼(position)
  const row = rowsByKey.get(rowKey)

  slots.push({
    id: `QY-${code}`,
    qieyunCode: code,
    rowId: row.id,
    initialId: `initial-${position.母}`,
    representativeCharacter,
    characters,
    reconstruction: {
      system: '潘悟雲 2023（tshet-uinh-examples）',
      ipa: `*${reconstruction}`,
      toneValue,
      toneSource: '潘悟雲 2023 方案沿用《漢語中古音》2013 调值',
    },
    conditions: [position.清濁, `${position.等}等`, position.呼 ? `${position.呼}口` : '開合中立', position.類 ? `${position.類}類` : '', `${position.聲}聲`].filter(Boolean),
    fanqie,
    source: `《廣韻》（tshet-uinh ${tshetUinhPackage.version}）`,
    sourceIds,
  })
}

const fallbackInitialById = Object.fromEntries(Array.from(positionsByInitial, ([label, items]) => [
  `initial-${label}`,
  commonPrefix(items.map((item) => item.reconstruction)),
]))
const slotsByRow = new Map()
for (const slot of slots) slotsByRow.set(slot.rowId, [...(slotsByRow.get(slot.rowId) ?? []), slot])
const initialFormsById = new Map()

for (const rowSlots of slotsByRow.values()) {
  const fullReconstructions = rowSlots.map((slot) => slot.reconstruction.ipa.slice(1))
  const sharedFinal = rowSlots.length > 1 ? commonSuffix(fullReconstructions) : ''
  for (const slot of rowSlots) {
    const fullReconstruction = slot.reconstruction.ipa.slice(1)
    const fallbackInitial = fallbackInitialById[slot.initialId] ?? ''
    const initial = sharedFinal && fullReconstruction.length > sharedFinal.length
      ? fullReconstruction.slice(0, -sharedFinal.length)
      : fallbackInitial
    const segments = decomposeReconstruction(fullReconstruction, initial)
    slot.reconstruction.initial = initial
    slot.reconstruction.medial = segments.medial
    slot.reconstruction.nucleus = segments.nucleus
    slot.reconstruction.coda = segments.coda
    initialFormsById.set(slot.initialId, [...(initialFormsById.get(slot.initialId) ?? []), initial])
  }
}

const initials = Array.from(positionsByInitial, ([label, items]) => {
  const forms = initialFormsById.get(`initial-${label}`) ?? []
  const initialReconstruction = commonPrefix(forms) || fallbackInitialById[`initial-${label}`] || label
  const sample = items[0].position
  return {
    id: `initial-${label}`,
    label,
    reconstruction: initialReconstruction,
    place: sample.音,
    voicing: sample.清濁,
    aspiration: initialReconstruction.includes('ʰ') ? '送氣' : sample.清濁.includes('濁') ? '濁音' : '不送氣',
  }
})
const sortedRows = Array.from(rowsByKey.values()).sort((left, right) => {
  const ranks = [
    (sheOrder.get(left.she) ?? Number.MAX_SAFE_INTEGER) - (sheOrder.get(right.she) ?? Number.MAX_SAFE_INTEGER),
    (rhymeOrder.get(`${left.she}\u0000${left.rhyme}`) ?? Number.MAX_SAFE_INTEGER) - (rhymeOrder.get(`${right.she}\u0000${right.rhyme}`) ?? Number.MAX_SAFE_INTEGER),
    (gradeOrder.get(left.grade) ?? Number.MAX_SAFE_INTEGER) - (gradeOrder.get(right.grade) ?? Number.MAX_SAFE_INTEGER),
    (opennessOrder.get(left.openness) ?? Number.MAX_SAFE_INTEGER) - (opennessOrder.get(right.openness) ?? Number.MAX_SAFE_INTEGER),
    (toneOrder.get(left.tone) ?? Number.MAX_SAFE_INTEGER) - (toneOrder.get(right.tone) ?? Number.MAX_SAFE_INTEGER),
    (rhymeClassOrder.get(left.rhymeClass ?? '') ?? Number.MAX_SAFE_INTEGER) - (rhymeClassOrder.get(right.rhymeClass ?? '') ?? Number.MAX_SAFE_INTEGER),
  ]
  return ranks.find((rank) => rank !== 0) ?? 0
})
const payload = {
  metadata: {
    sourceName: 'TshetUinh.js',
    sourceVersion: tshetUinhPackage.version,
    sourceUrl: 'https://github.com/nk2028/tshet-uinh-js',
    sourceLicense: 'MIT',
    reconstructionName: '潘悟雲 2023',
    reconstructionVersion: examplesPackage.version,
    reconstructionSourceUrl: 'https://github.com/nk2028/tshet-uinh-examples',
    reconstructionLicense: 'MIT',
    generatedAt: new Date().toISOString(),
    positions: slots.length,
    rows: rowsByKey.size,
    initials: initials.length,
  },
  initials,
  rows: sortedRows,
  slots,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(payload)}\n`, 'utf8')
console.log(`写入 ${slots.length} 个音韵地位、${rowsByKey.size} 行、${initials.length} 声母：${outputPath}`)
