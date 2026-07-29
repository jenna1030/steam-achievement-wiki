import { useQuery } from '@tanstack/react-query'
import { fetchSteamAchievements } from '../apis/steamApi'
import type { AchievementGuide } from '../types/guide'
import { mapSteamAchievements } from '../utils/steamAchievements'

const STEAM_ONLY_ID_UNIT = 100000

function getSteamGameIdFromAchievementId(achievementId: number) {
  if (!Number.isFinite(achievementId) || achievementId < STEAM_ONLY_ID_UNIT) {
    return Number.NaN
  }

  return Math.floor(achievementId / STEAM_ONLY_ID_UNIT)
}

export function useAchievementsQuery(gameId: number) {
  return useQuery({
    queryKey: ['steam', 'achievements', gameId],
    queryFn: async () => {
      const steamAchievements = await fetchSteamAchievements(gameId)

      return mapSteamAchievements(steamAchievements, gameId)
    },
    enabled: Number.isFinite(gameId),
    staleTime: 1000 * 60 * 30,
  })
}

export function useAchievementDetailQuery(achievementId: number) {
  const gameId = getSteamGameIdFromAchievementId(achievementId)

  return useQuery({
    queryKey: ['steam', 'achievement', achievementId],
    queryFn: async () => {
      const steamAchievements = await fetchSteamAchievements(gameId)
      const achievements = mapSteamAchievements(steamAchievements, gameId)

      return achievements.find((achievement) => achievement.id === achievementId)
    },
    enabled: Number.isFinite(gameId),
    staleTime: 1000 * 60 * 30,
  })
}

export function useAchievementGuidesQuery(achievementId: number) {
  return useQuery({
    queryKey: ['guides', 'achievement', achievementId],
    queryFn: async (): Promise<AchievementGuide[]> => [],
    enabled: Number.isFinite(achievementId),
  })
}
