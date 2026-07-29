import type { AchievementId } from '../types/achievement'
import type { AchievementGuide } from '../types/guide'
import { createSteamAchievementId } from '../utils/achievementIdentity'

const HOLLOW_KNIGHT_CHARM_ID = createSteamAchievementId(367520, 'CHARMED')

export const exampleGuides: AchievementGuide[] = [
  {
    id: 900_000_001,
    achievementId: HOLLOW_KNIGHT_CHARM_ID,
    source: 'example',
    ownerSteamId: null,
    title: '흙의 마을에서 첫 부적 구매하기',
    author: '길잡이 모험가',
    hint: '흙의 마을에 있는 지도 상점을 확인해 보세요.',
    detail:
      '지도 상점에서 길잡이 나침반처럼 초반에 살 수 있는 부적을 하나 구매하면 첫 부적 획득 조건을 달성할 수 있습니다.',
    hasSpoiler: false,
    spoiler: '',
    conditions: ['아직 다른 부적을 획득하지 않은 상태'],
    supplies: ['부적을 구매할 수 있는 충분한 지오'],
    warnings: ['부적을 장착할 필요 없이 획득하는 즉시 조건이 충족됩니다.'],
    recommendedOrder: [
      '잊혀진 교차로에서 지도 제작자를 만납니다.',
      '흙의 마을로 돌아와 지도 상점을 확인합니다.',
      '판매 중인 부적 하나를 구매합니다.',
    ],
    tags: ['초반', '구매', '스포일러 없음'],
    dlcRequirement: 'not-required',
    multiplayerRequirement: 'not-required',
    isMissable: false,
    requiresSecondRun: false,
    difficulty: '쉬움',
    estimatedMinutes: 15,
    likeCount: 18,
    dislikeCount: 2,
    createdAt: '2026-07-30',
    updatedAt: '2026-07-30',
  },
  {
    id: 900_000_002,
    achievementId: HOLLOW_KNIGHT_CHARM_ID,
    source: 'example',
    ownerSteamId: null,
    title: '구매 없이 첫 부적 획득하기',
    author: '신성둥지 탐험가',
    hint: '왕의 길 시작 구역에는 무료로 얻을 수 있는 부적이 있습니다.',
    detail:
      '왕의 길의 가시 함정 구간을 탐색하면 상자에서 격노한 영혼 부적을 얻을 수 있습니다. 지오를 쓰지 않고도 첫 부적 도전과제를 달성하는 경로입니다.',
    hasSpoiler: true,
    spoiler:
      '가시가 있는 구간에서는 아래 공격으로 오브젝트를 튕겨 이동한 뒤, 끝의 상자를 열어 격노한 영혼을 획득하세요.',
    conditions: ['왕의 길을 다시 탐색할 수 있을 것'],
    supplies: ['회복할 수 있는 영혼', '가시 구간을 통과할 여유 체력'],
    warnings: ['가시에 닿으면 피해를 입으므로 체력이 적을 때는 먼저 회복하세요.'],
    recommendedOrder: [
      '왕의 길 시작 구역으로 이동합니다.',
      '가시 함정이 있는 샛길을 탐색합니다.',
      '구간 끝의 상자를 열어 부적을 획득합니다.',
    ],
    tags: ['무료 획득', '탐험', '액션'],
    dlcRequirement: 'not-required',
    multiplayerRequirement: 'not-required',
    isMissable: false,
    requiresSecondRun: false,
    difficulty: '보통',
    estimatedMinutes: 10,
    likeCount: 11,
    dislikeCount: 1,
    createdAt: '2026-07-30',
    updatedAt: '2026-07-30',
  },
]

export function getExampleGuidesForAchievement(
  achievementId: AchievementId,
  legacyAchievementId = '',
) {
  return exampleGuides.filter(
    (guide) =>
      guide.achievementId === achievementId ||
      guide.achievementId === legacyAchievementId,
  )
}
