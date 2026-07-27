import type { SteamGlobalAchievement } from '../apis/steamApi'
import type { Achievement, AchievementDifficulty } from '../types/achievement'

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
  steamAchievement: SteamGlobalAchievement,
  gameId: number,
  index: number,
): Achievement {
  const percent = Number(steamAchievement.percent)

  return {
    id: gameId * 100000 + index,
    gameId,
    source: 'steam',
    title: steamAchievement.name,
    description:
      'Steam 공개 API에서 가져온 도전과제입니다. 공개 API는 이름 토큰과 전체 유저 달성률만 제공합니다.',
    steamAchievementName: steamAchievement.name,
    iconUrl: '',
    globalRate: Number(percent.toFixed(1)),
    difficulty: getDifficultyFromPercent(percent),
    estimatedMinutes: 0,
    tags: ['Steam API'],
    isHidden: false,
    isMissable: false,
    requiresSecondRun: false,
    requiresDlc: false,
    requiresMultiplayer: false,
    platformNotes: [],
    bugNotes: [],
  }
}

export function mergeSteamAchievements(
  achievements: Achievement[],
  steamAchievements: SteamGlobalAchievement[],
  gameId: number,
) {
  const steamAchievementMap = new Map(
    steamAchievements.map((achievement) => [
      achievement.name,
      Number(achievement.percent),
    ]),
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

  const steamOnlyAchievements = steamAchievements
    .filter((achievement) => !mappedSteamNames.has(achievement.name))
    .map((achievement, index) =>
      createSteamAchievement(achievement, gameId, index + 1),
    )

  return [...curatedAchievements, ...steamOnlyAchievements]
}

export const mergeSteamAchievementPercentages = mergeSteamAchievements
