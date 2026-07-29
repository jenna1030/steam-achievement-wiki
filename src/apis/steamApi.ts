import type { Game } from '../types/game'

const OUTDATED_API_MESSAGE =
  '이전 버전의 API 서버가 실행 중입니다. npm run dev:api를 다시 시작해주세요.'

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
  tags: string[]
  hasAchievements: boolean
}

export interface SteamOwnedGame {
  appid: number
  name: string
  img_icon_url?: string
  playtime_forever: number
  playtime_2weeks?: number
  has_community_visible_stats?: boolean
}

export interface SteamProfile {
  steamId: string
  personName: string
  profileUrl: string
  avatar: string
  avatarMedium: string
  avatarFull: string
  isPublic: boolean
}

export interface SteamPlayerAchievement {
  name: string
  achieved: boolean
  unlockTime: number
}

export interface SteamPlayerAchievementProgress {
  appid: number
  gameName: string
  supported: boolean
  achievedCount: number
  totalCount: number
  isPerfect: boolean
  achievements: SteamPlayerAchievement[]
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
  tagCatalog: string[]
  start: number
  count: number
  totalCount: number
}

interface SteamGameResponse {
  game?: Game
}

interface SteamLibraryResponse {
  gameCount: number
  games: SteamOwnedGame[]
}

interface SteamProfileResponse {
  profile: SteamProfile
}

interface SteamPlayerAchievementResponse {
  progress: SteamPlayerAchievementProgress
}

export interface SteamAchievementOverviewPage {
  start: number
  count: number
  totalGames: number
  nextStart: number | null
  games: SteamPlayerAchievementProgress[]
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
    limit: '30',
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
  tag,
  start,
  count = 20,
}: {
  query: string
  tag: string
  start: number
  count?: number
}) {
  const params = new URLSearchParams({
    query,
    tag,
    start: String(start),
    count: String(count),
    filter: query.trim() ? '' : 'globaltopsellers',
  })
  const response = await fetch(`/api/steam/store-games?${params}`)

  if (!response.ok) {
    throw new Error('Steam Store 게임 목록을 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamStoreGamesResponse

  if (
    !Array.isArray(data.apps) ||
    !Array.isArray(data.tagCatalog) ||
    data.apps.some(
      (game) =>
        !Array.isArray(game.genres) ||
        !Array.isArray(game.tags) ||
        typeof game.hasAchievements !== 'boolean',
    )
  ) {
    throw new Error(OUTDATED_API_MESSAGE)
  }

  return data
}

export async function fetchSteamGame(steamAppId: number) {
  const response = await fetch(`/api/steam/game?appid=${steamAppId}`)

  if (!response.ok) {
    throw new Error('Steam 게임 정보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamGameResponse
  const game = data.game

  if (
    game &&
    (game.genre === 'Steam App' ||
      game.developer === 'Steam 제공' ||
      game.publisher === 'Steam 제공' ||
      game.releaseDate === 'Steam API 기준')
  ) {
    throw new Error(OUTDATED_API_MESSAGE)
  }

  return game
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

export async function fetchSteamProfile() {
  const response = await fetch('/api/steam/profile', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Steam 프로필을 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamProfileResponse

  return data.profile
}

export async function fetchSteamPlayerAchievements(steamAppId: number) {
  const response = await fetch(
    `/api/steam/player-achievements?appid=${steamAppId}`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error('내 Steam 도전과제 진행률을 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamPlayerAchievementResponse

  return data.progress
}

export async function fetchSteamAchievementOverview(start: number) {
  const response = await fetch(
    `/api/steam/achievement-overview?start=${start}`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error('Steam 도전과제 달성 현황을 집계하지 못했습니다.')
  }

  return (await response.json()) as SteamAchievementOverviewPage
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
