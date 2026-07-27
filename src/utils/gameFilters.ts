import type { Game } from '../types/game'
import type { GameSearchFilters } from '../types/search'

export function getGameGenres(games: Game[]) {
  return Array.from(new Set(games.map((game) => game.genre))).sort()
}

export function filterGames(games: Game[], filters: GameSearchFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase()

  return games.filter((game) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      game.title.toLowerCase().includes(normalizedQuery) ||
      game.description.toLowerCase().includes(normalizedQuery) ||
      game.genre.toLowerCase().includes(normalizedQuery)

    const matchesGenre = filters.genre === 'all' || game.genre === filters.genre

    const matchesAchievementFilter =
      filters.achievementFilter === 'all' || game.hasAchievements

    return matchesQuery && matchesGenre && matchesAchievementFilter
  })
}
