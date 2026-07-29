export type AchievementDifficulty = 'easy' | 'normal' | 'hard' | 'very-hard'
export type AchievementId = string
export type RequirementStatus = 'unknown' | 'required' | 'not-required'
export type AchievementSortOption =
  | 'rate-desc'
  | 'rate-asc'
  | 'name'
  | 'difficulty'

export interface Achievement {
  id: AchievementId
  legacyId?: number
  gameId: number
  title: string
  description: string
  steamAchievementName?: string
  iconUrl: string
  globalRate: number
  difficulty: AchievementDifficulty
  estimatedMinutes: number
  tags: string[]
  isHidden: boolean
  isMissable: boolean | null
  requiresSecondRun: boolean | null
  dlcRequirement: RequirementStatus
  multiplayerRequirement: RequirementStatus
  platformNotes: string[]
  bugNotes: string[]
}
