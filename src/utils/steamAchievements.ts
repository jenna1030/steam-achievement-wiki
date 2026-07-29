import type { SteamAchievement } from '../apis/steamApi'
import type { Achievement, AchievementDifficulty } from '../types/achievement'
import {
  createLegacyAchievementId,
  createSteamAchievementId,
} from './achievementIdentity'

function getDifficultyFromPercent(percent: number): AchievementDifficulty {
  if (percent >= 50) {
    return 'easy'
  }

  if (percent >= 20) {
    return 'normal'
  }

  if (percent >= 5) {
    return 'hard'
  }

  return 'very-hard'
}

function createSteamAchievement(
  steamAchievement: SteamAchievement,
  gameId: number,
  index: number,
): Achievement {
  return {
    id: createSteamAchievementId(gameId, steamAchievement.name),
    legacyId: createLegacyAchievementId(gameId, index),
    gameId,
    source: 'steam',
    title: steamAchievement.displayName || steamAchievement.name,
    description:
      steamAchievement.description ||
      'Steam schema에서 설명을 제공하지 않는 도전과제입니다.',
    steamAchievementName: steamAchievement.name,
    iconUrl: steamAchievement.icon,
    globalRate: Number(steamAchievement.percent.toFixed(1)),
    difficulty: getDifficultyFromPercent(steamAchievement.percent),
    estimatedMinutes: 0,
    tags: [],
    isHidden: steamAchievement.hidden === 1,
    isMissable: null,
    requiresSecondRun: null,
    dlcRequirement: 'unknown',
    multiplayerRequirement: 'unknown',
    platformNotes: [],
    bugNotes: [],
  }
}

export function mapSteamAchievements(
  steamAchievements: SteamAchievement[],
  gameId: number,
) {
  return steamAchievements.map((achievement, index) =>
    createSteamAchievement(achievement, gameId, index + 1),
  )
}

export function mergeSteamAchievements(
  achievements: Achievement[],
  steamAchievements: SteamAchievement[],
  gameId: number,
) {
  const steamAchievementMap = new Map(
    steamAchievements.map((achievement) => [achievement.name, achievement]),
  )

  const mappedSteamNames = new Set(
    achievements
      .map((achievement) => achievement.steamAchievementName)
      .filter((name): name is string => Boolean(name)),
  )

  const curatedAchievements = achievements.map((achievement) => {
    if (!achievement.steamAchievementName) {
      return achievement
    }

    const steamAchievement = steamAchievementMap.get(
      achievement.steamAchievementName,
    )

    if (!steamAchievement) {
      return achievement
    }

    return {
      ...achievement,
      source: achievement.source ?? 'curated',
      iconUrl: achievement.iconUrl || steamAchievement.icon,
      globalRate: Number(steamAchievement.percent.toFixed(1)),
      isHidden: achievement.isHidden || steamAchievement.hidden === 1,
    }
  })

  const steamOnlyAchievements = steamAchievements
    .filter((achievement) => !mappedSteamNames.has(achievement.name))
    .map((achievement, index) =>
      createSteamAchievement(achievement, gameId, index + 1),
    )

  return [...curatedAchievements, ...steamOnlyAchievements]
}

export function countSteamAchievementMatches(
  achievements: Achievement[],
  steamAchievements: SteamAchievement[],
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
