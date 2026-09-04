import qieyunData from './data/qieyun.json'
import sourceData from './data/source-reflexes.json'
import type {
  Initial,
  Layer,
  LayerPayload,
  MatrixRow,
  PhonologySlot,
  ReadingLayer,
  Reflex,
} from './domain'

interface QieyunPayload {
  metadata: {
    sourceName: string
    sourceVersion: string
    sourceUrl: string
    sourceLicense: string
    reconstructionName: string
    reconstructionVersion: string
    reconstructionSourceUrl: string
    reconstructionLicense: string
    generatedAt: string
    positions: number
    rows: number
    initials: number
  }
  initials: Initial[]
  rows: MatrixRow[]
  slots: PhonologySlot[]
}

interface ImportedDialectReading {
  initial?: string
  ipa: string
  toneValue?: string
  toneCategory?: string
  readingLayer: ReadingLayer
  note?: string
  sourceCharacter?: string
  sourcePointId: string
  sourceLabel: string
  sourceUrl: string
}

interface ImportedJapaneseReading {
  historicalForm: string
  kana?: string
  romaji?: string
  sourceNote?: string
  sourcePointId: string
  sourceLabel: string
  sourceUrl: string
}

interface ImportedSourcePayload {
  metadata: {
    sourceName: string
    sourceUrl: string
    sourceAboutUrl: string
    retrievedAt: string
    importedRecords: number
    importedDialectRecords: number
    importedJapaneseRecords: number
    siteWarning: string
    japaneseSourceNote: string
    rightsNote: string
  }
  readings: Record<string, Record<string, ImportedDialectReading[]>>
  japaneseReadings: Record<string, Record<string, ImportedJapaneseReading[]>>
}

const qieyun = qieyunData as unknown as QieyunPayload
const sourcedReflexes = sourceData as unknown as ImportedSourcePayload

export const qieyunMetadata = qieyun.metadata
export const kaomMetadata = sourcedReflexes.metadata
export const initials = qieyun.initials
export const rows = qieyun.rows
export const slots = qieyun.slots
export const slotById: Record<string, PhonologySlot> = Object.fromEntries(slots.map((slot) => [slot.id, slot]))
export const rowById: Record<string, MatrixRow> = Object.fromEntries(rows.map((row) => [row.id, row]))
export const initialById: Record<string, Initial> = Object.fromEntries(initials.map((initial) => [initial.id, initial]))

export const layers: Layer[] = [
  { id: 'middle-chinese', label: '中古音系', shortLabel: '中古', kind: 'middle-chinese', group: '骨架', description: `《廣韻》${qieyunMetadata.positions} 个音韵地位` },
  { id: 'beijing', label: '北京', shortLabel: '北京', kind: 'dialect', group: '官话', locality: '北京', description: '古音小镜 + zi.tools · 北京' },
  { id: 'jinan', label: '济南', shortLabel: '济南', kind: 'dialect', group: '官话', locality: '济南', description: '古音小镜 + zi.tools · 济南' },
  { id: 'shanghai', label: '上海', shortLabel: '上海', kind: 'dialect', group: '吴语', locality: '上海', description: '古音小镜 + zi.tools · 上海' },
  { id: 'suzhou', label: '苏州', shortLabel: '苏州', kind: 'dialect', group: '吴语', locality: '苏州', description: '古音小镜 + zi.tools · 苏州' },
  { id: 'guangzhou', label: '广州', shortLabel: '广州', kind: 'dialect', group: '粤语', locality: '广州', description: '古音小镜 + zi.tools · 广州' },
  { id: 'xiamen-literary', label: '厦门 · 文读', shortLabel: '厦门文', kind: 'dialect', group: '闽语', locality: '厦门', description: '古音小镜 + zi.tools · 厦门文读' },
  { id: 'xiamen-colloquial', label: '厦门 · 白读', shortLabel: '厦门白', kind: 'dialect', group: '闽语', locality: '厦门', description: '古音小镜 + zi.tools · 厦门白读' },
  { id: 'fuzhou', label: '福州', shortLabel: '福州', kind: 'dialect', group: '闽语', locality: '福州', description: '古音小镜 + zi.tools · 福州' },
  { id: 'goon', label: '日语 · 吴音', shortLabel: '吴音', kind: 'japanese', group: '日语', description: '古音小镜 Z101 · 《漢字源》第五版' },
  { id: 'kanon', label: '日语 · 汉音', shortLabel: '汉音', kind: 'japanese', group: '日语', description: '古音小镜 Z102 · 《漢字源》第五版' },
  { id: 'toon', label: '日语 · 唐音', shortLabel: '唐音', kind: 'japanese', group: '日语', description: '古音小镜 Z103 · 《漢字源》第五版' },
]

