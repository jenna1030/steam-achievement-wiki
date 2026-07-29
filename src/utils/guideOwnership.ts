import type { AchievementGuide } from '../types/guide'

export function isGuideOwnedBy(
  guide: AchievementGuide,
  steamId: string | undefined,
) {
  return guide.ownerSteamId === (steamId ?? null)
}

export function getGuidesForOwner(
  guides: AchievementGuide[],
  steamId: string | undefined,
) {
  return guides.filter((guide) => isGuideOwnedBy(guide, steamId))
}
