import { useQuery } from '@tanstack/react-query'
import { fetchSteamGlobalAchievementPercentages } from '../apis/steamApi'

export function useSteamAchievementPercentagesQuery(steamAppId: number) {
  return useQuery({
    queryKey: ['steam', 'global-achievement-percentages', steamAppId],
    queryFn: () => fetchSteamGlobalAchievementPercentages(steamAppId),
    enabled: Number.isFinite(steamAppId),
    staleTime: 1000 * 60 * 30,
  })
}
