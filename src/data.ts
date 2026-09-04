import kaomData from './data/kaom-reflexes.json'
import type {
  Initial,
  Layer,
  LayerPayload,
  MatrixRow,
  PhonologySlot,
  ReadingLayer,
  Reflex,
} from './domain'
 
interface ImportedKaomReading {
  ipa: string
  toneValue?: string
  toneCategory?: string
  readingLayer: ReadingLayer
  note?: string
  sourcePointId: string
  sourceLabel: string
  sourceUrl: string
}

interface ImportedKaomPayload {
  metadata: {
    sourceName: string
    sourceUrl: string
    sourceAboutUrl: string
    retrievedAt: string
    importedRecords: number
    siteWarning: string
    rightsNote: string
  }
  readings: Record<string, Record<string, ImportedKaomReading[]>>
}

const sourcedDialectData = kaomData as unknown as ImportedKaomPayload
export const kaomMetadata = sourcedDialectData.metadata

export const initials: Initial[] = [
  { id: 'bang', label: '帮', reconstruction: 'p', place: '双唇', voicing: '全清', aspiration: '不送气' },
  { id: 'pang', label: '滂', reconstruction: 'pʰ', place: '双唇', voicing: '次清', aspiration: '送气' },
  { id: 'bing', label: '並', reconstruction: 'b', place: '双唇', voicing: '全浊', aspiration: '浊音' },
  { id: 'ming', label: '明', reconstruction: 'm', place: '双唇', voicing: '次浊', aspiration: '鼻音' },
  { id: 'duan', label: '端', reconstruction: 't', place: '舌头', voicing: '全清', aspiration: '不送气' },
  { id: 'tou', label: '透', reconstruction: 'tʰ', place: '舌头', voicing: '次清', aspiration: '送气' },
  { id: 'ding', label: '定', reconstruction: 'd', place: '舌头', voicing: '全浊', aspiration: '浊音' },
  { id: 'ni', label: '泥', reconstruction: 'n', place: '舌头', voicing: '次浊', aspiration: '鼻音' },
  { id: 'jian', label: '見', reconstruction: 'k', place: '牙', voicing: '全清', aspiration: '不送气' },
  { id: 'xi', label: '溪', reconstruction: 'kʰ', place: '牙', voicing: '次清', aspiration: '送气' },
  { id: 'qun', label: '群', reconstruction: 'g', place: '牙', voicing: '全浊', aspiration: '浊音' },
  { id: 'yi', label: '疑', reconstruction: 'ŋ', place: '牙', voicing: '次浊', aspiration: '鼻音' },
]

export const rows: MatrixRow[] = [
  { id: 'tong-dong-1-he-ping', she: '通', rhyme: '東', grade: 1, openness: '合', tone: '平' },
  { id: 'tong-dong-1-he-shang', she: '通', rhyme: '東', grade: 1, openness: '合', tone: '上' },
  { id: 'tong-dong-1-he-qu', she: '通', rhyme: '東', grade: 1, openness: '合', tone: '去' },
  { id: 'tong-wu-1-he-ru', she: '通', rhyme: '屋', grade: 1, openness: '合', tone: '入' },
  { id: 'jiang-jiang-2-kai-ping', she: '江', rhyme: '江', grade: 2, openness: '开', tone: '平' },
  { id: 'jiang-jiang-2-kai-shang', she: '江', rhyme: '江', grade: 2, openness: '开', tone: '上' },
  { id: 'jiang-jiang-2-kai-qu', she: '江', rhyme: '江', grade: 2, openness: '开', tone: '去' },
  { id: 'jiang-jue-2-kai-ru', she: '江', rhyme: '覺', grade: 2, openness: '开', tone: '入' },
  { id: 'zhi-zhi-3-kai-ping', she: '止', rhyme: '支', grade: 3, openness: '开', tone: '平' },
  { id: 'zhi-zhi-3-kai-shang', she: '止', rhyme: '支', grade: 3, openness: '开', tone: '上' },
  { id: 'zhi-zhi-3-kai-qu', she: '止', rhyme: '支', grade: 3, openness: '开', tone: '去' },
  { id: 'yu-mo-1-kai-ping', she: '遇', rhyme: '模', grade: 1, openness: '开', tone: '平' },
  { id: 'yu-mo-1-kai-shang', she: '遇', rhyme: '模', grade: 1, openness: '开', tone: '上' },
  { id: 'yu-mo-1-kai-qu', she: '遇', rhyme: '模', grade: 1, openness: '开', tone: '去' },
  { id: 'xian-tan-1-kai-ping', she: '咸', rhyme: '覃', grade: 1, openness: '开', tone: '平' },
  { id: 'xian-tan-1-kai-shang', she: '咸', rhyme: '覃', grade: 1, openness: '开', tone: '上' },
  { id: 'xian-tan-1-kai-qu', she: '咸', rhyme: '覃', grade: 1, openness: '开', tone: '去' },
  { id: 'xian-he-1-kai-ru', she: '咸', rhyme: '合', grade: 1, openness: '开', tone: '入' },
]

