export type Tone = '平' | '上' | '去' | '入'
export type Openness = '開' | '合' | '中立'
export type Grade = '一' | '二' | '三' | '四'
export type LayerKind = 'middle-chinese' | 'dialect' | 'japanese'
export type ReadingLayer =
  | '常读'
  | '文读'
  | '白读'
  | '新文读'
  | '老文读'
  | '俗读'
  | '特殊读'
  | '连读变调'

export interface Initial {
  id: string
  label: string
  reconstruction: string
  place: string
  voicing: string
  aspiration: string
}

export interface MatrixRow {
  id: string
  she: string
  rhyme: string
  rhymeGroupId: string
  grade: Grade
  openness: Openness
  rhymeClass?: string
  chongniu?: 'A' | 'B'
  tone: Tone
}

export interface Reconstruction {
  system: string
  initial?: string
  medial?: string
  nucleus?: string
  coda?: string
  ipa: string
  toneValue?: string
  toneSource?: string
}

export interface PhonologySlot {
  id: string
  rowId: string
  initialId: string
  representativeCharacter: string
  characters: string[]
  reconstruction: Reconstruction
  conditions: string[]
  note?: string
  qieyunCode?: string
  fanqie?: string[]
  source?: string
  sourceIds?: string[]
}

export interface Reflex {
  slotId: string
  layerId: string
  readingLayer: ReadingLayer
  initial?: string
  medial?: string
  nucleus?: string
  coda?: string
  ipa?: string
  historicalTone: string
  toneCategory?: string
  toneValue?: string
  citationTone?: string
  sandhiTone?: string
  sandhiCondition?: string
  historicalForm?: string
  historicalKana?: string
  kana?: string
  romaji?: string
  borrowingPeriod?: string
  laterChanges?: string[]
  source?: string
  sourceUrl?: string
  sourcePointId?: string
  sourceNote?: string
}

export interface Layer {
  id: string
  label: string
  shortLabel: string
  kind: LayerKind
  group: string
  locality?: string
  description: string
}

export interface LayerPayload {
  layer: Layer
  reflexes: Record<string, Reflex[]>
  updatedAt: string
}
