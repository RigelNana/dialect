import type { Layer, PhonologySlot, Reflex } from '../domain'
import { ToneContour } from './ToneContour'

interface PhonologyCellProps {
  slot: PhonologySlot
  layer: Layer
  reflexes?: Reflex[]
  selected: boolean
  compact: boolean
  onSelect: (slotId: string) => void
}

export function PhonologyCell({ slot, layer, reflexes = [], selected, compact, onSelect }: PhonologyCellProps) {
  const primary = reflexes[0]
  const hasAlternates = reflexes.length > 1
  const isMiddleChinese = layer.kind === 'middle-chinese'
  const isJapanese = layer.kind === 'japanese'
  const accessibleValue = isMiddleChinese
    ? `${slot.reconstruction.ipa}，${slot.conditions.at(-1)}`
    : primary
      ? isJapanese
        ? `${primary.kana ?? ''}，${primary.ipa}`
        : `${primary.ipa}，${primary.toneCategory ?? ''}${primary.toneValue ?? ''}`
      : '本层暂无反射资料'

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={selected}
      aria-label={`${slot.id}，代表字${slot.representativeCharacter}，${accessibleValue}`}
      className={`phonology-cell${selected ? ' is-selected' : ''}${compact ? ' is-compact' : ''}${!primary && !isMiddleChinese ? ' is-empty' : ''}`}
      onClick={() => onSelect(slot.id)}
    >
      <span className="cell-register" aria-hidden="true" />
      <span className="cell-topline">
        <span className="cell-character">{slot.representativeCharacter}</span>
        <span className="cell-id">{slot.id}</span>
      </span>

      {isMiddleChinese ? (
        <>
          <span className="cell-reading ipa">{slot.reconstruction.ipa}</span>
          <span className="cell-meta">{slot.conditions.at(-1)}</span>
        </>
      ) : primary ? (
        isJapanese ? (
          <>
            <span className="cell-reading japanese-reading">{primary.kana}</span>
            <span className="cell-meta ipa">[{primary.ipa}]</span>
          </>
        ) : (
          <>
            <span className="cell-reading ipa">[{primary.ipa}]</span>
            <span className="cell-meta cell-tone">
              <span>{primary.toneCategory} · {primary.toneValue}</span>
              {!compact && <ToneContour value={primary.toneValue} compact />}
            </span>
            {hasAlternates && <span className="cell-alternate">+{reflexes.length - 1} 读音</span>}
          </>
        )
      ) : (
        <span className="cell-missing">未收</span>
      )}
    </button>
  )
}
