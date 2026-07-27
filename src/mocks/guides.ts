import type { AchievementGuide } from '../types/guide'

export const guides: AchievementGuide[] = [
  {
    id: 1001,
    achievementId: 103,
    title: '초반 탐험 전에 벤치부터 확인하기',
    author: 'temp-coffee',
    hint: '초반 지역의 표지판을 따라가면 쉬어갈 수 있는 지점이 있습니다.',
    detail: '마을에서 아래쪽으로 내려간 뒤 왼쪽 길을 먼저 확인하면 벤치를 발견할 수 있습니다.',
    hasSpoiler: true,
    spoiler:
      '첫 번째 큰 교차로에서 왼쪽 아래로 이동한 뒤, 표지판이 보이는 방으로 들어가면 벤치가 있습니다.',
    conditions: ['초반 지역 진입', '지도 상인 발견 전에도 가능'],
    supplies: ['지오 소량'],
    warnings: ['초반에 지나치면 한동안 되돌아가기 번거로울 수 있습니다.'],
    recommendedOrder: ['마을 진입', '아래쪽 길 확인', '왼쪽 아래 방 탐색', '벤치 사용'],
    difficulty: '보통',
    estimatedMinutes: 30,
    helpfulCount: 12,
    createdAt: '2026-07-28',
    updatedAt: '2026-07-28',
  },
]
