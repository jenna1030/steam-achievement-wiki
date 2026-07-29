import { describe, expect, it } from 'vitest'
import type { Achievement } from '../types/achievement'
import type { Game } from '../types/game'
import {
  recommendEasyAchievements,
  selectHomeGameIds,
} from './recommendAchievements'

function createGame(id: number): Game {
  return {
    id,
    steamAppId: id,
    title: `Game ${id}`,
    description: '',
    genre: '',
    developer: '',
    publisher: '',
    releaseDate: '',
    image: '',
    storeUrl: '',
    achievementCount: 1,
    hasAchievements: true,
  }
}

function createAchievement(
  id: string,
  gameId: number,
  globalRate: number,
  overrides: Partial<Achievement> = {},
): Achievement {
  return {
    id,
    gameId,
    title: id,
    description: '',
    iconUrl: '',
    globalRate,
    difficulty: 'normal',
    estimatedMinutes: 0,
    tags: [],
    isHidden: false,
    isMissable: null,
    requiresSecondRun: null,
    dlcRequirement: 'unknown',
    multiplayerRequirement: 'unknown',
    platformNotes: [],
    bugNotes: [],
    ...overrides,
  }
}

describe('easy achievement recommendations', () => {
  it('관심 게임을 우선하고 부족한 자리는 기본 게임으로 채운다', () => {
    expect(selectHomeGameIds([10, 20], [20, 30, 40])).toEqual([10, 20, 30])
  })

  it('DLC나 멀티플레이가 필수인 항목을 제외하고 3개만 추천한다', () => {
    const games = [createGame(1)]
    const achievements = [
      createAchievement('a', 1, 90),
      createAchievement('b', 1, 80),
      createAchievement('c', 1, 70),
      createAchievement('dlc', 1, 100, { dlcRequirement: 'required' }),
      createAchievement('multi', 1, 100, {
        multiplayerRequirement: 'required',
      }),
    ]

    expect(
      recommendEasyAchievements(achievements, games, []).map(
        ({ achievement }) => achievement.id,
      ),
    ).toEqual(['a', 'b', 'c'])
  })

  it('관심 게임의 도전과제에 가산점을 준다', () => {
    const games = [createGame(1), createGame(2)]
    const achievements = [
      createAchievement('normal', 1, 60),
      createAchievement('favorite', 2, 55),
    ]

    expect(
      recommendEasyAchievements(achievements, games, [2])[0].achievement.id,
    ).toBe('favorite')
  })
})
