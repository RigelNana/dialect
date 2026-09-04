import { useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
  BookOpenText,
  BracketsCurly,
  GitBranch,
  MapPinLine,
  X,
} from '@phosphor-icons/react'
import type { Initial, Layer, LayerPayload, MatrixRow, PhonologySlot } from '../domain'
import { fetchLayerData, layers } from '../data'
import type { QieyunMetadata } from '../data'
import { useInterfaceStore, type DetailTab } from '../store'
import { ToneContour } from './ToneContour'

interface SlotDetailProps {
  slot: PhonologySlot
  row: MatrixRow
  initial: Initial
  qieyunMetadata: QieyunMetadata
  activeLayer: Layer
  activePayload?: LayerPayload
  open: boolean
}

const comparisonLayerIds = ['beijing', 'shanghai', 'guangzhou', 'xiamen-literary', 'xiamen-colloquial', 'fuzhou', 'goon', 'kanon', 'toon']
const detailTabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'position', label: '格位详情' },
  { id: 'reflexes', label: '反射总览' },
  { id: 'development', label: '演变链' },
]
const displaySegment = (segment: string | undefined) => segment === undefined ? '未分解' : segment || '∅'

export function SlotDetail({ slot, row, initial, qieyunMetadata, activeLayer, activePayload, open }: SlotDetailProps) {
  const closeDetail = useInterfaceStore((state) => state.closeDetail)
  const detailTab = useInterfaceStore((state) => state.detailTab)
  const setDetailTab = useInterfaceStore((state) => state.setDetailTab)
  const sheetRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const activeReflexes = activePayload?.reflexes[slot.id] ?? []
  const activeReflex = activeReflexes[0]
  const layerQueries = useQueries({
    queries: comparisonLayerIds.map((layerId) => ({
      queryKey: ['reflex-layer', layerId],
      queryFn: () => fetchLayerData(layerId),
      staleTime: Number.POSITIVE_INFINITY,
      enabled: open && detailTab === 'reflexes',
    })),
  })

  useLayoutEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      wasOpenRef.current = true
      closeButtonRef.current?.focus()
      return
    }

    if (wasOpenRef.current) {
      const previousFocus = previousFocusRef.current
      previousFocusRef.current = null
      wasOpenRef.current = false
      previousFocus?.focus()
    }
  }, [open])

  const handleSheetKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!open) return
    if (event.key === 'Escape') {
      event.preventDefault()
      closeDetail()
      return
    }
    if (event.key !== 'Tab') return

    const focusable = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? []).filter((element) => element.offsetParent !== null)
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) {
      event.preventDefault()
      return
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className={`detail-modal${open ? ' is-open' : ''}`}
      aria-hidden={!open}
      onMouseDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.classList.contains('detail-modal-backdrop')) closeDetail()
      }}
    >
      <div className="detail-modal-backdrop" aria-hidden="true" />
      <aside
        ref={sheetRef}
        className="slot-detail"
        role="dialog"
        aria-modal="true"
        aria-label={`${slot.id} 格位详情`}
        onKeyDown={handleSheetKeyDown}
      >
      <header className="detail-header">
        <div className="detail-id-block">
          <span className="detail-id">{slot.id}</span>
          <span className="detail-status"><span />格位已对齐</span>
        </div>
        <button ref={closeButtonRef} type="button" className="icon-button detail-close" onClick={closeDetail} aria-label="关闭格位详情">
          <X size={18} weight="regular" />
        </button>
        <div className="detail-title-row">
          <span className="detail-character">{slot.representativeCharacter}</span>
          <div>
            <strong className="ipa">{slot.reconstruction.ipa}</strong>
            <span>{initial.label}母 · {row.rhyme}韵 · {row.tone}声</span>
          </div>
        </div>
      </header>

      <nav className="detail-tabs" aria-label="详情分区">
        {detailTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={detailTab === tab.id ? 'is-active' : ''}
            onClick={() => setDetailTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="detail-scroll">
        {detailTab === 'position' && (
          <div className="detail-layout detail-layout-position">
            <section className="detail-section">
              <div className="section-heading">
                <BracketsCurly size={17} />
                <h2>中古音韵地位</h2>
              </div>
              <dl className="position-grid">
                <div><dt>声母</dt><dd>{initial.label} <span className="ipa">/{initial.reconstruction}/</span></dd></div>
                <div><dt>清浊</dt><dd>{initial.voicing}</dd></div>
                <div><dt>摄</dt><dd>{row.she}</dd></div>
                <div><dt>韵</dt><dd>{row.rhyme}</dd></div>
                <div><dt>等</dt><dd>{row.grade}等</dd></div>
                <div><dt>呼</dt><dd>{row.openness === '中立' ? '开合中立' : `${row.openness}口`}</dd></div>
                <div><dt>类</dt><dd>{row.rhymeClass ? `${row.rhymeClass}类` : '不分'}</dd></div>
                <div><dt>重纽</dt><dd>{row.chongniu ?? '不适用'}</dd></div>
                <div><dt>调</dt><dd>{row.tone}</dd></div>
                <div><dt>反切</dt><dd>{slot.fanqie?.join('、') || '原书未注'}</dd></div>
                <div><dt>编码</dt><dd>{slot.qieyunCode}</dd></div>
                <div><dt>小韵</dt><dd>{slot.sourceIds?.join('、')}</dd></div>
              </dl>
            </section>

            <section className="detail-section">
              <div className="section-heading">
                <GitBranch size={17} />
                <h2>拟音分解</h2>
                <span>{slot.reconstruction.system}</span>
              </div>
              <div className="segment-strip" aria-label="拟音音段分解">
                <div><span>声母</span><strong className="ipa">{displaySegment(slot.reconstruction.initial)}</strong></div>
                <div><span>介音</span><strong className="ipa">{displaySegment(slot.reconstruction.medial)}</strong></div>
                <div><span>韵核</span><strong className="ipa">{displaySegment(slot.reconstruction.nucleus)}</strong></div>
                <div><span>韵尾</span><strong className="ipa">{displaySegment(slot.reconstruction.coda)}</strong></div>
              </div>
              <div className="full-reconstruction">
                <span>完整拟音</span>
                <strong className="ipa">{slot.reconstruction.ipa}</strong>
              </div>
              <div className="tone-study middle-tone">
                <div>
                  <span>中古调类</span>
                  <strong>{row.tone}声</strong>
                </div>
                <ToneContour value={slot.reconstruction.toneValue} />
                <div>
                  <span>五度标记走向</span>
                  <strong>{slot.reconstruction.toneValue}</strong>
                  <small>{slot.reconstruction.toneSource}</small>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <div className="section-heading">
                <BookOpenText size={17} />
                <h2>代表字与所属字</h2>
              </div>
              <div className="character-members">
                {slot.characters.map((character, index) => (
                  <span key={character} className={index === 0 ? 'is-representative' : ''}>{character}</span>
                ))}
              </div>
              {slot.note && <p className="detail-note">{slot.note}</p>}
              <div className="source-record">
                <span>中古资料来源</span>
                <strong>{slot.source}</strong>
                <small>音韵地位与字表由 TshetUinh.js 内置《广韵》资料生成，拟音采用潘悟云 2023 方案。</small>
                <a href={qieyunMetadata.sourceUrl} target="_blank" rel="noreferrer">查看 TshetUinh.js</a>
              </div>
            </section>
          </div>
        )}

        {detailTab === 'reflexes' && (
          <section className="detail-section reflex-section">
            <div className="section-heading">
              <MapPinLine size={17} />
              <h2>同一格位的各层反射</h2>
            </div>
            <div className="reflex-table" role="table" aria-label="各层反射">
              <div role="row" className="reflex-table-header">
                <span role="columnheader">层</span><span role="columnheader">读音</span><span role="columnheader">调类 / 层次</span>
              </div>
              {layerQueries.map((query, index) => {
                const layerId = comparisonLayerIds[index]
                const layer = layers.find((item) => item.id === layerId)!
                const reflexes = query.data?.reflexes[slot.id] ?? []

                if (query.isPending || reflexes.length === 0) {
                  return (
                    <div role="row" className="reflex-table-row" key={layerId}>
                      <span role="cell"><b>{layer.shortLabel}</b><small>{layer.group}</small></span>
                      <span role="cell" className="ipa">{query.isPending ? '读取中' : '未收'}</span>
                      <span role="cell">{query.isPending ? '正在套印' : '资料待补'}</span>
                    </div>
                  )
                }

                return reflexes.map((reflex, reflexIndex) => (
                  <div role="row" className="reflex-table-row" key={`${layerId}-${reflex.readingLayer}-${reflexIndex}`}>
                    <span role="cell">
                      <b>{layer.shortLabel}</b>
                      <small>{reflex.readingLayer}{reflex.character && reflex.character !== slot.representativeCharacter ? ` · 字例${reflex.character}` : ''}</small>
                    </span>
                    <span role="cell" className="ipa">
                      {layer.kind === 'japanese'
                        ? reflex.historicalForm ?? reflex.romaji ?? '未标'
                        : `[${reflex.ipa ?? '未标'}]`}
                    </span>
                    <span role="cell">
                      {layer.kind === 'japanese'
                        ? `${reflex.kana ?? ''} ${reflex.romaji ?? ''}`
                        : `${reflex.toneCategory ?? ''} ${reflex.toneValue ?? ''}`}
                      {reflex.sandhiCondition && <small>{reflex.sandhiCondition}</small>}
                      {reflex.sourceUrl && (
                        <a className="source-link" href={reflex.sourceUrl} target="_blank" rel="noreferrer">
                          来源 {reflex.sourcePointId}
                        </a>
                      )}
                    </span>
                  </div>
                ))
              })}
            </div>
          </section>
        )}

        {detailTab === 'development' && (
          <section className="detail-section development-section">
            <div className="section-heading">
              <GitBranch size={17} />
              <h2>{activeLayer.label}演变链</h2>
            </div>
            <div className="development-chain">
              <div className="chain-node">
                <span>中古格位</span>
                <strong className="ipa">{slot.reconstruction.ipa}</strong>
                <small>{initial.voicing}{row.tone} · {row.rhyme}韵</small>
              </div>
              <span className="chain-connector" aria-hidden="true" />
              {activeLayer.kind === 'japanese' && (
                <>
                  <div className="chain-node">
                    <span>借入层</span>
                    <strong>{activeReflex?.historicalKana ?? '资料待补'}</strong>
                    <small>{activeReflex?.borrowingPeriod ?? '年代待考'}</small>
                  </div>
                  <span className="chain-connector" aria-hidden="true" />
                </>
              )}
              <div className="chain-node is-current">
                <span>{activeLayer.kind === 'middle-chinese' ? '音段条件' : '现代反射'}</span>
                <strong className="ipa">
                  {activeLayer.kind === 'middle-chinese'
                    ? slot.conditions.join(' · ')
                    : activeReflex
                      ? activeLayer.kind === 'japanese'
                        ? activeReflex.kana ?? activeReflex.historicalForm ?? activeReflex.romaji ?? '未标'
                        : `[${activeReflex.ipa ?? '未标'}]`
                      : '未收'}
                </strong>
                <small>
                  {activeLayer.kind === 'dialect' && activeReflex
                    ? [activeReflex.toneCategory, activeReflex.toneValue].filter(Boolean).join(' · ') || '调值未标'
                    : activeReflex?.kana ?? activeLayer.description}
                </small>
              </div>
            </div>

            {activeLayer.kind === 'dialect' && activeReflex?.toneValue && (
              <div className="tone-study">
                <div>
                  <span>历史来源调类</span>
                  <strong>{activeReflex.historicalTone}</strong>
                </div>
                <ToneContour value={activeReflex.toneValue} />
                <div>
                  <span>现代调类</span>
                  <strong>{activeReflex.toneCategory ?? '原站未标调类'}</strong>
                  <small>单字调 {activeReflex.citationTone}</small>
                </div>
              </div>
            )}

            {activeReflexes.length > 1 && (
              <div className="reading-variants">
                <h3>同层多读音</h3>
                {activeReflexes.map((reflex, index) => (
                  <div key={`${reflex.readingLayer}-${index}`}>
                    <span>{reflex.readingLayer}</span>
                    <strong className="ipa">[{reflex.ipa ?? reflex.historicalForm ?? '未标'}]</strong>
                    <span>{[reflex.toneCategory, reflex.toneValue].filter(Boolean).join(' · ') || '调值未标'}</span>
                    <small>{reflex.sourceNote ?? reflex.sandhiCondition ?? '单字音'}</small>
                  </div>
                ))}
              </div>
            )}

            {activeReflex?.laterChanges && (
              <ol className="change-notes">
                {activeReflex.laterChanges.map((change) => <li key={change}>{change}</li>)}
              </ol>
            )}

            {activeReflex?.sourceUrl && (
              <div className="source-record">
                <span>资料来源{activeReflex.character ? ` · 字例${activeReflex.character}` : ''}</span>
                <strong>{activeReflex.source}</strong>
                <small>{activeReflex.sourceNote ?? '来源记录未附注'}</small>
                <a href={activeReflex.sourceUrl} target="_blank" rel="noreferrer">
                  查看原始语言点 {activeReflex.sourcePointId}
                </a>
              </div>
            )}

            {!activeReflex && activeLayer.kind !== 'middle-chinese' && (
              <p className="detail-note">
                {activeLayer.kind === 'dialect'
                  ? '当前来源未收录这个代表字，矩阵格位保持原位。'
                  : '古音小镜《漢字源》第五版查询未收录这个格位。'}
              </p>
            )}
          </section>
        )}
      </div>

      <footer className="detail-footer">
        <span>资料状态</span>
        {activeLayer.kind === 'middle-chinese' ? (
          <a href={qieyunMetadata.sourceUrl} target="_blank" rel="noreferrer">
            《广韵》· TshetUinh.js {qieyunMetadata.sourceVersion}
          </a>
        ) : activeReflex?.sourceUrl ? (
          <a href={activeReflex.sourceUrl} target="_blank" rel="noreferrer">
            {activeReflex.sourcePointId}
          </a>
        ) : (
          <strong>来源未收</strong>
        )}
      </footer>
      </aside>
    </div>
  )
}