export const layers: Layer[] = [
  { id: 'middle-chinese', label: '中古音系', shortLabel: '中古', kind: 'middle-chinese', group: '骨架', description: '切韵音系格位与拟音' },
  { id: 'beijing', label: '北京', shortLabel: '北京', kind: 'dialect', group: '官话', locality: '北京', description: '古音小镜 A069 · 北京市区' },
  { id: 'jinan', label: '济南', shortLabel: '济南', kind: 'dialect', group: '官话', locality: '济南', description: '古音小镜 A100 · 山东济南' },
  { id: 'shanghai', label: '上海', shortLabel: '上海', kind: 'dialect', group: '吴语', locality: '上海', description: '古音小镜 A004 · 上海宝山霜草墩' },
  { id: 'suzhou', label: '苏州', shortLabel: '苏州', kind: 'dialect', group: '吴语', locality: '苏州', description: '古音小镜 A030 · 江苏苏州一' },
  { id: 'guangzhou', label: '广州', shortLabel: '广州', kind: 'dialect', group: '粤语', locality: '广州', description: '古音小镜 A260 · 广东广州' },
  { id: 'xiamen-literary', label: '厦门 · 文读', shortLabel: '厦门文', kind: 'dialect', group: '闽语', locality: '厦门', description: '古音小镜 Y1109 · 厦门思明文读' },
  { id: 'xiamen-colloquial', label: '厦门 · 白读', shortLabel: '厦门白', kind: 'dialect', group: '闽语', locality: '厦门', description: '古音小镜 Y1109 · 厦门思明白读' },
  { id: 'fuzhou', label: '福州', shortLabel: '福州', kind: 'dialect', group: '闽语', locality: '福州', description: '古音小镜 Y0565 · 福州鼓楼' },
  { id: 'goon', label: '日语 · 吴音', shortLabel: '吴音', kind: 'japanese', group: '日语', description: '日本汉字音吴音层' },
  { id: 'kanon', label: '日语 · 汉音', shortLabel: '汉音', kind: 'japanese', group: '日语', description: '日本汉字音汉音层' },
  { id: 'toon', label: '日语 · 唐音', shortLabel: '唐音', kind: 'japanese', group: '日语', description: '日本汉字音唐音层' },
]

type Seed = [string, string, string, string[], string, string?, string?, string?]

