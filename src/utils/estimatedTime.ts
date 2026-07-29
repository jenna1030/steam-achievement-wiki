export const estimatedTimeOptions = [
  { value: 10, label: '10분 이내' },
  { value: 30, label: '30분 이내' },
  { value: 60, label: '1시간 이내' },
  { value: 61, label: '1시간 이상' },
] as const

export function normalizeEstimatedTimeRange(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 30
  }

  if (minutes <= 10) {
    return 10
  }

  if (minutes <= 30) {
    return 30
  }

  if (minutes <= 60) {
    return 60
  }

  return 61
}

export function formatEstimatedTimeRange(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '정보 없음'
  }

  return estimatedTimeOptions.find(
    (option) => option.value === normalizeEstimatedTimeRange(minutes),
  )?.label ?? '정보 없음'
}
