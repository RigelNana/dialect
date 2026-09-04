import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowsLeftRight,
  MagnifyingGlass,
  Rows,
  SquaresFour,
} from '@phosphor-icons/react'
import { fetchLayerData, findSlot, kaomMetadata, layers, rows, slotById, slots } from './data'
import { PhonologyMatrix } from './components/PhonologyMatrix'
import { FilterMenu } from './components/FilterMenu'
import { SlotDetail } from './components/SlotDetail'
import { useInterfaceStore } from './store'

const rhymeGroupOptions = [
  { value: 'all', label: '全部' },
  { value: 'tong', label: '通' },
  { value: 'jiang', label: '江' },
  { value: 'zhi', label: '止' },
  { value: 'yu', label: '遇' },
  { value: 'xian', label: '咸' },
] as const
const toneOptions = [
  { value: 'all', label: '全部' },
  { value: 'level', label: '平' },
  { value: 'rising', label: '上' },
  { value: 'departing', label: '去' },
  { value: 'entering', label: '入' },
] as const
const rhymeGroupLabels: Record<string, string | undefined> = {
  all: undefined,
  tong: '通',
  jiang: '江',
  zhi: '止',
  yu: '遇',
  xian: '咸',
}
const toneLabels: Record<string, string | undefined> = {
  all: undefined,
  level: '平',
  rising: '上',
  departing: '去',
  entering: '入',
}
const layerGroups = ['骨架', '官话', '吴语', '粤语', '闽语', '日语']

