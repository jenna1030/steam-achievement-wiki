import { describe, expect, it } from 'vitest'
import {
  createSteamAchievementId,
  getGameIdFromAchievementId,
  matchesAchievementId,
} from './achievementIdentity'

describe('achievement identity', () => {
  it('Steam API 이름을 URL에 안전한 안정 ID로 변환한다', () => {
    const id = createSteamAchievementId(367520, 'ACHIEVEMENT 100%')

    expect(id).toBe('steam-367520-ACHIEVEMENT~20100~25')
    expect(getGameIdFromAchievementId(id)).toBe(367520)
  })

  it('기존 숫자 ID에서도 게임 appid를 복구한다', () => {
    expect(getGameIdFromAchievementId(String(367520 * 100000 + 12))).toBe(
      367520,
    )
  })

  it('안정 ID와 기존 ID를 모두 같은 도전과제로 인식한다', () => {
    const achievement = {
      id: 'steam-367520-CHARMED',
      legacyId: 36752000001,
    }

    expect(
      matchesAchievementId(
        achievement as Parameters<typeof matchesAchievementId>[0],
        'steam-367520-CHARMED',
      ),
    ).toBe(true)
    expect(
      matchesAchievementId(
        achievement as Parameters<typeof matchesAchievementId>[0],
        '36752000001',
      ),
    ).toBe(true)
  })
})
