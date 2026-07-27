import { useQuery } from '@tanstack/react-query'
import { fetchGameById } from '../apis/mockApi'

export function useGameDetailQuery(gameId: number) {
  return useQuery({
    queryKey: ['games', gameId],
    queryFn: () => fetchGameById(gameId),
    enabled: Number.isFinite(gameId),
  })
}
