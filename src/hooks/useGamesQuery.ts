import { useQuery } from '@tanstack/react-query'
import { fetchSteamGame } from '../apis/steamApi'
import type { Game } from '../types/game'

export const DEFAULT_FEATURED_STEAM_APP_IDS = [1145350, 413150, 367520]

async function fetchFeaturedSteamGames(steamAppIds: number[]) {
  const games = await Promise.all(
    steamAppIds.map((steamAppId) => fetchSteamGame(steamAppId)),
  )

  return games.filter((game): game is Game => Boolean(game))
}

export function useFeaturedGamesQuery(steamAppIds: number[]) {
  return useQuery({
    queryKey: ['steam', 'games', 'featured', steamAppIds],
    queryFn: () => fetchFeaturedSteamGames(steamAppIds),
    enabled: steamAppIds.length > 0,
  })
}
