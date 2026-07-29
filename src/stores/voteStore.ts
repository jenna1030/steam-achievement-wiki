import { create } from 'zustand'
import type { AchievementId } from '../types/achievement'
import type { DifficultyVote } from '../types/checklist'
import { normalizeAchievementId } from '../utils/achievementIdentity'

type VoteOption = 'easy' | 'normal' | 'hard' | 'veryHard'

const STORAGE_KEY = 'steam-achievement-wiki-votes'

interface VoteState {
  votes: DifficultyVote[]
  userVotes: Record<AchievementId, VoteOption>
  vote: (achievementId: AchievementId, option: VoteOption) => void
  removeVote: (achievementId: AchievementId) => void
  migrateAchievementId: (
    legacyId: AchievementId,
    achievementId: AchievementId,
  ) => void
}

function loadStoredState(): Pick<VoteState, 'votes' | 'userVotes'> {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)

    if (!rawState) {
      return { votes: [], userVotes: {} }
    }

    const storedState = JSON.parse(rawState) as Pick<
      VoteState,
      'votes' | 'userVotes'
    >
    const votes = Array.isArray(storedState.votes)
      ? storedState.votes.map((vote) => ({
          ...vote,
          achievementId: normalizeAchievementId(vote.achievementId),
        }))
      : []

    return { votes, userVotes: storedState.userVotes ?? {} }
  } catch {
    return { votes: [], userVotes: {} }
  }
}

function persistState(
  votes: DifficultyVote[],
  userVotes: Record<AchievementId, VoteOption>,
) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ votes, userVotes }))
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
    removeVote: (achievementId) =>
      set((state) => {
        const previousVote = state.userVotes[achievementId]

        if (!previousVote) {
          return state
        }

        const votes = state.votes.map((voteItem) =>
          voteItem.achievementId === achievementId
            ? changeVoteCount(voteItem, previousVote, -1)
            : voteItem,
        )
        const userVotes = { ...state.userVotes }

        delete userVotes[achievementId]
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
