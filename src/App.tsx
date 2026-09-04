import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Initial, MatrixRow, PhonologySlot } from './domain'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowsLeftRight,
  MagnifyingGlass,
  Rows,
  SquaresFour,
} from '@phosphor-icons/react'
import { fetchLayerData, fetchQieyunData, findSlot, layers } from './data'
import { PhonologyMatrix } from './components/PhonologyMatrix'
import { FilterMenu } from './components/FilterMenu'
import { SlotDetail } from './components/SlotDetail'
import { useInterfaceStore } from './store'

const toneOptions = [
  { value: 'all', label: '全部' },
  { value: 'level', label: '平' },
  { value: 'rising', label: '上' },
  { value: 'departing', label: '去' },
  { value: 'entering', label: '入' },
] as const
const toneLabels: Record<string, string | undefined> = {
  all: undefined,
  level: '平',
  rising: '上',
  departing: '去',
  entering: '入',
}
const emptyInitials: Initial[] = []
const emptyRows: MatrixRow[] = []
const emptySlots: PhonologySlot[] = []
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

  const qieyunQuery = useQuery({
    queryKey: ['qieyun'],
    queryFn: fetchQieyunData,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const layerQuery = useQuery({
    queryKey: ['reflex-layer', activeLayer.id],
    queryFn: () => fetchLayerData(activeLayer.id),
    staleTime: Number.POSITIVE_INFINITY,
  })

  const initials = qieyunQuery.data?.initials ?? emptyInitials
  const rows = qieyunQuery.data?.rows ?? emptyRows
  const slots = qieyunQuery.data?.slots ?? emptySlots
  const slotById = useMemo(() => Object.fromEntries(slots.map((slot) => [slot.id, slot])), [slots])
  const rowById = useMemo(() => Object.fromEntries(rows.map((row) => [row.id, row])), [rows])
  const initialById = useMemo(() => Object.fromEntries(initials.map((initial) => [initial.id, initial])), [initials])
  const selectedSlot = slotById[selectedSlotId] ?? slots[0]
  const selectedRow = selectedSlot ? rowById[selectedSlot.rowId] : undefined
  const selectedInitial = selectedSlot ? initialById[selectedSlot.initialId] : undefined
  const rhymeGroupOptions = useMemo(() => [
    { value: 'all', label: '全部' },
    ...Array.from(new Map(rows.map((row) => [row.rhymeGroupId, row.she])).entries(), ([value, label]) => ({ value, label })),
  ], [rows])
  const visibleRows = useMemo(() => rows.filter((row) => {
    const selectedRhymeGroup = search.rhymeGroup === 'all' ? undefined : search.rhymeGroup
    const selectedTone = toneLabels[search.tone]
    const matchesRhymeGroup = !selectedRhymeGroup || row.rhymeGroupId === selectedRhymeGroup
    const matchesTone = !selectedTone || row.tone === selectedTone
    return matchesRhymeGroup && matchesTone
  }), [rows, search.rhymeGroup, search.tone])
  const activeRecordCount = layerQuery.data
    ? Object.values(layerQuery.data.reflexes).reduce((total, records) => total + records.length, 0)
    : 0

  const updateSearch = (next: Partial<typeof search>) => {
    navigate({
      to: '/',
      search: (previous) => ({ ...previous, ...next }),
      replace: true,
    })
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const match = findSlot(queryText, slots)
    if (!match) {
      setSearchMessage(slots.length === 0 ? '音韵数据仍在载入' : queryText.trim() ? `未找到“${queryText.trim()}”对应的格位` : '请输入字、格位 ID 或拟音')
      return
    }
    setSelectedSlot(match.id)
    setSearchMessage(`已定位 ${match.id} · ${match.representativeCharacter}`)
    updateSearch({ search: queryText.trim() })
  }

  return (
    <main className="app-shell">
      <div className="provenance-bar">
        <span>SOURCED DATA</span>
        <strong>
          {activeLayer.kind === 'middle-chinese'
            ? '《廣韻》格位据 TshetUinh.js；拟音为潘悟云 2023'
            : activeLayer.kind === 'dialect'
              ? '方言读音据 zi.tools 批量结构化接口；原始记录保留来源'
              : '吴音、汉音、唐音据古音小镜；原站标注来源《漢字源》第五版'}
        </strong>
        <span>{activeLayer.kind === 'middle-chinese' ? `QY ${qieyunQuery.data?.metadata.positions ?? '…'}` : `LAYER ${activeRecordCount}`}</span>
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
            disabled={!selectedSlot}
            onClick={() => {
              if (!selectedSlot) return
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
          <span><b>{activeLayer.kind === 'middle-chinese' ? slots.length : activeRecordCount}</b> {activeLayer.kind === 'middle-chinese' ? '格位' : '本层记录'}</span>
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
          {qieyunQuery.isError || layerQuery.isError ? (
            <div className="matrix-error" role="alert">
              <strong>音韵数据读取失败</strong>
              <span>请检查 public/data 下的生成数据。</span>
              <button type="button" onClick={() => Promise.all([qieyunQuery.refetch(), layerQuery.refetch()])}>重新载入</button>
            </div>
          ) : qieyunQuery.isPending || !selectedSlot ? (
            <div className="matrix-loading" aria-live="polite">
              <strong>正在读取完整《广韵》矩阵</strong>
              <span>数据与应用代码分开加载</span>
            </div>
          ) : (
            <PhonologyMatrix
              rows={visibleRows}
              initials={initials}
              slots={slots}
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

        {selectedSlot && selectedRow && selectedInitial && qieyunQuery.data && (
          <SlotDetail
            slot={selectedSlot}
            row={selectedRow}
            initial={selectedInitial}
            qieyunMetadata={qieyunQuery.data.metadata}
            activeLayer={activeLayer}
            activePayload={layerQuery.data}
            open={detailOpen}
          />
        )}
      </div>
    </main>
  )
}
