import { create } from 'zustand'

export type DetailTab = 'position' | 'reflexes' | 'development'
export type CellDensity = 'comfortable' | 'compact'

interface InterfaceState {
  selectedSlotId: string
  detailOpen: boolean
  detailTab: DetailTab
  cellDensity: CellDensity
  setSelectedSlot: (slotId: string) => void
  closeDetail: () => void
  setDetailTab: (tab: DetailTab) => void
  setCellDensity: (density: CellDensity) => void
}

export const useInterfaceStore = create<InterfaceState>((set) => ({
  selectedSlotId: 'C001',
  detailOpen: false,
  detailTab: 'position',
  cellDensity: 'comfortable',
  setSelectedSlot: (selectedSlotId) => set({ selectedSlotId, detailOpen: true }),
  closeDetail: () => set({ detailOpen: false }),
  setDetailTab: (detailTab) => set({ detailTab }),
  setCellDensity: (cellDensity) => set({ cellDensity }),
}))
