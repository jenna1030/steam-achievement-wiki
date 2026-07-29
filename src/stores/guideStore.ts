import { create } from 'zustand'
import type { AchievementId } from '../types/achievement'
import type { AchievementGuide, GuideFormValues } from '../types/guide'
import { normalizeAchievementId } from '../utils/achievementIdentity'
import { normalizeEstimatedTimeRange } from '../utils/estimatedTime'
import { parseGuideStorage } from '../utils/localStorageSchemas'
import {
  readVersionedStorage,
  writeVersionedStorage,
} from '../utils/versionedStorage'

const STORAGE_KEY = 'steam-achievement-wiki-guides'
const STORAGE_VERSION = 1

interface GuideState {
  userGuides: AchievementGuide[]
  addGuide: (
    values: GuideFormValues,
    ownerSteamId: string | null,
  ) => AchievementGuide
  updateGuide: (
    guideId: number,
    values: GuideFormValues,
    ownerSteamId: string | null,
  ) => void
  deleteGuide: (guideId: number, ownerSteamId: string | null) => void
  claimLegacyGuides: (ownerSteamId: string) => void
  migrateAchievementId: (
    legacyId: AchievementId,
    achievementId: AchievementId,
  ) => void
}

function parseLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function loadStoredGuides(): AchievementGuide[] {
  return readVersionedStorage({
    storage: window.localStorage,
    key: STORAGE_KEY,
    version: STORAGE_VERSION,
    fallback: [],
    parse: parseGuideStorage,
  })
}

function persistGuides(guides: AchievementGuide[]) {
  writeVersionedStorage(
    window.localStorage,
    STORAGE_KEY,
    STORAGE_VERSION,
    guides,
  )
}

function createGuideFromValues(
  values: GuideFormValues,
  ownerSteamId: string | null,
  guideId = Date.now(),
): AchievementGuide {
  const now = new Date().toISOString().slice(0, 10)

  return {
    id: guideId,
    achievementId: normalizeAchievementId(values.achievementId),
    source: 'user',
    ownerSteamId,
    title: values.title,
    author: '나',
    hint: values.hint,
    detail: values.detail,
    hasSpoiler: values.hasSpoiler && values.spoiler.trim().length > 0,
    spoiler: values.hasSpoiler ? values.spoiler : '',
    conditions: parseLines(values.conditionsText),
    supplies: parseLines(values.suppliesText),
    warnings: parseLines(values.warningsText),
    recommendedOrder: parseLines(values.recommendedOrderText),
    tags: parseLines(values.tagsText.replaceAll(',', '\n')),
    dlcRequirement: values.dlcRequirement,
    multiplayerRequirement: values.multiplayerRequirement,
    isMissable: values.isMissable,
    requiresSecondRun: values.requiresSecondRun,
    difficulty: values.difficulty,
    estimatedMinutes: normalizeEstimatedTimeRange(
      Number(values.estimatedMinutes),
    ),
    likeCount: 0,
    dislikeCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export const useGuideStore = create<GuideState>((set) => ({
  userGuides: loadStoredGuides(),
  addGuide: (values, ownerSteamId) => {
    const guide = createGuideFromValues(values, ownerSteamId)

    set((state) => {
      const userGuides = [guide, ...state.userGuides]
      persistGuides(userGuides)

      return { userGuides }
    })

    return guide
  },
  updateGuide: (guideId, values, ownerSteamId) =>
    set((state) => {
      const userGuides = state.userGuides.map((guide) => {
        if (
          guide.id !== guideId ||
          guide.ownerSteamId !== ownerSteamId
        ) {
          return guide
        }

        return {
          ...createGuideFromValues(values, ownerSteamId, guideId),
          createdAt: guide.createdAt,
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      })

      persistGuides(userGuides)

      return { userGuides }
    }),
  deleteGuide: (guideId, ownerSteamId) =>
    set((state) => {
      const userGuides = state.userGuides.filter(
        (guide) =>
          guide.id !== guideId ||
          guide.ownerSteamId !== ownerSteamId,
      )
      persistGuides(userGuides)

      return { userGuides }
    }),
  claimLegacyGuides: (ownerSteamId) =>
    set((state) => {
      if (!state.userGuides.some((guide) => guide.ownerSteamId === null)) {
        return state
      }

      const userGuides = state.userGuides.map((guide) =>
        guide.ownerSteamId === null
          ? { ...guide, ownerSteamId }
          : guide,
      )

      persistGuides(userGuides)

      return { userGuides }
    }),
  migrateAchievementId: (legacyId, achievementId) =>
    set((state) => {
      if (
        legacyId === achievementId ||
        !state.userGuides.some(
          (guide) => guide.achievementId === legacyId,
        )
      ) {
        return state
      }

      const userGuides = state.userGuides.map((guide) =>
        guide.achievementId === legacyId
          ? { ...guide, achievementId }
          : guide,
      )

      persistGuides(userGuides)

      return { userGuides }
    }),
}))