const seeds: Seed[] = [
  ['tong-dong-1-he-ping', 'duan', '東', ['東', '菄', '鶇'], 'tuŋ', '', 'u', 'ŋ'],
  ['tong-dong-1-he-ping', 'tou', '通', ['通', '蓪'], 'tʰuŋ', '', 'u', 'ŋ'],
  ['tong-dong-1-he-ping', 'ding', '同', ['同', '銅', '桐', '童'], 'duŋ', '', 'u', 'ŋ'],
  ['tong-dong-1-he-ping', 'ming', '蒙', ['蒙', '濛', '朦'], 'muŋ', '', 'u', 'ŋ'],
  ['tong-dong-1-he-ping', 'jian', '公', ['公', '功', '工'], 'kuŋ', '', 'u', 'ŋ'],
  ['tong-dong-1-he-ping', 'xi', '空', ['空', '箜'], 'kʰuŋ', '', 'u', 'ŋ'],
  ['tong-dong-1-he-shang', 'duan', '董', ['董', '懂'], 'tuŋX', '', 'u', 'ŋ'],
  ['tong-dong-1-he-shang', 'ding', '動', ['動', '慟'], 'duŋX', '', 'u', 'ŋ'],
  ['tong-dong-1-he-shang', 'ming', '蠓', ['蠓', '懵'], 'muŋX', '', 'u', 'ŋ'],
  ['tong-dong-1-he-shang', 'xi', '孔', ['孔', '倥'], 'kʰuŋX', '', 'u', 'ŋ'],
  ['tong-dong-1-he-qu', 'duan', '凍', ['凍', '棟'], 'tuŋH', '', 'u', 'ŋ'],
  ['tong-dong-1-he-qu', 'tou', '痛', ['痛'], 'tʰuŋH', '', 'u', 'ŋ'],
  ['tong-dong-1-he-qu', 'ding', '洞', ['洞', '恫'], 'duŋH', '', 'u', 'ŋ'],
  ['tong-dong-1-he-qu', 'ming', '夢', ['夢'], 'muŋH', '', 'u', 'ŋ'],
  ['tong-dong-1-he-qu', 'jian', '貢', ['貢'], 'kuŋH', '', 'u', 'ŋ'],
  ['tong-wu-1-he-ru', 'ming', '木', ['木', '沐'], 'muk', '', 'u', 'k'],
  ['tong-wu-1-he-ru', 'tou', '禿', ['禿'], 'tʰuk', '', 'u', 'k'],
  ['tong-wu-1-he-ru', 'ding', '毒', ['毒', '獨'], 'duk', '', 'u', 'k'],
  ['tong-wu-1-he-ru', 'jian', '谷', ['谷', '穀'], 'kuk', '', 'u', 'k'],
  ['tong-wu-1-he-ru', 'xi', '酷', ['酷'], 'kʰuk', '', 'u', 'k'],
  ['jiang-jiang-2-kai-ping', 'bang', '邦', ['邦', '梆'], 'pɐŋ', '', 'ɐ', 'ŋ'],
  ['jiang-jiang-2-kai-ping', 'jian', '江', ['江', '杠'], 'kɐŋ', '', 'ɐ', 'ŋ'],
  ['jiang-jiang-2-kai-ping', 'xi', '腔', ['腔'], 'kʰɐŋ', '', 'ɐ', 'ŋ'],
  ['jiang-jiang-2-kai-shang', 'bing', '棒', ['棒', '棓'], 'bɐŋX', '', 'ɐ', 'ŋ'],
  ['jiang-jiang-2-kai-shang', 'jian', '講', ['講', '港'], 'kɐŋX', '', 'ɐ', 'ŋ'],
  ['jiang-jiang-2-kai-qu', 'ding', '撞', ['撞'], 'dɐŋH', '', 'ɐ', 'ŋ'],
  ['jiang-jue-2-kai-ru', 'bang', '博', ['博', '搏'], 'pɐk', '', 'ɐ', 'k'],
  ['jiang-jue-2-kai-ru', 'bing', '泊', ['泊', '薄'], 'bɐk', '', 'ɐ', 'k'],
  ['jiang-jue-2-kai-ru', 'ming', '莫', ['莫', '幕'], 'mɐk', '', 'ɐ', 'k'],
  ['jiang-jue-2-kai-ru', 'tou', '託', ['託', '拓'], 'tʰɐk', '', 'ɐ', 'k'],
  ['jiang-jue-2-kai-ru', 'ding', '鐸', ['鐸'], 'dɐk', '', 'ɐ', 'k'],
  ['jiang-jue-2-kai-ru', 'jian', '各', ['各', '閣'], 'kɐk', '', 'ɐ', 'k'],
  ['zhi-zhi-3-kai-ping', 'bang', '卑', ['卑', '碑'], 'pje', 'j', 'e', ''],
  ['zhi-zhi-3-kai-ping', 'bing', '皮', ['皮', '疲'], 'bje', 'j', 'e', ''],
  ['zhi-zhi-3-kai-ping', 'ming', '彌', ['彌', '瀰'], 'mje', 'j', 'e', ''],
  ['zhi-zhi-3-kai-ping', 'jian', '羈', ['羈'], 'kje', 'j', 'e', ''],
  ['zhi-zhi-3-kai-shang', 'bang', '彼', ['彼'], 'pjeX', 'j', 'e', ''],
  ['zhi-zhi-3-kai-shang', 'bing', '被', ['被'], 'bjeX', 'j', 'e', ''],
  ['zhi-zhi-3-kai-shang', 'ming', '靡', ['靡'], 'mjeX', 'j', 'e', ''],
  ['zhi-zhi-3-kai-shang', 'jian', '技', ['技'], 'gjeX', 'j', 'e', ''],
  ['zhi-zhi-3-kai-qu', 'bang', '臂', ['臂'], 'pjeH', 'j', 'e', ''],
  ['zhi-zhi-3-kai-qu', 'bing', '避', ['避'], 'bjeH', 'j', 'e', ''],
  ['zhi-zhi-3-kai-qu', 'ming', '寐', ['寐'], 'mjeH', 'j', 'e', ''],
  ['zhi-zhi-3-kai-qu', 'jian', '寄', ['寄'], 'kjeH', 'j', 'e', ''],
  ['yu-mo-1-kai-ping', 'bang', '逋', ['逋', '餔'], 'pu', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'pang', '鋪', ['鋪'], 'pʰu', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'bing', '蒲', ['蒲', '葡'], 'bu', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'ming', '模', ['模', '謨'], 'mu', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'duan', '都', ['都'], 'tu', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'ding', '徒', ['徒', '途'], 'du', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'ni', '奴', ['奴'], 'nu', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'jian', '姑', ['姑', '孤'], 'ku', '', 'u', ''],
  ['yu-mo-1-kai-ping', 'xi', '枯', ['枯'], 'kʰu', '', 'u', ''],
  ['yu-mo-1-kai-shang', 'bang', '補', ['補'], 'puX', '', 'u', ''],
  ['yu-mo-1-kai-shang', 'bing', '簿', ['簿'], 'buX', '', 'u', ''],
  ['yu-mo-1-kai-shang', 'duan', '堵', ['堵'], 'tuX', '', 'u', ''],
  ['yu-mo-1-kai-shang', 'jian', '古', ['古', '鼓'], 'kuX', '', 'u', ''],
  ['yu-mo-1-kai-qu', 'bang', '布', ['布'], 'puH', '', 'u', ''],
  ['yu-mo-1-kai-qu', 'ding', '度', ['度', '渡'], 'duH', '', 'u', ''],
  ['yu-mo-1-kai-qu', 'jian', '故', ['故', '固'], 'kuH', '', 'u', ''],
  ['xian-tan-1-kai-ping', 'ding', '談', ['談', '郯'], 'dəm', '', 'ə', 'm'],
  ['xian-tan-1-kai-ping', 'ni', '南', ['南', '男'], 'nəm', '', 'ə', 'm'],
  ['xian-tan-1-kai-ping', 'jian', '甘', ['甘', '柑'], 'kəm', '', 'ə', 'm'],
  ['xian-tan-1-kai-ping', 'xi', '堪', ['堪'], 'kʰəm', '', 'ə', 'm'],
  ['xian-tan-1-kai-shang', 'jian', '感', ['感', '敢'], 'kəmX', '', 'ə', 'm'],
  ['xian-tan-1-kai-shang', 'xi', '坎', ['坎'], 'kʰəmX', '', 'ə', 'm'],
  ['xian-tan-1-kai-qu', 'jian', '紺', ['紺'], 'kəmH', '', 'ə', 'm'],
  ['xian-tan-1-kai-qu', 'xi', '勘', ['勘'], 'kʰəmH', '', 'ə', 'm'],
  ['xian-he-1-kai-ru', 'bang', '帀', ['帀'], 'pəp', '', 'ə', 'p'],
  ['xian-he-1-kai-ru', 'ding', '踏', ['踏'], 'dəp', '', 'ə', 'p'],
]

