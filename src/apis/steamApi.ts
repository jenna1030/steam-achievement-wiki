export interface SteamGlobalAchievement {
  name: string
  percent: number | string
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

interface SteamAppListResponse {
  response?: {
    apps?: SteamApp[]
  }
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

export async function fetchSteamAppList() {
  const apiKey = import.meta.env.VITE_STEAM_API_KEY as string | undefined

  if (!apiKey) {
    throw new Error('Steam API Key가 필요합니다.')
  }

  const params = new URLSearchParams({
    key: apiKey,
    include_games: 'true',
    include_dlc: 'false',
    include_software: 'false',
    include_videos: 'false',
    include_hardware: 'false',
    max_results: '1000',
  })
  const response = await fetch(`/steam-api/IStoreService/GetAppList/v1/?${params}`)

  if (!response.ok) {
    throw new Error('Steam 공개 앱 목록을 불러오지 못했습니다.')
  }

  const data = (await response.json()) as SteamAppListResponse

  return data.response?.apps?.filter((app) => app.name.trim().length > 0) ?? []
}
