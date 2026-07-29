import { describe, expect, it } from 'vitest'
import type { SteamStoreGame } from '../apis/steamApi'
import { mergeUniqueSteamStoreGames } from './storeGamePagination'

function createGame(appid: number, name: string): SteamStoreGame {
  return {
    appid,
    name,
    image: '',
    releaseDate: '',
    genres: [],
    tags: [],
    achievementCount: 0,
    hasAchievements: false,
  }
}

describe('mergeUniqueSteamStoreGames', () => {
  it('keeps one card per appid and applies the newest page data', () => {
    const games = mergeUniqueSteamStoreGames([
      {
        apps: [
          createGame(10, 'First'),
          createGame(20, 'Old title'),
        ],
      },
      {
        apps: [
          createGame(20, 'Updated title'),
          createGame(30, 'Third'),
        ],
      },
    ])

    expect(games.map((game) => game.appid)).toEqual([10, 20, 30])
    expect(games[1].name).toBe('Updated title')
  })
})
