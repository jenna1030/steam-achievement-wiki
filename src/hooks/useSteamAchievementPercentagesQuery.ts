import { useQuery } from '@tanstack/react-query'
import { fetchSteamAchievements } from '../apis/steamApi'

export function useSteamAchievementPercentagesQuery(steamAppId: number) {
  return useQuery({
    queryKey: ['steam', 'achievements', steamAppId],
    queryFn: () => fetchSteamAchievements(steamAppId),
    enabled: Number.isFinite(steamAppId),
    staleTime: 1000 * 60 * 30,
  })
}
