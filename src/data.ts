import type {
  Initial,
  Layer,
  LayerPayload,
  MatrixRow,
  PhonologySlot,
  ReadingLayer,
  Reflex,
} from './domain'

export interface QieyunMetadata {
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

export interface QieyunPayload {
  metadata: QieyunMetadata
  initials: Initial[]
  rows: MatrixRow[]
  slots: PhonologySlot[]
}

interface ImportedDialectReading {
  initial?: string
  medial?: string
  nucleus?: string
  coda?: string
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

interface ImportedSourceLayerPayload {
  metadata: {
    layerId: string
    sourceName: string
    sourceUrl: string
    retrievedAt: string
    importedRecords: number
    sourceNote: string
    rightsNote: string
  }
  readings: Record<string, Array<ImportedDialectReading | ImportedJapaneseReading>>
}

export const layers: Layer[] = [
  { id: 'middle-chinese', label: '中古音系', shortLabel: '中古', kind: 'middle-chinese', group: '骨架', description: 'TshetUinh.js · 《广韵》完整音韵地位' },
  { id: 'beijing', label: '北京', shortLabel: '北京', kind: 'dialect', group: '官话', locality: '北京', description: 'zi.tools · 北京' },
  { id: 'jinan', label: '济南', shortLabel: '济南', kind: 'dialect', group: '官话', locality: '济南', description: 'zi.tools · 济南' },
  { id: 'shanghai', label: '上海', shortLabel: '上海', kind: 'dialect', group: '吴语', locality: '上海', description: 'zi.tools · 上海' },
  { id: 'suzhou', label: '苏州', shortLabel: '苏州', kind: 'dialect', group: '吴语', locality: '苏州', description: 'zi.tools · 苏州' },
  { id: 'guangzhou', label: '广州', shortLabel: '广州', kind: 'dialect', group: '粤语', locality: '广州', description: 'zi.tools · 广州' },
  { id: 'xiamen-literary', label: '厦门 · 文读', shortLabel: '厦门文', kind: 'dialect', group: '闽语', locality: '厦门', description: 'zi.tools · 厦门文读' },
  { id: 'xiamen-colloquial', label: '厦门 · 白读', shortLabel: '厦门白', kind: 'dialect', group: '闽语', locality: '厦门', description: 'zi.tools · 厦门白读' },
  { id: 'fuzhou', label: '福州', shortLabel: '福州', kind: 'dialect', group: '闽语', locality: '福州', description: 'zi.tools · 福州' },
  { id: 'goon', label: '日语 · 吴音', shortLabel: '吴音', kind: 'japanese', group: '日语', description: '古音小镜 Z101 · 《漢字源》第五版' },
  { id: 'kanon', label: '日语 · 汉音', shortLabel: '汉音', kind: 'japanese', group: '日语', description: '古音小镜 Z102 · 《漢字源》第五版' },
  { id: 'toon', label: '日语 · 唐音', shortLabel: '唐音', kind: 'japanese', group: '日语', description: '古音小镜 Z103 · 《漢字源》第五版' },
]

const dataBaseUrl = `${import.meta.env.BASE_URL}data/`
let qieyunRequest: Promise<QieyunPayload> | undefined
const sourceRequests = new Map<string, Promise<ImportedSourceLayerPayload>>()

async function fetchJson<Data>(filename: string): Promise<Data> {
  const response = await fetch(`${dataBaseUrl}${filename}`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`${filename} 加载失败：HTTP ${response.status}`)
  return response.json() as Promise<Data>
}

export function fetchQieyunData(): Promise<QieyunPayload> {
  qieyunRequest ??= fetchJson<QieyunPayload>('qieyun.json').catch((error) => {
    qieyunRequest = undefined
    throw error
  })
  return qieyunRequest
}

function fetchSourceLayerData(layerId: string): Promise<ImportedSourceLayerPayload> {
  const cached = sourceRequests.get(layerId)
  if (cached) return cached
  const request = fetchJson<ImportedSourceLayerPayload>(`layers/${layerId}.json`).catch((error) => {
    sourceRequests.delete(layerId)
    throw error
  })
  sourceRequests.set(layerId, request)
  return request
}

function makeDialectReflexes(
  slot: PhonologySlot,
  layerId: string,
  sourceData: ImportedSourceLayerPayload,
  rowById: Record<string, MatrixRow>,
  initialById: Record<string, Initial>,
): Reflex[] {
  const sourceCharacter = slot.characters.find((character) => sourceData.readings[character]?.length)
  if (!sourceCharacter) return []
  const records = sourceData.readings[sourceCharacter] as ImportedDialectReading[]
  const row = rowById[slot.rowId]
  const initial = initialById[slot.initialId]
  return records.map((record) => ({
    slotId: slot.id,
    layerId,
    readingLayer: record.readingLayer,
    character: record.sourceCharacter ?? sourceCharacter,
    initial: record.initial,
    medial: record.medial,
    nucleus: record.nucleus,
    coda: record.coda,
    ipa: record.ipa,
    historicalTone: `${initial.voicing}${row.tone}`,
    toneCategory: record.toneCategory,
    toneValue: record.toneValue,
    citationTone: record.toneValue,
    source: record.sourceLabel,
    sourceUrl: record.sourceUrl,
    sourcePointId: record.sourcePointId,
    sourceNote: record.note ?? sourceData.metadata.sourceNote,
  }))
}

function makeJapaneseReflexes(
  slot: PhonologySlot,
  layerId: string,
  sourceData: ImportedSourceLayerPayload,
  rowById: Record<string, MatrixRow>,
): Reflex[] {
  const records = (sourceData.readings[slot.representativeCharacter] ?? []) as ImportedJapaneseReading[]
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
    sourceNote: record.sourceNote ?? sourceData.metadata.sourceNote,
  }))
}

export async function fetchLayerData(layerId: string): Promise<LayerPayload> {
  const qieyun = await fetchQieyunData()
  const layer = layers.find((item) => item.id === layerId) ?? layers[0]
  const reflexes: Record<string, Reflex[]> = {}

  if (layer.kind === 'middle-chinese') {
    return { layer, reflexes, updatedAt: qieyun.metadata.generatedAt.slice(0, 10) }
  }

  const sourceData = await fetchSourceLayerData(layer.id)
  const rowById: Record<string, MatrixRow> = Object.fromEntries(qieyun.rows.map((row) => [row.id, row]))
  const initialById: Record<string, Initial> = Object.fromEntries(qieyun.initials.map((initial) => [initial.id, initial]))

  for (const slot of qieyun.slots) {
    const records = layer.kind === 'dialect'
      ? makeDialectReflexes(slot, layer.id, sourceData, rowById, initialById)
      : makeJapaneseReflexes(slot, layer.id, sourceData, rowById)
    if (records.length > 0) reflexes[slot.id] = records
  }

  return {
    layer,
    reflexes,
    updatedAt: sourceData.metadata.retrievedAt.slice(0, 10),
  }
}

export function findSlot(query: string, slots: PhonologySlot[]) {
  const normalized = query.trim().normalize('NFC').toLocaleLowerCase()
  if (!normalized) return undefined
  return slots.find((slot) =>
    slot.id.toLocaleLowerCase() === normalized ||
    slot.representativeCharacter.normalize('NFC') === normalized ||
    slot.characters.some((character) => character.normalize('NFC') === normalized) ||
    slot.reconstruction.ipa.toLocaleLowerCase().includes(normalized),
  )
}
