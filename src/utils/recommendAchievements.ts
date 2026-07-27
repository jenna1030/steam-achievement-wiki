import type { Achievement } from '../types/achievement'
import type { Game } from '../types/game'

export interface RecommendedAchievementView {
  achievement: Achievement
  game: Game | undefined
  score: number
  reason: string
}

export function recommendEasyAchievements(
  achievements: Achievement[],
  games: Game[],
  favoriteGameIds: number[],
) {
  const targetGameIds = favoriteGameIds.length > 0 ? favoriteGameIds : games.map((game) => game.id)

  return achievements
    .filter((achievement) => targetGameIds.includes(achievement.gameId))
    .filter((achievement) => !achievement.requiresDlc && !achievement.requiresMultiplayer)
    .map((achievement): RecommendedAchievementView => {
      const shortTimeBonus = achievement.estimatedMinutes > 0 && achievement.estimatedMinutes <= 30 ? 18 : 0
      const difficultyBonus = achievement.difficulty === 'easy' ? 20 : achievement.difficulty === 'normal' ? 10 : 0
      const missablePenalty = achievement.isMissable ? -8 : 0
      const score = achievement.globalRate + shortTimeBonus + difficultyBonus + missablePenalty
      const reason =
        achievement.estimatedMinutes > 0 && achievement.estimatedMinutes <= 30
          ? '30분 안에 도전하기 좋은 항목'
          : '달성률과 난이도 기준 추천'

      return {
        achievement,
        game: games.find((game) => game.id === achievement.gameId),
        score,
        reason,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
