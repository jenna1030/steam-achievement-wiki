import { describe, expect, it } from 'vitest'
import {
  parseChecklistStorage,
  parseGuideStorage,
  parseLibraryStorage,
  parseVoteStorage,
} from './localStorageSchemas'

describe('localStorage schemas', () => {
  it('관심 게임과 최근 검색어에서 잘못된 값을 제거한다', () => {
    expect(
      parseLibraryStorage({
        favoriteGameIds: [367520, -1, '1145350', 367520],
        recentSearches: [' hollow ', 3, '', 'hollow'],
      }),
    ).toEqual({
      favoriteGameIds: [367520],
      recentSearches: ['hollow'],
    })
  })

  it('유효한 최소 공략은 보완하고 식별자가 없는 공략은 제외한다', () => {
    const guides = parseGuideStorage([
      {
        id: 1,
        achievementId: 36752000001,
        title: '기존 공략',
        tags: ['본편'],
        hasSpoiler: true,
        spoiler: '',
      },
      { id: 2, title: '식별자 없음' },
    ])

    expect(guides).toHaveLength(1)
    expect(guides?.[0]).toMatchObject({
      id: 1,
      achievementId: '36752000001',
      source: 'user',
      ownerSteamId: null,
      title: '기존 공략',
      hasSpoiler: false,
      difficulty: '보통',
      dlcRequirement: 'unknown',
      tags: ['본편'],
      likeCount: 0,
      dislikeCount: 0,
    })
  })

  it('체크리스트와 투표의 enum·숫자 값을 안전하게 정규화한다', () => {
    expect(
      parseChecklistStorage([
        {
          achievementId: 'steam-1-A',
          status: 'invalid',
          memo: 3,
        },
      ]),
    ).toEqual([
      {
        achievementId: 'steam-1-A',
        status: 'saved',
        memo: '',
        updatedAt: '',
      },
    ])

    expect(
      parseVoteStorage({
        votes: [
          {
            achievementId: 'steam-1-A',
            easy: 2.8,
            normal: -3,
            hard: '4',
            veryHard: 1,
          },
        ],
        userVotes: {
          'steam-1-A': 'easy',
          'steam-1-B': 'invalid',
        },
      }),
    ).toEqual({
      votes: [
        {
          achievementId: 'steam-1-A',
          easy: 2,
          normal: 0,
          hard: 0,
          veryHard: 1,
        },
      ],
      userVotes: { 'steam-1-A': 'easy' },
    })
  })
})
