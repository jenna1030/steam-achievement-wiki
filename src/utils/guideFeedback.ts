export type GuideReaction = 'like' | 'dislike'

export interface GuideFeedbackStorage {
  reactions: Record<string, GuideReaction>
  reports: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getGuideFeedbackKey(
  guideId: number,
  actorSteamId: string | null,
) {
  return `${actorSteamId ? `steam:${actorSteamId}` : 'guest'}:guide:${guideId}`
}

export function parseGuideFeedbackStorage(
  value: unknown,
): GuideFeedbackStorage | null {
  if (!isRecord(value)) {
    return null
  }

  const reactions = isRecord(value.reactions)
    ? Object.fromEntries(
        Object.entries(value.reactions).filter(
          (entry): entry is [string, GuideReaction] =>
            entry[1] === 'like' || entry[1] === 'dislike',
        ),
      )
    : {}
  const reports = Array.isArray(value.reports)
    ? Array.from(
        new Set(
          value.reports.filter(
            (reportKey): reportKey is string =>
              typeof reportKey === 'string' && reportKey.length > 0,
          ),
        ),
      )
    : []

  return { reactions, reports }
}

export function toggleGuideReaction(
  feedback: GuideFeedbackStorage,
  feedbackKey: string,
  reaction: GuideReaction,
): GuideFeedbackStorage {
  const reactions = { ...feedback.reactions }

  if (reactions[feedbackKey] === reaction) {
    delete reactions[feedbackKey]
  } else {
    reactions[feedbackKey] = reaction
  }

  return { reactions, reports: feedback.reports }
}

export function addGuideReport(
  feedback: GuideFeedbackStorage,
  feedbackKey: string,
): GuideFeedbackStorage {
  if (feedback.reports.includes(feedbackKey)) {
    return feedback
  }

  return {
    reactions: feedback.reactions,
    reports: [...feedback.reports, feedbackKey],
  }
}
