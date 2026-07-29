import { create } from 'zustand'
import type { Achievement, AchievementId } from '../types/achievement'
import type { ChecklistItem, ChecklistStatus } from '../types/checklist'
import {
  getAchievementNotices,
  getAchievementTags,
} from '../utils/achievementMetadata'
import { normalizeAchievementId } from '../utils/achievementIdentity'

const STORAGE_KEY = 'steam-achievement-wiki-checklist'

interface ChecklistState {
  items: ChecklistItem[]
  toggleChecklist: (achievement: Achievement | AchievementId) => void
  syncAchievement: (achievement: Achievement) => void
  updateStatus: (achievementId: AchievementId, status: ChecklistStatus) => void
  updateMemo: (achievementId: AchievementId, memo: string) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeStoredItem(item: ChecklistItem): ChecklistItem {
  return {
    ...item,
    achievementId: normalizeAchievementId(item.achievementId),
  }
}

function loadStoredItems(): ChecklistItem[] {
  try {
    const rawItems = window.localStorage.getItem(STORAGE_KEY)

    if (!rawItems) {
      return []
    }

    const items = JSON.parse(rawItems) as ChecklistItem[]

    return Array.isArray(items) ? items.map(normalizeStoredItem) : []
  } catch {
    return []
  }
}

function persistItems(items: ChecklistItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useChecklistStore = create<ChecklistState>((set) => ({
  items: loadStoredItems(),
  toggleChecklist: (achievementOrId) =>
    set((state) => {
      const achievement =
        typeof achievementOrId === 'string' ? undefined : achievementOrId
      const achievementId =
        typeof achievementOrId === 'string'
          ? achievementOrId
          : achievementOrId.id
      const exists = state.items.some((item) => item.achievementId === achievementId)
      const items = exists
        ? state.items.filter((item) => item.achievementId !== achievementId)
        : [
            {
              achievementId,
              gameId: achievement?.gameId,
              title: achievement?.title,
              description: achievement?.description,
              iconUrl: achievement?.iconUrl,
              tags: achievement ? getAchievementTags(achievement) : undefined,
              notices: achievement
                ? getAchievementNotices(achievement)
                : undefined,
              status: 'saved' as const,
              memo: '',
              updatedAt: today(),
            },
            ...state.items,
          ]

      persistItems(items)

      return { items }
    }),
  syncAchievement: (achievement) =>
    set((state) => {
      const legacyId = String(achievement.legacyId ?? '')

      if (
        !state.items.some(
          (item) =>
            item.achievementId === achievement.id ||
            item.achievementId === legacyId,
        )
      ) {
        return state
      }

      const items = state.items.map((item) => {
        if (
          item.achievementId !== achievement.id &&
          item.achievementId !== legacyId
        ) {
          return item
        }

        return {
          ...item,
          achievementId: achievement.id,
          gameId: achievement.gameId,
          title: achievement.title,
          description: achievement.description,
          iconUrl: achievement.iconUrl,
          tags: getAchievementTags(achievement),
          notices: getAchievementNotices(achievement),
        }
      })

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