const getInitialFromIpa = (ipa: string) => initials
  .slice()
  .sort((a, b) => b.reconstruction.length - a.reconstruction.length)
  .find((initial) => ipa.startsWith(initial.reconstruction))?.reconstruction

export const slots: PhonologySlot[] = seeds.map((seed, index) => {
  const [rowId, initialId, representativeCharacter, characters, ipa, medial, nucleus, coda] = seed
  const row = rows.find((item) => item.id === rowId)!
  const initial = initials.find((item) => item.id === initialId)!
  return {
    id: `C${String(index + 1).padStart(3, '0')}`,
    rowId,
    initialId,
    representativeCharacter,
    characters,
    reconstruction: {
      system: '界面示例拟音',
      initial: getInitialFromIpa(ipa) ?? initial.reconstruction,
      medial,
      nucleus,
      coda,
      ipa: `*${ipa}`,
    },
    conditions: [initial.voicing, initial.aspiration, `${row.grade}等`, `${row.openness}口`, `${row.tone}声`],
    note: '当前为界面演示数据，正式研究需补入审定音系与逐条文献来源。',
  }
})

export const slotById = Object.fromEntries(slots.map((slot) => [slot.id, slot]))
export const rowById = Object.fromEntries(rows.map((row) => [row.id, row]))
export const initialById = Object.fromEntries(initials.map((initial) => [initial.id, initial]))


