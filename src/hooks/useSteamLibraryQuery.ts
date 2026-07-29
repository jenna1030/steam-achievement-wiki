import { useQuery } from '@tanstack/react-query'
import { fetchSteamLibrary } from '../apis/steamApi'

export function useSteamLibraryQuery(steamId: string | undefined) {
  return useQuery({
    queryKey: ['steam', 'library', steamId],
    queryFn: () => fetchSteamLibrary(String(steamId)),
    enabled: Boolean(steamId),
    staleTime: 1000 * 60 * 10,
  })
}
