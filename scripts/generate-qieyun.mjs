import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import TshetUinh from 'tshet-uinh'
import { panwuyun } from 'tshet-uinh-examples'
import { pinyin } from 'pinyin-pro'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tshetUinhPackage = JSON.parse(await readFile(resolve(projectRoot, 'node_modules/tshet-uinh/package.json'), 'utf8'))
const examplesPackage = JSON.parse(await readFile(resolve(projectRoot, 'node_modules/tshet-uinh-examples/package.json'), 'utf8'))
const outputPath = resolve(projectRoot, 'src/data/qieyun.json')
const reconstruct = panwuyun({
  版本: '2023：漢語古音手冊',
  聲調記號: '隱藏',
})
const positions = Array.from(TshetUinh.資料.iter音韻地位())
const positionsByInitial = new Map()
const rowsByKey = new Map()
const slots = []

function commonPrefix(values) {
  if (values.length === 0) return ''
  let prefix = values[0]
  for (const value of values.slice(1)) {
    while (prefix && !value.startsWith(prefix)) prefix = prefix.slice(0, -1)
    if (!prefix) break
  }
  return prefix.normalize('NFC')
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
    },
    conditions: [position.清濁, `${position.等}等`, position.呼 ? `${position.呼}口` : '開合中立', position.類 ? `${position.類}類` : '', `${position.聲}聲`].filter(Boolean),
    fanqie,
    source: `《廣韻》（tshet-uinh ${tshetUinhPackage.version}）`,
    sourceIds,
  })
}

const initials = Array.from(positionsByInitial, ([label, items]) => {
  const initialReconstruction = commonPrefix(items.map((item) => item.reconstruction))
  const sample = items[0].position
  return {
    id: `initial-${label}`,
    label,
    reconstruction: initialReconstruction || label,
    place: sample.音,
    voicing: sample.清濁,
    aspiration: initialReconstruction.includes('ʰ') ? '送氣' : sample.清濁.includes('濁') ? '濁音' : '不送氣',
  }
})


const initialById = Object.fromEntries(initials.map((initial) => [initial.id, initial]))
for (const slot of slots) {
  slot.reconstruction.initial = initialById[slot.initialId]?.reconstruction
}
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
  rows: Array.from(rowsByKey.values()),
  slots,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`写入 ${slots.length} 个音韵地位、${rowsByKey.size} 行、${initials.length} 声母：${outputPath}`)
