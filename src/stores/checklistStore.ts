import { create } from 'zustand'
import type { ChecklistItem, ChecklistStatus } from '../types/checklist'

const STORAGE_KEY = 'steam-achievement-wiki-checklist'

interface ChecklistState {
  items: ChecklistItem[]
  toggleChecklist: (achievementId: number) => void
  updateStatus: (achievementId: number, status: ChecklistStatus) => void
  updateMemo: (achievementId: number, memo: string) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function loadStoredItems() {
  try {
    const rawItems = window.localStorage.getItem(STORAGE_KEY)

    if (!rawItems) {
      return []
    }

    return JSON.parse(rawItems) as ChecklistItem[]
  } catch {
    return []
  }
}

function persistItems(items: ChecklistItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useChecklistStore = create<ChecklistState>((set) => ({
  items: loadStoredItems(),
  toggleChecklist: (achievementId) =>
    set((state) => {
      const exists = state.items.some((item) => item.achievementId === achievementId)
      const items = exists
        ? state.items.filter((item) => item.achievementId !== achievementId)
        : [
            {
              achievementId,
              status: 'saved' as const,
              memo: '',
              updatedAt: today(),
            },
            ...state.items,
          ]

      persistItems(items)

      return { items }
    }),
  updateStatus: (achievementId, status) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.achievementId === achievementId
          ? { ...item, status, updatedAt: today() }
          : item,
      )

      persistItems(items)

      return { items }
    }),
  updateMemo: (achievementId, memo) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.achievementId === achievementId
          ? { ...item, memo, updatedAt: today() }
          : item,
      )

      persistItems(items)

      return { items }
    }),
}))
