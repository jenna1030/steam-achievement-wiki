import { useQuery } from '@tanstack/react-query'
import { fetchSteamProfile } from '../apis/steamApi'

export function useSteamProfileQuery(steamId: string | undefined) {
  return useQuery({
    queryKey: ['steam', 'profile', steamId],
    queryFn: fetchSteamProfile,
    enabled: Boolean(steamId),
    staleTime: 1000 * 60 * 10,
  })
}
