import { useQuery } from '@tanstack/react-query'
import { fetchSteamAppList } from '../apis/steamApi'

export function useSteamAppsQuery() {
  return useQuery({
    queryKey: ['steam', 'apps'],
    queryFn: fetchSteamAppList,
    enabled: false,
    staleTime: 1000 * 60 * 60,
  })
}
