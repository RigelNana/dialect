import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Layer, LayerPayload, MatrixRow, PhonologySlot } from '../domain'
import { initials, slots } from '../data'
import { PhonologyCell } from './PhonologyCell'

interface PhonologyMatrixProps {
  rows: MatrixRow[]
  layer: Layer
  payload?: LayerPayload
  selectedSlotId: string
  compact: boolean
  loading: boolean
  onSelect: (slotId: string) => void
}

const LEFT_COLUMN_WIDTHS = [64, 58, 44, 44, 44]
const LEADING_WIDTH = LEFT_COLUMN_WIDTHS.reduce((sum, width) => sum + width, 0)
const INITIAL_WIDTH = 110
const GRID_WIDTH = LEADING_WIDTH + initials.length * INITIAL_WIDTH
const GRID_TEMPLATE = `${LEFT_COLUMN_WIDTHS.map((width) => `${width}px`).join(' ')} repeat(${initials.length}, ${INITIAL_WIDTH}px)`
const slotsByCoordinate: Record<string, PhonologySlot> = Object.fromEntries(
  slots.map((slot) => [`${slot.rowId}:${slot.initialId}`, slot]),
)

export function PhonologyMatrix({ rows: visibleRows, layer, payload, selectedSlotId, compact, loading, onSelect }: PhonologyMatrixProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const rowHeight = compact ? 58 : 76
  const rowVirtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
    scrollPaddingStart: 94,
  })

  const selectedPosition = useMemo(() => {
    const selected = slots.find((slot) => slot.id === selectedSlotId)
    return {
      rowIndex: selected ? visibleRows.findIndex((row) => row.id === selected.rowId) : -1,
      initialIndex: selected ? initials.findIndex((initial) => initial.id === selected.initialId) : -1,
    }
  }, [selectedSlotId, visibleRows])

  useEffect(() => {
    if (selectedPosition.rowIndex >= 0) {
      rowVirtualizer.scrollToIndex(selectedPosition.rowIndex, { align: 'auto' })
    }
  }, [rowVirtualizer, selectedPosition.rowIndex])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || selectedPosition.initialIndex < 0) return
    const cellLeft = LEADING_WIDTH + selectedPosition.initialIndex * INITIAL_WIDTH
    const cellRight = cellLeft + INITIAL_WIDTH
    const visibleLeft = scroller.scrollLeft + LEADING_WIDTH
    const visibleRight = scroller.scrollLeft + scroller.clientWidth

    if (cellLeft < visibleLeft) {
      scroller.scrollLeft = Math.max(0, cellLeft - LEADING_WIDTH)
    } else if (cellRight > visibleRight) {
      scroller.scrollLeft = cellRight - scroller.clientWidth
    }
  }, [selectedPosition.initialIndex])

  if (visibleRows.length === 0) {
    return (
      <section className="matrix-empty" aria-live="polite">
        <strong>当前条件没有格位行</strong>
        <span>清除摄或调类筛选后继续浏览。</span>
      </section>
    )
  }

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div
      ref={scrollerRef}
      className={`matrix-scroller${compact ? ' is-compact' : ''}`}
      role="grid"
      aria-label={`${layer.label}音韵反射矩阵`}
      aria-rowcount={visibleRows.length + 2}
      aria-colcount={initials.length + 5}
    >
      <div className="matrix-stage" style={{ width: GRID_WIDTH, height: rowVirtualizer.getTotalSize() + 94 }}>
        <div className="matrix-superheader" style={{ gridTemplateColumns: `${LEADING_WIDTH}px ${initials.length * INITIAL_WIDTH}px` }}>
          <div className="axis-corner">韵类条件</div>
          <div className="axis-title">
            <span>中古声母</span>
            <span className="axis-rule" />
            <span>{initials.length} 组示例</span>
          </div>
        </div>

        <div className="matrix-header" role="row" style={{ gridTemplateColumns: GRID_TEMPLATE }}>
          {['摄', '韵', '等', '呼', '调'].map((label, index) => (
            <div
              key={label}
              role="columnheader"
              className={`matrix-coordinate-header sticky-coordinate coordinate-${index}`}
            >
              {label}
            </div>
          ))}
          {initials.map((initial) => (
            <div key={initial.id} role="columnheader" className="initial-header">
              <span className="initial-label">{initial.label}</span>
              <span className="initial-ipa ipa">/{initial.reconstruction}/</span>
              <span className="initial-feature">{initial.voicing} · {initial.aspiration}</span>
            </div>
          ))}
        </div>

        <div className="matrix-row-layer" style={{ height: rowVirtualizer.getTotalSize(), top: 94 }}>
          {virtualRows.map((virtualRow) => {
            const row = visibleRows[virtualRow.index]
            const previous = visibleRows[virtualRow.index - 1]
            const startsShe = !previous || previous.she !== row.she
            const startsRhyme = !previous || previous.rhyme !== row.rhyme
            return (
              <div
                key={row.id}
                role="row"
                aria-rowindex={virtualRow.index + 3}
                className={`matrix-row${startsShe ? ' starts-she' : ''}`}
                style={{
                  gridTemplateColumns: GRID_TEMPLATE,
                  height: rowHeight,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div role="rowheader" className="matrix-coordinate sticky-coordinate coordinate-0" data-repeated={!startsShe}>
                  <span>{row.she}</span>
                  <small>摄</small>
                </div>
                <div role="rowheader" className="matrix-coordinate sticky-coordinate coordinate-1" data-repeated={!startsRhyme}>
                  <span>{row.rhyme}</span>
                  <small>韵</small>
                </div>
                <div role="rowheader" className="matrix-coordinate sticky-coordinate coordinate-2"><span>{row.grade}</span><small>等</small></div>
                <div role="rowheader" className="matrix-coordinate sticky-coordinate coordinate-3"><span>{row.openness}</span><small>口</small></div>
                <div role="rowheader" className={`matrix-coordinate sticky-coordinate coordinate-4 tone-${row.tone}`}><span>{row.tone}</span><small>声</small></div>

                {initials.map((initial) => {
                  const slot = slotsByCoordinate[`${row.id}:${initial.id}`]
                  if (!slot) {
                    return <div key={initial.id} role="gridcell" className="matrix-void" aria-label={`${initial.label}母，此行无示例格位`} />
                  }
                  return loading ? (
                    <div key={initial.id} role="gridcell" className="cell-skeleton" aria-label="正在套印反射数据">
                      <span /><span /><span />
                    </div>
                  ) : (
                    <PhonologyCell
                      key={initial.id}
                      slot={slot}
                      layer={layer}
                      reflexes={payload?.reflexes[slot.id]}
                      selected={slot.id === selectedSlotId}
                      compact={compact}
                      onSelect={onSelect}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
