import { create } from 'zustand'
import {
  addGuideReport,
  getGuideFeedbackKey,
  parseGuideFeedbackStorage,
  toggleGuideReaction,
  type GuideFeedbackStorage,
  type GuideReaction,
} from '../utils/guideFeedback'
import {
  readVersionedStorage,
  writeVersionedStorage,
} from '../utils/versionedStorage'

export type { GuideReaction } from '../utils/guideFeedback'

interface GuideFeedbackState extends GuideFeedbackStorage {
  toggleReaction: (
    guideId: number,
    actorSteamId: string | null,
    reaction: GuideReaction,
  ) => void
  reportGuide: (guideId: number, actorSteamId: string | null) => void
}

const STORAGE_KEY = 'steam-achievement-wiki-guide-feedback'
const STORAGE_VERSION = 1
const EMPTY_STATE: GuideFeedbackStorage = { reactions: {}, reports: [] }

function loadStoredFeedback() {
  return readVersionedStorage({
    storage: window.localStorage,
    key: STORAGE_KEY,
    version: STORAGE_VERSION,
    fallback: EMPTY_STATE,
    parse: parseGuideFeedbackStorage,
  })
}

function persistFeedback(feedback: GuideFeedbackStorage) {
  writeVersionedStorage(
    window.localStorage,
    STORAGE_KEY,
    STORAGE_VERSION,
    feedback,
  )
}

export const useGuideFeedbackStore = create<GuideFeedbackState>((set) => ({
  ...loadStoredFeedback(),
  toggleReaction: (guideId, actorSteamId, reaction) =>
    set((state) => {
      const feedback = toggleGuideReaction(
        state,
        getGuideFeedbackKey(guideId, actorSteamId),
        reaction,
      )

      persistFeedback(feedback)
      return feedback
    }),
  reportGuide: (guideId, actorSteamId) =>
    set((state) => {
      const feedback = addGuideReport(
        state,
        getGuideFeedbackKey(guideId, actorSteamId),
      )

      if (feedback !== state) {
        persistFeedback(feedback)
      }

      return feedback
    }),
}))
