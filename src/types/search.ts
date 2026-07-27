export type AchievementFilter = 'all' | 'with-achievements'

export interface GameSearchFilters {
  query: string
  genre: string
  achievementFilter: AchievementFilter
}
