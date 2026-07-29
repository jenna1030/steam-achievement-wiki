import type { Achievement } from '../types/achievement'
import type { Game } from '../types/game'

export interface RecommendedAchievementView {
  achievement: Achievement
  game: Game | undefined
  score: number
  reason: string
}

export function selectHomeGameIds(
  favoriteGameIds: number[],
  fallbackGameIds: number[],
  limit = 3,
) {
  return Array.from(new Set([...favoriteGameIds, ...fallbackGameIds])).slice(
    0,
    limit,
  )
}

export function recommendEasyAchievements(
  achievements: Achievement[],
  games: Game[],
  favoriteGameIds: number[],
) {
  const gameIds = new Set(games.map((game) => game.id))
  const favoriteGameIdSet = new Set(favoriteGameIds)

  return achievements
    .filter((achievement) => gameIds.has(achievement.gameId))
    .filter(
      (achievement) =>
        achievement.dlcRequirement !== 'required' &&
        achievement.multiplayerRequirement !== 'required',
    )
    .map((achievement): RecommendedAchievementView => {
      const shortTimeBonus = achievement.estimatedMinutes > 0 && achievement.estimatedMinutes <= 30 ? 18 : 0
      const favoriteGameBonus = favoriteGameIdSet.has(achievement.gameId)
        ? 12
        : 0
      const missablePenalty = achievement.isMissable ? -8 : 0
      const score =
        achievement.globalRate +
        shortTimeBonus +
        favoriteGameBonus +
        missablePenalty
      const reason =
        favoriteGameBonus > 0
          ? '관심 게임에서 시작하기 좋은 항목'
          : achievement.estimatedMinutes > 0 &&
              achievement.estimatedMinutes <= 30
          ? '30분 안에 도전하기 좋은 항목'
          : '전체 달성률 기준 추천'

      return {
        achievement,
        game: games.find((game) => game.id === achievement.gameId),
        score,
        reason,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
