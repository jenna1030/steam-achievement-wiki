import type { ChecklistItem, DifficultyVote } from '../types/checklist'

export const checklistItems: ChecklistItem[] = [
  {
    achievementId: 103,
    status: 'in-progress',
    memo: '초반 루트 확인하면서 같이 진행하기',
    updatedAt: '2026-07-28',
  },
]

export const difficultyVotes: DifficultyVote[] = [
  {
    achievementId: 101,
    easy: 18,
    normal: 2,
    hard: 0,
    veryHard: 0,
  },
  {
    achievementId: 102,
    easy: 15,
    normal: 5,
    hard: 1,
    veryHard: 0,
  },
  {
    achievementId: 103,
    easy: 7,
    normal: 11,
    hard: 3,
    veryHard: 0,
  },
]
