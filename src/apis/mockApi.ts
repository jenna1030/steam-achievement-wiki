import { achievements } from '../mocks/achievements'
import { games } from '../mocks/games'
import type { Achievement } from '../types/achievement'
import type { Game } from '../types/game'

const MOCK_DELAY_MS = 220

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), MOCK_DELAY_MS)
  })
}

export function fetchGames(): Promise<Game[]> {
  return delay(games)
}

export function fetchFeaturedGames(): Promise<Game[]> {
  return delay(games.filter((game) => game.isPopular))
}

export function fetchGameById(gameId: number): Promise<Game | undefined> {
  return delay(games.find((game) => game.id === gameId))
}

export function fetchAchievementsByGameId(
  gameId: number,
): Promise<Achievement[]> {
  return delay(
    achievements.filter((achievement) => achievement.gameId === gameId),
  )
}

export function fetchAchievementById(
  achievementId: number,
): Promise<Achievement | undefined> {
  return delay(
    achievements.find((achievement) => achievement.id === achievementId),
  )
}
