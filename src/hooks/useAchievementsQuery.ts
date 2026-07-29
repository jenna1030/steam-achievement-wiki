import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchSteamAchievements } from '../apis/steamApi'
import type { AchievementId } from '../types/achievement'
import {
  getGameIdFromAchievementId,
  matchesAchievementId,
} from '../utils/achievementIdentity'
import { mapSteamAchievements } from '../utils/steamAchievements'

async function fetchMappedAchievements(gameId: number) {
  const steamAchievements = await fetchSteamAchievements(gameId)

  return mapSteamAchievements(steamAchievements, gameId)
}

function getAchievementsQueryOptions(gameId: number) {
  return {
    queryKey: ['steam', 'achievements', gameId],
    queryFn: () => fetchMappedAchievements(gameId),
    enabled: Number.isFinite(gameId) && gameId > 0,
    staleTime: 1000 * 60 * 30,
  }
}

export function useAchievementsQuery(gameId: number) {
  return useQuery(getAchievementsQueryOptions(gameId))
}

export function useAchievementsQueries(gameIds: number[]) {
  return useQueries({
    queries: gameIds.map(getAchievementsQueryOptions),
  })
}

export function useAchievementDetailQuery(achievementId: AchievementId) {
  const gameId = getGameIdFromAchievementId(achievementId)

  return useQuery({
    queryKey: ['steam', 'achievement', achievementId],
    queryFn: async () => {
      const achievements = await fetchMappedAchievements(gameId as number)

      return achievements.find((achievement) =>
        matchesAchievementId(achievement, achievementId),
      )
    },
    enabled: gameId !== null,
    staleTime: 1000 * 60 * 30,
  })
}