const japaneseReadings: Record<string, { kana: string; romaji: string; ipa: string }> = {
  東: { kana: 'トウ', romaji: 'tō', ipa: 'toː' }, 通: { kana: 'ツウ', romaji: 'tsū', ipa: 'tsɯː' }, 同: { kana: 'ドウ', romaji: 'dō', ipa: 'doː' }, 蒙: { kana: 'モウ', romaji: 'mō', ipa: 'moː' }, 公: { kana: 'コウ', romaji: 'kō', ipa: 'koː' }, 空: { kana: 'クウ', romaji: 'kū', ipa: 'kɯː' },
  木: { kana: 'モク', romaji: 'moku', ipa: 'mokɯ' }, 毒: { kana: 'ドク', romaji: 'doku', ipa: 'dokɯ' }, 谷: { kana: 'コク', romaji: 'koku', ipa: 'kokɯ' }, 博: { kana: 'ハク', romaji: 'haku', ipa: 'hakɯ' }, 泊: { kana: 'ハク', romaji: 'haku', ipa: 'hakɯ' }, 各: { kana: 'カク', romaji: 'kaku', ipa: 'kakɯ' },
  江: { kana: 'コウ', romaji: 'kō', ipa: 'koː' }, 講: { kana: 'コウ', romaji: 'kō', ipa: 'koː' }, 皮: { kana: 'ヒ', romaji: 'hi', ipa: 'çi' }, 彌: { kana: 'ミ', romaji: 'mi', ipa: 'mi' }, 技: { kana: 'ギ', romaji: 'gi', ipa: 'gʲi' }, 模: { kana: 'モ', romaji: 'mo', ipa: 'mo' }, 都: { kana: 'ト', romaji: 'to', ipa: 'to' }, 古: { kana: 'コ', romaji: 'ko', ipa: 'ko' },
  南: { kana: 'ナン', romaji: 'nan', ipa: 'naɴ' }, 感: { kana: 'カン', romaji: 'kan', ipa: 'kaɴ' },
}

