export type SpoilerLevel = 'hint' | 'detail' | 'spoiler'

export interface AchievementGuide {
  id: number
  achievementId: number
  source?: 'mock' | 'user'
  title: string
  author: string
  hint: string
  detail: string
  spoiler: string
  conditions: string[]
  supplies: string[]
  warnings: string[]
  recommendedOrder: string[]
  difficulty: '쉬움' | '보통' | '어려움' | '매우 어려움'
  estimatedMinutes: number
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

export type GuideFormValues = Pick<
  AchievementGuide,
  | 'achievementId'
  | 'title'
  | 'hint'
  | 'detail'
  | 'spoiler'
  | 'difficulty'
  | 'estimatedMinutes'
> & {
  conditionsText: string
  suppliesText: string
  warningsText: string
  recommendedOrderText: string
}
