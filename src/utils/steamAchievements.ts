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
