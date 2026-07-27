export interface SteamGlobalAchievement {
  name: string
  percent: number
}

interface SteamGlobalAchievementResponse {
  achievementpercentages?: {
    achievements?: SteamGlobalAchievement[]
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
