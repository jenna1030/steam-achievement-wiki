export type AchievementDifficulty = 'easy' | 'normal' | 'hard' | 'very-hard'
export type AchievementSortOption =
  | 'rate-desc'
  | 'rate-asc'
  | 'name'
  | 'difficulty'

export interface Achievement {
  id: number
  gameId: number
  title: string
  description: string
  iconUrl: string
  globalRate: number
  difficulty: AchievementDifficulty
  estimatedMinutes: number
  tags: string[]
  isHidden: boolean
  isMissable: boolean
  requiresSecondRun: boolean
  requiresDlc: boolean
  requiresMultiplayer: boolean
  platformNotes: string[]
  bugNotes: string[]
}

export interface RecommendedAchievement {
  achievementId: number
  title: string
  game: string
  rate: string
  time: string
  tags: string[]
}
