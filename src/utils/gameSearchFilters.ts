import type { AchievementFilter } from '../types/search'

interface AchievementCountGame {
  achievementCount: number
}

export function matchesAchievementCountFilter(
  game: AchievementCountGame,
  filter: AchievementFilter,
) {
  if (filter === 'with-achievements') {
    return game.achievementCount > 0
  }

  if (filter === 'up-to-10') {
    return game.achievementCount >= 1 && game.achievementCount <= 10
  }

  if (filter === '11-to-50') {
    return game.achievementCount >= 11 && game.achievementCount <= 50
  }

  if (filter === 'over-50') {
    return game.achievementCount >= 51
  }

  return true
}
