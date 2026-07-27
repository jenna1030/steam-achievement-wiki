import type { SteamGlobalAchievement } from '../apis/steamApi'
import type { Achievement } from '../types/achievement'

export function mergeSteamAchievementPercentages(
  achievements: Achievement[],
  steamAchievements: SteamGlobalAchievement[],
) {
  const steamAchievementMap = new Map(
    steamAchievements.map((achievement) => [
      achievement.name,
      Number(achievement.percent),
    ]),
  )

  return achievements.map((achievement) => {
    if (!achievement.steamAchievementName) {
      return achievement
    }

    const steamRate = steamAchievementMap.get(achievement.steamAchievementName)

    if (steamRate === undefined || Number.isNaN(steamRate)) {
      return achievement
    }

    return {
      ...achievement,
      globalRate: Number(steamRate.toFixed(1)),
    }
  })
}
