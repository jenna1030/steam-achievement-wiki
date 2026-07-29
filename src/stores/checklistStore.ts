import { create } from 'zustand'
import type { Achievement, AchievementId } from '../types/achievement'
import type { ChecklistItem, ChecklistStatus } from '../types/checklist'
import {
  getAchievementNotices,
  getAchievementTags,
} from '../utils/achievementMetadata'
import { parseChecklistStorage } from '../utils/localStorageSchemas'
import {
  readVersionedStorage,
  writeVersionedStorage,
} from '../utils/versionedStorage'

const STORAGE_KEY = 'steam-achievement-wiki-checklist'
const STORAGE_VERSION = 1

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

function loadStoredItems(): ChecklistItem[] {
  return readVersionedStorage({
    storage: window.localStorage,
    key: STORAGE_KEY,
    version: STORAGE_VERSION,
    fallback: [],
    parse: parseChecklistStorage,
  })
}

function persistItems(items: ChecklistItem[]) {
  writeVersionedStorage(
    window.localStorage,
    STORAGE_KEY,
    STORAGE_VERSION,
    items,
  )
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
