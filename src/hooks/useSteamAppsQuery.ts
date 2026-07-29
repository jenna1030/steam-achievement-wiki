import { useQuery } from '@tanstack/react-query'
import { fetchSteamAppList } from '../apis/steamApi'

export function useSteamAppsQuery(query: string) {
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: ['steam', 'apps', normalizedQuery],
    queryFn: () => fetchSteamAppList(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
    staleTime: 1000 * 60 * 60,
  })
}
