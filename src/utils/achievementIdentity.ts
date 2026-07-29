import type { Achievement, AchievementId } from '../types/achievement'

const STEAM_ACHIEVEMENT_PREFIX = 'steam'
const LEGACY_ID_UNIT = 100000

function encodeIdentityPart(value: string) {
  return encodeURIComponent(value).replaceAll('%', '~')
}

export function createSteamAchievementId(
  gameId: number,
  steamAchievementName: string,
): AchievementId {
  return `${STEAM_ACHIEVEMENT_PREFIX}-${gameId}-${encodeIdentityPart(
    steamAchievementName,
  )}`
}

export function createLegacyAchievementId(gameId: number, index: number) {
  return gameId * LEGACY_ID_UNIT + index
}

export function normalizeAchievementId(value: unknown): AchievementId {
  return typeof value === 'string' ? value : String(value ?? '')
}

export function getGameIdFromAchievementId(
  achievementId: AchievementId,
): number | null {
  const stableMatch = achievementId.match(/^steam-(\d+)-/)

  if (stableMatch) {
    return Number(stableMatch[1])
  }

  if (/^\d+$/.test(achievementId)) {
    const legacyId = Number(achievementId)

    if (Number.isSafeInteger(legacyId) && legacyId >= LEGACY_ID_UNIT) {
      return Math.floor(legacyId / LEGACY_ID_UNIT)
    }
  }

  return null
}

export function matchesAchievementId(
  achievement: Achievement,
  achievementId: AchievementId,
) {
  return (
    achievement.id === achievementId ||
    String(achievement.legacyId ?? '') === achievementId
  )
}

export function getAchievementPath(achievementId: AchievementId) {
  return `/achievements/${achievementId}`
}
