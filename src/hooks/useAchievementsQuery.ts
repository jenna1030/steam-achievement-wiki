import { useQuery } from '@tanstack/react-query'
import { fetchSteamAchievements } from '../apis/steamApi'
import type { AchievementId } from '../types/achievement'
import type { AchievementGuide } from '../types/guide'
import {
  getGameIdFromAchievementId,
  matchesAchievementId,
} from '../utils/achievementIdentity'
import { mapSteamAchievements } from '../utils/steamAchievements'

export function useAchievementsQuery(gameId: number) {
  return useQuery({
    queryKey: ['steam', 'achievements', gameId],
    queryFn: async () => {
      const steamAchievements = await fetchSteamAchievements(gameId)

      return mapSteamAchievements(steamAchievements, gameId)
    },
    enabled: Number.isFinite(gameId) && gameId > 0,
    staleTime: 1000 * 60 * 30,
  })
}

export function useAchievementDetailQuery(achievementId: AchievementId) {
  const gameId = getGameIdFromAchievementId(achievementId)

  return useQuery({
    queryKey: ['steam', 'achievement', achievementId],
    queryFn: async () => {
      const steamAchievements = await fetchSteamAchievements(gameId as number)
      const achievements = mapSteamAchievements(
        steamAchievements,
        gameId as number,
      )

      return achievements.find((achievement) =>
        matchesAchievementId(achievement, achievementId),
      )
    },
    enabled: gameId !== null,
    staleTime: 1000 * 60 * 30,
  })
}

export function useAchievementGuidesQuery(achievementId: AchievementId) {
  return useQuery({
    queryKey: ['guides', 'achievement', achievementId],
    queryFn: async (): Promise<AchievementGuide[]> => [],
    enabled: achievementId.length > 0,
  })
}
