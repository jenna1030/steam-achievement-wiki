import { describe, expect, it } from 'vitest'
import { getExampleGuidesForAchievement } from './exampleGuides'
import { createSteamAchievementId } from '../utils/achievementIdentity'

describe('example guides', () => {
  it('할로우 나이트 부적 도전과제에 읽기 전용 예시 두 개를 제공한다', () => {
    const guides = getExampleGuidesForAchievement(
      createSteamAchievementId(367520, 'CHARMED'),
    )

    expect(guides).toHaveLength(2)
    expect(guides.every((guide) => guide.source === 'example')).toBe(true)
    expect(guides.some((guide) => guide.hasSpoiler)).toBe(true)
    expect(guides.some((guide) => !guide.hasSpoiler)).toBe(true)
  })
})
