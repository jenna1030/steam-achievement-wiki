import { useQuery } from '@tanstack/react-query'
import { fetchSteamGame } from '../apis/steamApi'

export function useGameDetailQuery(gameId: number) {
  return useQuery({
    queryKey: ['steam', 'game', gameId],
    queryFn: () => fetchSteamGame(gameId),
    enabled: Number.isFinite(gameId) && gameId > 0,
    staleTime: 1000 * 60 * 60,
  })
}
