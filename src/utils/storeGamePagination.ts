import type { SteamStoreGame } from '../apis/steamApi'

interface SteamStoreGamePage {
  apps: SteamStoreGame[]
}

export function mergeUniqueSteamStoreGames(
  pages: SteamStoreGamePage[] | undefined,
) {
  const gamesByAppId = new Map<number, SteamStoreGame>()

  for (const page of pages ?? []) {
    for (const game of page.apps) {
      gamesByAppId.set(game.appid, game)
    }
  }

  return [...gamesByAppId.values()]
}
