import type { AchievementGuide } from '../types/guide'
import {
  getGuideFeedbackKey,
  type GuideReaction,
} from './guideFeedback'

export function getEffectiveGuideLikeCount(
  guide: AchievementGuide,
  reactions: Record<string, GuideReaction>,
  actorSteamId: string | null,
) {
  const reaction = reactions[getGuideFeedbackKey(guide.id, actorSteamId)]

  return guide.likeCount + (reaction === 'like' ? 1 : 0)
}

export function selectMostLikedGuide(
  guides: AchievementGuide[],
  reactions: Record<string, GuideReaction>,
  actorSteamId: string | null,
) {
  return guides.reduce<AchievementGuide | undefined>((selected, guide) => {
    if (!selected) {
      return guide
    }

    const selectedLikeCount = getEffectiveGuideLikeCount(
      selected,
      reactions,
      actorSteamId,
    )
    const guideLikeCount = getEffectiveGuideLikeCount(
      guide,
      reactions,
      actorSteamId,
    )

    return guideLikeCount > selectedLikeCount ? guide : selected
  }, undefined)
}
