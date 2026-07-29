import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  fetchSteamAchievementOverview,
  fetchSteamPlayerAchievements,
} from '../apis/steamApi'

export function useSteamPlayerAchievementsQuery(
  steamId: string | undefined,
  appid: number,
) {
  return useQuery({
    queryKey: ['steam', 'player-achievements', steamId, appid],
    queryFn: () => fetchSteamPlayerAchievements(appid),
    enabled: Boolean(steamId) && Number.isFinite(appid),
    staleTime: 1000 * 60 * 15,
  })
}

export function useSteamAchievementOverviewQuery(
  steamId: string | undefined,
) {
  return useInfiniteQuery({
    queryKey: ['steam', 'achievement-overview', steamId],
    queryFn: ({ pageParam }) => fetchSteamAchievementOverview(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart ?? undefined,
    enabled: Boolean(steamId),
    staleTime: 1000 * 60 * 15,
  })
}
