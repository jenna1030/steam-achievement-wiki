export type ChecklistStatus = 'saved' | 'in-progress' | 'done'

export interface ChecklistItem {
  achievementId: number
  status: ChecklistStatus
  memo: string
  updatedAt: string
}

export interface DifficultyVote {
  achievementId: number
  easy: number
  normal: number
  hard: number
  veryHard: number
}
