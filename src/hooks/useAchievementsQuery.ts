import { useQuery } from '@tanstack/react-query'
import {
  fetchAchievementById,
  fetchAchievementsByGameId,
  fetchGuidesByAchievementId,
} from '../apis/mockApi'

export function useAchievementsQuery(gameId: number) {
  return useQuery({
    queryKey: ['achievements', 'game', gameId],
    queryFn: () => fetchAchievementsByGameId(gameId),
    enabled: Number.isFinite(gameId),
  })
}

export function useAchievementDetailQuery(achievementId: number) {
  return useQuery({
    queryKey: ['achievements', achievementId],
    queryFn: () => fetchAchievementById(achievementId),
    enabled: Number.isFinite(achievementId),
  })
}

export function useAchievementGuidesQuery(achievementId: number) {
  return useQuery({
    queryKey: ['guides', 'achievement', achievementId],
    queryFn: () => fetchGuidesByAchievementId(achievementId),
    enabled: Number.isFinite(achievementId),
  })
}