const slotSearchIndex = new Map<string, PhonologySlot>()
for (const slot of slots) {
  slotSearchIndex.set(slot.id.toLocaleLowerCase(), slot)
  slotSearchIndex.set(slot.representativeCharacter.normalize('NFC'), slot)
  for (const character of slot.characters) {
    if (!slotSearchIndex.has(character.normalize('NFC'))) slotSearchIndex.set(character.normalize('NFC'), slot)
  }
}

function makeSourcedDialectReflexes(slot: PhonologySlot, layerId: string): Reflex[] {
  const records = sourcedReflexes.readings[slot.representativeCharacter]?.[layerId] ?? []
  const row = rowById[slot.rowId]
  const initial = initialById[slot.initialId]
  return records.map((record) => ({
    slotId: slot.id,
    layerId,
    readingLayer: record.readingLayer,
    initial: record.initial,
    ipa: record.ipa,
    historicalTone: `${initial.voicing}${row.tone}`,
    toneCategory: record.toneCategory,
    toneValue: record.toneValue,
    citationTone: record.toneValue,
    source: record.sourceLabel.startsWith('zi.tools') ? record.sourceLabel : `古音小镜 · ${record.sourceLabel}`,
    sourceUrl: record.sourceUrl,
    sourcePointId: record.sourcePointId,
    sourceNote: record.note,
  }))
}

function makeSourcedJapaneseReflexes(slot: PhonologySlot, layerId: string): Reflex[] {
  const records = sourcedReflexes.japaneseReadings[slot.representativeCharacter]?.[layerId] ?? []
  return records.map((record) => ({
    slotId: slot.id,
    layerId,
    readingLayer: '常读',
    historicalTone: rowById[slot.rowId].tone,
    historicalForm: record.historicalForm,
    historicalKana: record.kana,
    kana: record.kana,
    romaji: record.romaji,
    source: `古音小镜 · ${record.sourceLabel}`,
    sourceUrl: record.sourceUrl,
    sourcePointId: record.sourcePointId,
    sourceNote: record.sourceNote,
  }))
}

const wait = (duration: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, duration)
  signal?.addEventListener('abort', () => {
    window.clearTimeout(timer)
    reject(new DOMException('Aborted', 'AbortError'))
  }, { once: true })
})

export async function fetchLayerData(layerId: string, signal?: AbortSignal): Promise<LayerPayload> {
  await wait(120, signal)
  const layer = layers.find((item) => item.id === layerId) ?? layers[0]
  const reflexes: Record<string, Reflex[]> = {}

  if (layer.kind === 'dialect') {
    for (const slot of slots) {
      const records = makeSourcedDialectReflexes(slot, layer.id)
      if (records.length > 0) reflexes[slot.id] = records
    }
  } else if (layer.kind === 'japanese') {
    for (const slot of slots) {
      const records = makeSourcedJapaneseReflexes(slot, layer.id)
      if (records.length > 0) reflexes[slot.id] = records
    }
  }

  return {
    layer,
    reflexes,
    updatedAt: layer.kind === 'middle-chinese' ? qieyunMetadata.generatedAt.slice(0, 10) : kaomMetadata.retrievedAt.slice(0, 10),
  }
}

export function findSlot(query: string) {
  const normalized = query.trim().normalize('NFC').toLocaleLowerCase()
  if (!normalized) return undefined
  return slotSearchIndex.get(normalized) ?? slots.find((slot) => slot.reconstruction.ipa.toLocaleLowerCase().includes(normalized))
}
