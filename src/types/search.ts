export type AchievementFilter =
  | 'all'
  | 'with-achievements'
  | 'up-to-10'
  | '11-to-50'
  | 'over-50'

export interface GameSearchFilters {
  query: string
  genre: string
  achievementFilter: AchievementFilter
}
