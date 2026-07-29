import type { AchievementGuide } from '../types/guide'
import type {
  ChecklistItem,
  ChecklistStatus,
  DifficultyVote,
} from '../types/checklist'
import type { RequirementStatus } from '../types/achievement'
import { normalizeAchievementId } from './achievementIdentity'

export type VoteOption = 'easy' | 'normal' | 'hard' | 'veryHard'

export interface LibraryStorageData {
  favoriteGameIds: number[]
  recentSearches: string[]
}

export interface VoteStorageData {
  votes: DifficultyVote[]
  userVotes: Record<string, VoteOption>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function asNonNegativeInteger(value: unknown, fallback = 0) {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
    ? Math.floor(value)
    : fallback
}

function asPositiveInteger(value: unknown) {
  return typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0
    ? value
    : null
}

function asAchievementId(value: unknown) {
  const achievementId = normalizeAchievementId(value).trim()
  return achievementId.length > 0 ? achievementId : null
}

function asRequirementStatus(value: unknown): RequirementStatus {
  return value === 'required' || value === 'not-required'
    ? value
    : 'unknown'
}

function asChecklistStatus(value: unknown): ChecklistStatus {
  return value === 'in-progress' || value === 'done' ? value : 'saved'
}

function asDifficulty(
  value: unknown,
): AchievementGuide['difficulty'] {
  return value === '쉬움' ||
    value === '어려움' ||
    value === '매우 어려움'
    ? value
    : '보통'
}

function asVoteOption(value: unknown): VoteOption | null {
  return value === 'easy' ||
    value === 'normal' ||
    value === 'hard' ||
    value === 'veryHard'
    ? value
    : null
}

export function parseLibraryStorage(
  value: unknown,
): LibraryStorageData | null {
  if (!isRecord(value)) {
    return null
  }

  const favoriteGameIds = Array.isArray(value.favoriteGameIds)
    ? Array.from(
        new Set(
          value.favoriteGameIds
            .map(asPositiveInteger)
            .filter((gameId): gameId is number => gameId !== null),
        ),
      ).slice(0, 200)
    : []
  const recentSearches = Array.isArray(value.recentSearches)
    ? Array.from(
        new Set(
          value.recentSearches
            .filter((query): query is string => typeof query === 'string')
            .map((query) => query.trim())
            .filter(Boolean),
        ),
      ).slice(0, 5)
    : []

  return { favoriteGameIds, recentSearches }
}

function parseGuide(value: unknown): AchievementGuide | null {
  if (!isRecord(value)) {
    return null
  }

  const id = asPositiveInteger(value.id)
  const achievementId = asAchievementId(value.achievementId)
  const title = asString(value.title).trim()

  if (id === null || achievementId === null || title.length === 0) {
    return null
  }

  return {
    id,
    achievementId,
    ownerSteamId:
      typeof value.ownerSteamId === 'string' ? value.ownerSteamId : null,
    title,
    author: asString(value.author, '나'),
    hint: asString(value.hint),
    detail: asString(value.detail),
    hasSpoiler: value.hasSpoiler === true,
    spoiler: asString(value.spoiler),
    conditions: asStringArray(value.conditions),
    supplies: asStringArray(value.supplies),
    warnings: asStringArray(value.warnings),
    recommendedOrder: asStringArray(value.recommendedOrder),
    tags: asStringArray(value.tags),
    dlcRequirement: asRequirementStatus(value.dlcRequirement),
    multiplayerRequirement: asRequirementStatus(
      value.multiplayerRequirement,
    ),
    isMissable: value.isMissable === true,
    requiresSecondRun: value.requiresSecondRun === true,
    difficulty: asDifficulty(value.difficulty),
    estimatedMinutes: asNonNegativeInteger(value.estimatedMinutes),
    createdAt: asString(value.createdAt),
    updatedAt: asString(value.updatedAt),
  }
}

export function parseGuideStorage(
  value: unknown,
): AchievementGuide[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  return value
    .map(parseGuide)
    .filter((guide): guide is AchievementGuide => guide !== null)
}

function parseChecklistItem(value: unknown): ChecklistItem | null {
  if (!isRecord(value)) {
    return null
  }

  const achievementId = asAchievementId(value.achievementId)

  if (achievementId === null) {
    return null
  }

  const gameId = asPositiveInteger(value.gameId)

  return {
    achievementId,
    ...(gameId === null ? {} : { gameId }),
    title: asOptionalString(value.title),
    description: asOptionalString(value.description),
    iconUrl: asOptionalString(value.iconUrl),
    tags: Array.isArray(value.tags)
      ? asStringArray(value.tags)
      : undefined,
    notices: Array.isArray(value.notices)
      ? asStringArray(value.notices)
      : undefined,
    status: asChecklistStatus(value.status),
    memo: asString(value.memo),
    updatedAt: asString(value.updatedAt),
  }
}

export function parseChecklistStorage(
  value: unknown,
): ChecklistItem[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  return value
    .map(parseChecklistItem)
    .filter((item): item is ChecklistItem => item !== null)
}

function parseDifficultyVote(value: unknown): DifficultyVote | null {
  if (!isRecord(value)) {
    return null
  }

  const achievementId = asAchievementId(value.achievementId)

  if (achievementId === null) {
    return null
  }

  return {
    achievementId,
    easy: asNonNegativeInteger(value.easy),
    normal: asNonNegativeInteger(value.normal),
    hard: asNonNegativeInteger(value.hard),
    veryHard: asNonNegativeInteger(value.veryHard),
  }
}

export function parseVoteStorage(value: unknown): VoteStorageData | null {
  if (!isRecord(value)) {
    return null
  }

  const votes = Array.isArray(value.votes)
    ? value.votes
        .map(parseDifficultyVote)
        .filter((vote): vote is DifficultyVote => vote !== null)
    : []
  const userVotes: Record<string, VoteOption> = {}

  if (isRecord(value.userVotes)) {
    Object.entries(value.userVotes).forEach(([rawId, rawOption]) => {
      const achievementId = asAchievementId(rawId)
      const option = asVoteOption(rawOption)

      if (achievementId && option) {
        userVotes[achievementId] = option
      }
    })
  }

  return { votes, userVotes }
}
