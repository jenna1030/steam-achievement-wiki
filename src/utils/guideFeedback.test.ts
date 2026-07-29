import { describe, expect, it } from 'vitest'
import {
  addGuideReport,
  getGuideFeedbackKey,
  parseGuideFeedbackStorage,
  toggleGuideReaction,
  type GuideFeedbackStorage,
} from './guideFeedback'

describe('guide feedback', () => {
  const emptyFeedback: GuideFeedbackStorage = {
    reactions: {},
    reports: [],
  }
  const feedbackKey = getGuideFeedbackKey(10, '7656')

  it('좋아요를 다시 누르면 취소하고 싫어요로 전환할 수 있다', () => {
    const liked = toggleGuideReaction(emptyFeedback, feedbackKey, 'like')
    const disliked = toggleGuideReaction(liked, feedbackKey, 'dislike')
    const removed = toggleGuideReaction(disliked, feedbackKey, 'dislike')

    expect(liked.reactions[feedbackKey]).toBe('like')
    expect(disliked.reactions[feedbackKey]).toBe('dislike')
    expect(removed.reactions[feedbackKey]).toBeUndefined()
  })

  it('동일 사용자의 중복 신고를 한 번만 저장한다', () => {
    const reported = addGuideReport(emptyFeedback, feedbackKey)
    const duplicated = addGuideReport(reported, feedbackKey)

    expect(duplicated.reports).toEqual([feedbackKey])
    expect(duplicated).toBe(reported)
  })

  it('저장된 평가와 신고에서 잘못된 값을 제거한다', () => {
    expect(
      parseGuideFeedbackStorage({
        reactions: { valid: 'like', invalid: 'maybe' },
        reports: ['report', 'report', 3],
      }),
    ).toEqual({
      reactions: { valid: 'like' },
      reports: ['report'],
    })
  })
})
