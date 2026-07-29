import { describe, expect, it } from 'vitest'
import type { AchievementGuide } from '../types/guide'
import { getGuideFeedbackKey } from './guideFeedback'
import {
  getEffectiveGuideLikeCount,
  selectMostLikedGuide,
} from './guideRanking'

function createGuide(id: number, likeCount: number): AchievementGuide {
  return {
    id,
    achievementId: 'steam-1-TEST',
    source: 'example',
    ownerSteamId: null,
    title: `공략 ${id}`,
    author: '테스터',
    hint: '힌트',
    detail: '상세',
    hasSpoiler: false,
    spoiler: '',
    conditions: [],
    supplies: [],
    warnings: [],
    recommendedOrder: [],
    tags: [],
    dlcRequirement: 'unknown',
    multiplayerRequirement: 'unknown',
    isMissable: false,
    requiresSecondRun: false,
    difficulty: '보통',
    estimatedMinutes: 10,
    likeCount,
    dislikeCount: 0,
    createdAt: '',
    updatedAt: '',
  }
}

describe('guide ranking', () => {
  it('좋아요 수가 가장 높은 공략을 선택한다', () => {
    const guides = [createGuide(1, 2), createGuide(2, 8), createGuide(3, 5)]

    expect(selectMostLikedGuide(guides, {}, null)?.id).toBe(2)
  })

  it('현재 사용자의 좋아요를 선택 수에 반영한다', () => {
    const guide = createGuide(1, 2)
    const reactions = {
      [getGuideFeedbackKey(guide.id, '7656')]: 'like' as const,
    }

    expect(getEffectiveGuideLikeCount(guide, reactions, '7656')).toBe(3)
  })

  it('동률이면 먼저 등록된 후보를 유지한다', () => {
    const guides = [createGuide(1, 4), createGuide(2, 4)]

    expect(selectMostLikedGuide(guides, {}, null)?.id).toBe(1)
  })
})
