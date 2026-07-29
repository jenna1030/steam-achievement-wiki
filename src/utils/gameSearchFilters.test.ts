import { describe, expect, it } from 'vitest'
import { matchesAchievementCountFilter } from './gameSearchFilters'

describe('game achievement count filters', () => {
  it('matches games that have at least one achievement', () => {
    expect(
      matchesAchievementCountFilter(
        { achievementCount: 0 },
        'with-achievements',
      ),
    ).toBe(false)
    expect(
      matchesAchievementCountFilter(
        { achievementCount: 1 },
        'with-achievements',
      ),
    ).toBe(true)
  })

  it('keeps the achievement count ranges mutually exclusive', () => {
    expect(
      matchesAchievementCountFilter(
        { achievementCount: 10 },
        'up-to-10',
      ),
    ).toBe(true)
    expect(
      matchesAchievementCountFilter(
        { achievementCount: 11 },
        '11-to-50',
      ),
    ).toBe(true)
    expect(
      matchesAchievementCountFilter(
        { achievementCount: 50 },
        '11-to-50',
      ),
    ).toBe(true)
    expect(
      matchesAchievementCountFilter(
        { achievementCount: 51 },
        'over-50',
      ),
    ).toBe(true)
  })
})
