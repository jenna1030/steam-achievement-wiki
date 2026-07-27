import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedGames, fetchGames } from '../apis/mockApi'

export function useGamesQuery() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  })
}

export function useFeaturedGamesQuery() {
  return useQuery({
    queryKey: ['games', 'featured'],
    queryFn: fetchFeaturedGames,
  })
}
