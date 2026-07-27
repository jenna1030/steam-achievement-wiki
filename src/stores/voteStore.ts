import { create } from 'zustand'
import { difficultyVotes } from '../mocks/checklist'
import type { DifficultyVote } from '../types/checklist'

type VoteOption = 'easy' | 'normal' | 'hard' | 'veryHard'

const STORAGE_KEY = 'steam-achievement-wiki-votes'

interface VoteState {
  votes: DifficultyVote[]
  userVotes: Record<number, VoteOption>
  vote: (achievementId: number, option: VoteOption) => void
}

function loadStoredState() {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)

    if (!rawState) {
      return { votes: difficultyVotes, userVotes: {} }
    }

    return JSON.parse(rawState) as Pick<VoteState, 'votes' | 'userVotes'>
  } catch {
    return { votes: difficultyVotes, userVotes: {} }
  }
}

function persistState(votes: DifficultyVote[], userVotes: Record<number, VoteOption>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ votes, userVotes }))
}

export const useVoteStore = create<VoteState>((set) => {
  const storedState = loadStoredState()

  return {
    votes: storedState.votes,
    userVotes: storedState.userVotes,
    vote: (achievementId, option) =>
      set((state) => {
        const previousVote = state.userVotes[achievementId]
        const existingVote = state.votes.find(
          (voteItem) => voteItem.achievementId === achievementId,
        )
        const votes = existingVote
          ? state.votes.map((voteItem) => {
              if (voteItem.achievementId !== achievementId) {
                return voteItem
              }

              return {
                ...voteItem,
                ...(previousVote
                  ? { [previousVote]: Math.max(0, voteItem[previousVote] - 1) }
                  : {}),
                [option]: voteItem[option] + 1,
              }
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
  }
})
