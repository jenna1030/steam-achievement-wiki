import { useQuery } from '@tanstack/react-query'
import {
  fetchAchievementById,
  fetchAchievementsByGameId,
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
