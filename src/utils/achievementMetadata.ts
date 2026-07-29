import type { Achievement } from '../types/achievement'
import type { AchievementGuide } from '../types/guide'

export function getAchievementTags(achievement: Achievement) {
  return achievement.tags.length > 0 ? achievement.tags : ['태그 없음']
}

export function getAchievementNotices(achievement: Achievement) {
  return [
    achievement.isHidden ? '숨겨진 도전과제' : null,
    achievement.dlcRequirement === 'required' ? 'DLC 필요' : null,
    achievement.dlcRequirement === 'not-required' ? '본편만으로 가능' : null,
    achievement.multiplayerRequirement === 'required'
      ? '멀티플레이 필요'
      : null,
    achievement.multiplayerRequirement === 'not-required'
      ? '싱글 플레이 가능'
      : null,
    achievement.isMissable === true ? '놓치기 쉬움' : null,
    achievement.isMissable === false ? '상시 도전 가능' : null,
    achievement.requiresSecondRun === true ? '2회차 필요' : null,
    achievement.requiresSecondRun === false ? '1회차 가능' : null,
  ].filter(
    (label): label is string =>
      Boolean(label) && !achievement.tags.includes(String(label)),
  )
}

export function applyGuideMetadata(
  achievement: Achievement,
  guide?: AchievementGuide,
): Achievement {
  if (!guide) {
    return achievement
  }

  return {
    ...achievement,
    tags: guide.tags.length > 0 ? guide.tags : achievement.tags,
    estimatedMinutes: guide.estimatedMinutes,
    dlcRequirement: guide.dlcRequirement,
    multiplayerRequirement: guide.multiplayerRequirement,
    isMissable: guide.isMissable,
    requiresSecondRun: guide.requiresSecondRun,
  }
}
