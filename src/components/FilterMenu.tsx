import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'

interface FilterMenuProps {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

export function FilterMenu({ label, value, options, onChange }: FilterMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    if (!open) return

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const openAndFocus = (index: number) => {
    setOpen(true)
    window.requestAnimationFrame(() => {
      const optionButtons = listboxRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')
      optionButtons?.[index]?.focus()
    })
  }

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const selectedIndex = Math.max(0, options.indexOf(value))
    openAndFocus(event.key === 'ArrowDown' ? selectedIndex : options.length - 1)
  }

  const handleListboxKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const optionButtons = Array.from(listboxRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
    const currentIndex = optionButtons.findIndex((option) => option === document.activeElement)
    let nextIndex = currentIndex

    if (event.key === 'ArrowDown') nextIndex = Math.min(optionButtons.length - 1, currentIndex + 1)
    else if (event.key === 'ArrowUp') nextIndex = Math.max(0, currentIndex - 1)
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = optionButtons.length - 1
    else if (event.key === 'Tab') {
      setOpen(false)
      return
    } else return

    event.preventDefault()
    optionButtons[nextIndex]?.focus()
  }

  return (
    <div className={`filter-menu${open ? ' is-open' : ''}`} ref={rootRef}>
      <span className="filter-label">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        className="filter-trigger"
        aria-label={`${label}：${value}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (open) setOpen(false)
          else openAndFocus(Math.max(0, options.indexOf(value)))
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{value}</span>
        <CaretDown size={13} aria-hidden="true" />
      </button>

      <div
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-label={`${label}筛选`}
        className="filter-popover"
        onKeyDown={handleListboxKeyDown}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={option === value}
            tabIndex={-1}
            onClick={() => {
              onChange(option)
              setOpen(false)
              triggerRef.current?.focus()
            }}
          >
            <span>{option}</span>
            {option === value && <Check size={14} weight="bold" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  )
}
