import { create } from 'zustand'
import type { AchievementId } from '../types/achievement'
import type { AchievementGuide, GuideFormValues } from '../types/guide'
import { normalizeAchievementId } from '../utils/achievementIdentity'

const STORAGE_KEY = 'steam-achievement-wiki-guides'

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

function normalizeStoredGuide(guide: AchievementGuide): AchievementGuide {
  return {
    ...guide,
    achievementId: normalizeAchievementId(guide.achievementId),
    ownerSteamId:
      typeof guide.ownerSteamId === 'string' ? guide.ownerSteamId : null,
    tags: Array.isArray(guide.tags) ? guide.tags : [],
    dlcRequirement: guide.dlcRequirement ?? 'unknown',
    multiplayerRequirement: guide.multiplayerRequirement ?? 'unknown',
    isMissable: guide.isMissable ?? false,
    requiresSecondRun: guide.requiresSecondRun ?? false,
  }
}

function loadStoredGuides(): AchievementGuide[] {
  try {
    const rawGuides = window.localStorage.getItem(STORAGE_KEY)

    if (!rawGuides) {
      return []
    }

    const guides = JSON.parse(rawGuides) as AchievementGuide[]

    return Array.isArray(guides) ? guides.map(normalizeStoredGuide) : []
  } catch {
    return []
  }
}

function persistGuides(guides: AchievementGuide[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guides))
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
    ownerSteamId,
    source: 'user',
    title: values.title,
    author: '나',
    hint: values.hint,
    detail: values.detail,
    hasSpoiler: values.hasSpoiler,
    spoiler: values.spoiler,
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
    estimatedMinutes: Number(values.estimatedMinutes),
    helpfulCount: 0,
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
