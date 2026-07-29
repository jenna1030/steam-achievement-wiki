import { describe, expect, it } from 'vitest'
import type { AchievementGuide } from '../types/guide'
import { getGuidesForOwner, isGuideOwnedBy } from './guideOwnership'

function createGuide(id: number, ownerSteamId: string | null) {
  return {
    id,
    ownerSteamId,
  } as AchievementGuide
}

describe('guide ownership', () => {
  const guides = [
    createGuide(1, 'steam-user-a'),
    createGuide(2, 'steam-user-b'),
    createGuide(3, null),
  ]

  it('로그인 계정의 공략만 반환한다', () => {
    expect(getGuidesForOwner(guides, 'steam-user-a').map((guide) => guide.id))
      .toEqual([1])
  })

  it('로그아웃 상태에서는 익명 공략만 반환한다', () => {
    expect(getGuidesForOwner(guides, undefined).map((guide) => guide.id))
      .toEqual([3])
    expect(isGuideOwnedBy(guides[2], undefined)).toBe(true)
  })
})
