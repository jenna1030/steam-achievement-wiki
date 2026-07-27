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

interface SteamGlobalAchievementResponse {
  achievementpercentages?: {
    achievements?: SteamGlobalAchievement[]
  }
}

interface SteamAchievementsResponse {
  achievements?: SteamAchievement[]
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

export async function fetchSteamAppList() {
  throw new Error(
    'Steam 앱 목록 API는 API Key가 필요하므로 백엔드 프록시에서 호출해야 합니다.',
  )
}
