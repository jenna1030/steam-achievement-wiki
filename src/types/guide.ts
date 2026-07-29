import type {
  AchievementId,
  RequirementStatus,
} from './achievement'

export type SpoilerLevel = 'hint' | 'detail' | 'spoiler'
export type GuideSource = 'user' | 'example'

export interface AchievementGuide {
  id: number
  achievementId: AchievementId
  source: GuideSource
  ownerSteamId: string | null
  title: string
  author: string
  hint: string
  detail: string
  hasSpoiler: boolean
  spoiler: string
  conditions: string[]
  supplies: string[]
  warnings: string[]
  recommendedOrder: string[]
  tags: string[]
  dlcRequirement: RequirementStatus
  multiplayerRequirement: RequirementStatus
  isMissable: boolean
  requiresSecondRun: boolean
  difficulty: '쉬움' | '보통' | '어려움' | '매우 어려움'
  estimatedMinutes: number
  likeCount: number
  dislikeCount: number
  createdAt: string
  updatedAt: string
}

export type GuideFormValues = Pick<
  AchievementGuide,
  | 'achievementId'
  | 'title'
  | 'hint'
  | 'detail'
  | 'hasSpoiler'
  | 'spoiler'
  | 'difficulty'
  | 'estimatedMinutes'
  | 'dlcRequirement'
  | 'multiplayerRequirement'
  | 'isMissable'
  | 'requiresSecondRun'
> & {
  tagsText: string
  conditionsText: string
  suppliesText: string
  warningsText: string
  recommendedOrderText: string
}