const makeSourcedDialectReflexes = (slot: PhonologySlot, layerId: string): Reflex[] => {
  const records = sourcedDialectData.readings[slot.representativeCharacter]?.[layerId] ?? []
  const row = rowById[slot.rowId]
  const initial = initialById[slot.initialId]
  return records.map((record) => ({
    slotId: slot.id,
    layerId,
    readingLayer: record.readingLayer,
    ipa: record.ipa,
    historicalTone: `${initial.voicing}${row.tone}`,
    toneCategory: record.toneCategory,
    toneValue: record.toneValue,
    citationTone: record.toneValue,
    source: `古音小镜 · ${record.sourceLabel}`,
    sourceUrl: record.sourceUrl,
    sourcePointId: record.sourcePointId,
    sourceNote: record.note,
  }))
}

const makeJapaneseReflex = (slot: PhonologySlot, layerId: string): Reflex | undefined => {
  const reading = japaneseReadings[slot.representativeCharacter]
  if (!reading) return undefined
  const typeLabel = layerId === 'goon' ? '吴音' : layerId === 'kanon' ? '汉音' : '唐音'
  const period = layerId === 'goon' ? '约 5 至 6 世纪' : layerId === 'kanon' ? '约 7 至 9 世纪' : '约 10 世纪以后'
  return {
    slotId: slot.id,
    layerId,
    readingLayer: '常读',
    ipa: reading.ipa,
    historicalTone: rowById[slot.rowId].tone,
    historicalForm: slot.reconstruction.ipa,
    historicalKana: reading.kana,
    kana: reading.kana,
    romaji: reading.romaji,
    borrowingPeriod: period,
    laterChanges: slot.reconstruction.coda === 'k' ? ['-k 以 -ku / -ki 音节形式受容', '日语内部元音与长音变化'] : ['汉语音节结构适配', `${typeLabel}层内部音变`],
    source: '界面演示数据，待文献校勘',
  }
}

const wait = (duration: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, duration)
  signal?.addEventListener('abort', () => {
    window.clearTimeout(timer)
    reject(new DOMException('Aborted', 'AbortError'))
  }, { once: true })
})

export async function fetchLayerData(layerId: string, signal?: AbortSignal): Promise<LayerPayload> {
  await wait(180, signal)
  const layer = layers.find((item) => item.id === layerId) ?? layers[0]
  const reflexes: Record<string, Reflex[]> = {}

  if (layer.kind === 'dialect') {
    slots.forEach((slot) => {
      const sourcedReflexes = makeSourcedDialectReflexes(slot, layer.id)
      if (sourcedReflexes.length > 0) reflexes[slot.id] = sourcedReflexes
    })
  }

  if (layer.kind === 'japanese') {
    slots.forEach((slot) => {
      const reflex = makeJapaneseReflex(slot, layer.id)
      if (reflex) reflexes[slot.id] = [reflex]
    })
  }

  return {
    layer,
    reflexes,
    updatedAt: layer.kind === 'dialect' ? kaomMetadata.retrievedAt.slice(0, 10) : '2026-09-04',
  }
}

export function findSlot(query: string) {
  const normalized = query.trim().normalize('NFC').toLocaleLowerCase()
  if (!normalized) return undefined
  return slots.find((slot) =>
    slot.id.toLocaleLowerCase() === normalized ||
    slot.representativeCharacter === normalized ||
    slot.characters.some((character) => character === normalized) ||
    slot.reconstruction.ipa.toLocaleLowerCase().includes(normalized),
  )
}
