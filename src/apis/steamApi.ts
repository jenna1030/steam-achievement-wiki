export interface SteamGlobalAchievement {
  name: string
  percent: number | string
}

export interface SteamAchievement {
  name: string
  percent: number
  displayName: string
  description: string
  icon: string
  icongray: string
  hidden: number
}

export interface SteamApp {
  appid: number
  name: string
}

export interface SteamStoreGame {
  appid: number
  name: string
  image: string
  releaseDate: string
  genres: string[]
  hasAchievements: boolean
}

export interface SteamOwnedGame {
  appid: number
  name: string
  img_icon_url?: string
  playtime_forever: number
  playtime_2weeks?: number
}

interface SteamGlobalAchievementResponse {
  achievementpercentages?: {
    achievements?: SteamGlobalAchievement[]
  }
}

interface SteamAchievementsResponse {
  achievements?: SteamAchievement[]
}

interface SteamAppListResponse {
  apps?: SteamApp[]
}

interface SteamStoreGamesResponse {
  apps: SteamStoreGame[]
  start: number
  count: number
  totalCount: number
}

interface SteamGameResponse {
  game?: import('../types/game').Game
}

interface SteamLibraryResponse {
  gameCount: number
  games: SteamOwnedGame[]
}

export interface SteamSessionUser {
  steamId: string
}

interface SteamSessionResponse {
  user: SteamSessionUser | null
}

export async function fetchSteamGlobalAchievementPercentages(
  steamAppId: number,
) {
  const response = await fetch(
    `/steam-api/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${steamAppId}&format=json`,
  )

  if (!response.ok) {
    throw new Error('Steam 공개 도전과제 달성률을 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamGlobalAchievementResponse

  return data.achievementpercentages?.achievements ?? []
}

export async function fetchSteamAchievements(steamAppId: number) {
  const response = await fetch(
    `/api/steam/achievements?appid=${steamAppId}&lang=koreana`,
  )

  if (!response.ok) {
    throw new Error('Steam 도전과제 정보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamAchievementsResponse

  return data.achievements ?? []
}

export async function fetchSteamAppList(query: string) {
  const params = new URLSearchParams({
    query,
    limit: '12',
  })
  const response = await fetch(`/api/steam/apps?${params}`)

  if (!response.ok) {
    throw new Error('Steam 앱 목록을 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamAppListResponse

  return data.apps ?? []
}

export async function fetchSteamStoreGames({
  query,
  start,
  count = 20,
}: {
  query: string
  start: number
  count?: number
}) {
  const params = new URLSearchParams({
    query,
    start: String(start),
    count: String(count),
    filter: query.trim() ? '' : 'globaltopsellers',
  })
  const response = await fetch(`/api/steam/store-games?${params}`)

  if (!response.ok) {
    throw new Error('Steam Store 게임 목록을 불러오지 못했습니다.')
  }

  return (await response.json()) as SteamStoreGamesResponse
}

export async function fetchSteamGame(steamAppId: number) {
  const response = await fetch(`/api/steam/game?appid=${steamAppId}`)

  if (!response.ok) {
    throw new Error('Steam 게임 정보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamGameResponse

  return data.game
}

export async function fetchSteamLibrary() {
  const response = await fetch('/api/steam/library', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Steam 라이브러리를 불러오지 못했습니다.')
  }

  return (await response.json()) as SteamLibraryResponse
}

export async function fetchSteamSession() {
  const response = await fetch('/api/auth/session', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Steam 로그인 상태를 확인하지 못했습니다.')
  }

  const data = (await response.json()) as SteamSessionResponse

  return data.user
}

export async function clearSteamSession() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Steam 로그아웃을 완료하지 못했습니다.')
  }
}
