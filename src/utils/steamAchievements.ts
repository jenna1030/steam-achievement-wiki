import type { SteamGlobalAchievement } from '../apis/steamApi'
import type { Achievement } from '../types/achievement'

export function mergeSteamAchievements(
  achievements: Achievement[],
  steamAchievements: SteamGlobalAchievement[],
) {
  const steamAchievementMap = new Map(
    steamAchievements.map((achievement) => [
      achievement.name,
      Number(achievement.percent),
    ]),
  )

  const curatedAchievements = achievements.map((achievement) => {
    if (!achievement.steamAchievementName) {
      return achievement
    }

    const steamRate = steamAchievementMap.get(achievement.steamAchievementName)

    if (steamRate === undefined || Number.isNaN(steamRate)) {
      return achievement
    }

    return {
      ...achievement,
      source: achievement.source ?? 'curated',
      globalRate: Number(steamRate.toFixed(1)),
    }
  })

  return curatedAchievements
}

export function countSteamAchievementMatches(
  achievements: Achievement[],
  steamAchievements: SteamGlobalAchievement[],
) {
  const steamAchievementNames = new Set(
    steamAchievements.map((achievement) => achievement.name),
  )

  return achievements.filter(
    (achievement) =>
      achievement.steamAchievementName !== undefined &&
      steamAchievementNames.has(achievement.steamAchievementName),
  ).length
}

export const mergeSteamAchievementPercentages = mergeSteamAchievements
