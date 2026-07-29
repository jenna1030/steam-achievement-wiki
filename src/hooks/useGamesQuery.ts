import { useQuery } from '@tanstack/react-query'
import { fetchSteamGame } from '../apis/steamApi'
import type { Game } from '../types/game'

const FEATURED_STEAM_APP_IDS = [1145350, 413150, 367520]

async function fetchFeaturedSteamGames() {
  const games = await Promise.all(
    FEATURED_STEAM_APP_IDS.map((steamAppId) => fetchSteamGame(steamAppId)),
  )

  return games.filter((game): game is Game => Boolean(game))
}

export function useGamesQuery() {
  return useQuery({
    queryKey: ['steam', 'games', 'featured'],
    queryFn: fetchFeaturedSteamGames,
  })
}

export function useFeaturedGamesQuery() {
  return useGamesQuery()
}
