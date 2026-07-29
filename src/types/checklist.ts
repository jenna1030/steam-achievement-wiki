import type { AchievementId } from './achievement'

export type ChecklistStatus = 'saved' | 'in-progress' | 'done'

export interface ChecklistItem {
  achievementId: AchievementId
  gameId?: number
  title?: string
  description?: string
  iconUrl?: string
  tags?: string[]
  notices?: string[]
  status: ChecklistStatus
  memo: string
  updatedAt: string
}

export interface DifficultyVote {
  achievementId: AchievementId
  easy: number
  normal: number
  hard: number
  veryHard: number
}
