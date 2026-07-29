import { create } from 'zustand'
import type { AchievementId } from '../types/achievement'
import type { DifficultyVote } from '../types/checklist'
import {
  parseVoteStorage,
  type VoteOption,
} from '../utils/localStorageSchemas'
import {
  readVersionedStorage,
  writeVersionedStorage,
} from '../utils/versionedStorage'

const STORAGE_KEY = 'steam-achievement-wiki-votes'
const STORAGE_VERSION = 1

interface VoteState {
  votes: DifficultyVote[]
  userVotes: Record<AchievementId, VoteOption>
  vote: (achievementId: AchievementId, option: VoteOption) => void
  migrateAchievementId: (
    legacyId: AchievementId,
    achievementId: AchievementId,
  ) => void
}

function loadStoredState(): Pick<VoteState, 'votes' | 'userVotes'> {
  return readVersionedStorage({
    storage: window.localStorage,
    key: STORAGE_KEY,
    version: STORAGE_VERSION,
    fallback: { votes: [], userVotes: {} },
    parse: parseVoteStorage,
  })
}

function persistState(
  votes: DifficultyVote[],
  userVotes: Record<AchievementId, VoteOption>,
) {
  writeVersionedStorage(
    window.localStorage,
    STORAGE_KEY,
    STORAGE_VERSION,
    { votes, userVotes },
  )
}

function changeVoteCount(
  vote: DifficultyVote,
  option: VoteOption,
  amount: 1 | -1,
) {
  return {
    ...vote,
    [option]: Math.max(0, vote[option] + amount),
  }
}

export const useVoteStore = create<VoteState>((set) => {
  const storedState = loadStoredState()

  return {
    votes: storedState.votes,
    userVotes: storedState.userVotes,
    vote: (achievementId, option) =>
      set((state) => {
        const previousVote = state.userVotes[achievementId]

        if (previousVote === option) {
          return state
        }

        const existingVote = state.votes.find(
          (voteItem) => voteItem.achievementId === achievementId,
        )
        const votes = existingVote
          ? state.votes.map((voteItem) => {
              if (voteItem.achievementId !== achievementId) {
                return voteItem
              }

              const withoutPreviousVote = previousVote
                ? changeVoteCount(voteItem, previousVote, -1)
                : voteItem

              return changeVoteCount(withoutPreviousVote, option, 1)
            })
          : [
              ...state.votes,
              {
                achievementId,
                easy: option === 'easy' ? 1 : 0,
                normal: option === 'normal' ? 1 : 0,
                hard: option === 'hard' ? 1 : 0,
                veryHard: option === 'veryHard' ? 1 : 0,
              },
            ]
        const userVotes = { ...state.userVotes, [achievementId]: option }

        persistState(votes, userVotes)

        return { votes, userVotes }
      }),
    migrateAchievementId: (legacyId, achievementId) =>
      set((state) => {
        const hasLegacyVote =
          state.votes.some((vote) => vote.achievementId === legacyId) ||
          Boolean(state.userVotes[legacyId])

        if (legacyId === achievementId || !hasLegacyVote) {
          return state
        }

        const votes = state.votes.map((voteItem) =>
          voteItem.achievementId === legacyId
            ? { ...voteItem, achievementId }
            : voteItem,
        )
        const userVotes = { ...state.userVotes }

        if (userVotes[legacyId] && !userVotes[achievementId]) {
          userVotes[achievementId] = userVotes[legacyId]
        }
        delete userVotes[legacyId]
        persistState(votes, userVotes)

        return { votes, userVotes }
      }),
  }
})