export function App() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const [queryText, setQueryText] = useState(search.search)
  const [searchMessage, setSearchMessage] = useState('')
  const selectedSlotId = useInterfaceStore((state) => state.selectedSlotId)
  const setSelectedSlot = useInterfaceStore((state) => state.setSelectedSlot)
  const detailOpen = useInterfaceStore((state) => state.detailOpen)
  const cellDensity = useInterfaceStore((state) => state.cellDensity)
  const setDetailTab = useInterfaceStore((state) => state.setDetailTab)
  const setCellDensity = useInterfaceStore((state) => state.setCellDensity)
  const activeLayer = layers.find((layer) => layer.id === search.layer) ?? layers[0]
  const selectedSlot = slotById[selectedSlotId] ?? slots[0]

  const layerQuery = useQuery({
    queryKey: ['reflex-layer', activeLayer.id],
    queryFn: ({ signal }) => fetchLayerData(activeLayer.id, signal),
  })
  const activeRecordCount = layerQuery.data
    ? Object.values(layerQuery.data.reflexes).reduce((total, records) => total + records.length, 0)
    : 0

  const visibleRows = useMemo(() => rows.filter((row) => {
    const selectedRhymeGroup = rhymeGroupLabels[search.rhymeGroup]
    const selectedTone = toneLabels[search.tone]
    const matchesRhymeGroup = !selectedRhymeGroup || row.she === selectedRhymeGroup
    const matchesTone = !selectedTone || row.tone === selectedTone
    return matchesRhymeGroup && matchesTone
  }), [search.rhymeGroup, search.tone])

  const updateSearch = (next: Partial<typeof search>) => {
    navigate({
      to: '/',
      search: (previous) => ({ ...previous, ...next }),
      replace: true,
    })
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const match = findSlot(queryText)
    if (!match) {
      setSearchMessage(queryText.trim() ? `未找到“${queryText.trim()}”对应的格位` : '请输入字、格位 ID 或拟音')
      return
    }
    setSelectedSlot(match.id)
    setSearchMessage(`已定位 ${match.id} · ${match.representativeCharacter}`)
    updateSearch({ search: queryText.trim() })
  }

  return (
    <main className="app-shell">
      <div className="provenance-bar">
        <span>{activeLayer.kind === 'dialect' ? 'SOURCED REFLEXES' : 'INTERFACE PREVIEW'}</span>
        <strong>
          {activeLayer.kind === 'dialect'
            ? `方言读音据古音小镜指定语言点；原站提示自动切分未经校对`
            : '中古拟音与日语层仍为界面示例，未经校勘'}
        </strong>
        <span>{activeLayer.kind === 'dialect' ? `KAOM ${kaomMetadata.importedRecords}` : 'SCHEMA 0.1'}</span>
      </div>
      <header className="app-header">
        <div className="brand-lockup" aria-label="音格 中古音韵反射矩阵">
          <div className="brand-mark"><span>音</span><span>格</span></div>
          <div>
            <h1>中古音韵反射矩阵</h1>
            <p>Middle Chinese Reflex Atlas</p>
          </div>
        </div>

        <form className="global-search" role="search" onSubmit={submitSearch}>
          <MagnifyingGlass size={17} aria-hidden="true" />
          <input
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            aria-label="搜索字、格位或拟音"
            placeholder="查字 / 格位 / IPA"
          />
          <kbd>↵</kbd>
        </form>

        <div className="header-actions">
          <button
            type="button"
            className="header-action"
            onClick={() => {
              setDetailTab('reflexes')
              setSelectedSlot(selectedSlot.id)
            }}
          >
            <ArrowsLeftRight size={18} />
            <span>反射总览</span>
          </button>
        </div>
      </header>

      <section className="layer-workbench" aria-label="反射层选择">
        <div className="layer-context">
          <span>当前反射层</span>
          <strong>{activeLayer.label}</strong>
          <small>{activeLayer.description}</small>
        </div>
        <div className="layer-rail">
          {layerGroups.map((group) => (
            <div className="layer-group" key={group}>
              <span>{group}</span>
              <div>
                {layers.filter((layer) => layer.group === group).map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    className={activeLayer.id === layer.id ? 'is-active' : ''}
                    aria-pressed={activeLayer.id === layer.id}
                    onClick={() => updateSearch({ layer: layer.id })}
                  >
                    {layer.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="matrix-toolbar" aria-label="矩阵筛选与显示设置">
        <div className="filter-cluster">
          <FilterMenu
            label="摄"
            value={search.rhymeGroup}
            options={rhymeGroupOptions}
            onChange={(rhymeGroup) => updateSearch({ rhymeGroup })}
          />
          <FilterMenu
            label="调类"
            value={search.tone}
            options={toneOptions}
            onChange={(tone) => updateSearch({ tone })}
          />
          <button
            type="button"
            className="clear-filter"
            disabled={search.rhymeGroup === 'all' && search.tone === 'all'}
            onClick={() => updateSearch({ rhymeGroup: 'all', tone: 'all' })}
          >
            清除筛选
          </button>
        </div>

        <div className="matrix-summary" aria-live="polite">
          {searchMessage && <span className="search-message">{searchMessage}</span>}
          <span><b>{visibleRows.length}</b> 韵类行</span>
          <span><b>{activeLayer.kind === 'dialect' ? activeRecordCount : slots.length}</b> {activeLayer.kind === 'dialect' ? '本层实录' : '格位'}</span>
          <div className="density-control" aria-label="单元格密度">
            <button
              type="button"
              className={cellDensity === 'comfortable' ? 'is-active' : ''}
              onClick={() => setCellDensity('comfortable')}
              aria-label="舒展单元格"
              aria-pressed={cellDensity === 'comfortable'}
            ><SquaresFour size={16} /></button>
            <button
              type="button"
              className={cellDensity === 'compact' ? 'is-active' : ''}
              onClick={() => setCellDensity('compact')}
              aria-label="紧凑单元格"
              aria-pressed={cellDensity === 'compact'}
            ><Rows size={16} /></button>
          </div>
        </div>
      </section>

      <div className="research-surface">
        <section className="matrix-panel" aria-label="音韵矩阵工作区">
          {layerQuery.isError ? (
            <div className="matrix-error" role="alert">
              <strong>反射层读取失败</strong>
              <span>保留当前格位坐标，请重新载入这一层。</span>
              <button type="button" onClick={() => layerQuery.refetch()}>重新载入</button>
            </div>
          ) : (
            <PhonologyMatrix
              rows={visibleRows}
              layer={activeLayer}
              payload={layerQuery.data}
              selectedSlotId={selectedSlot.id}
              compact={cellDensity === 'compact'}
              loading={layerQuery.isPending}
              onSelect={setSelectedSlot}
            />
          )}
          <div className="matrix-legend" aria-label="矩阵图例">
            <span><i className="legend-selected" />当前格位</span>
            <span><i className="legend-filled" />已收反射</span>
            <span><i className="legend-empty" />资料待补</span>
            <span className="matrix-position">X 声母 · Y 韵类 · Z {activeLayer.shortLabel}</span>
          </div>
        </section>

        <SlotDetail
          slot={selectedSlot}
          activeLayer={activeLayer}
          activePayload={layerQuery.data}
          open={detailOpen}
        />
      </div>
    </main>
  )
}
