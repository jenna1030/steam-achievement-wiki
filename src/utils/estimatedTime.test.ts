import { describe, expect, it } from 'vitest'
import {
  formatEstimatedTimeRange,
  normalizeEstimatedTimeRange,
} from './estimatedTime'

describe('estimated time ranges', () => {
  it.each([
    [1, '10분 이내'],
    [10, '10분 이내'],
    [11, '30분 이내'],
    [30, '30분 이내'],
    [31, '1시간 이내'],
    [60, '1시간 이내'],
    [61, '1시간 이상'],
    [120, '1시간 이상'],
  ])('%i분을 알맞은 구간으로 표시한다', (minutes, expected) => {
    expect(formatEstimatedTimeRange(minutes)).toBe(expected)
  })

  it('기존 자유 입력값을 선택 상자의 대표값으로 정규화한다', () => {
    expect(normalizeEstimatedTimeRange(15)).toBe(30)
    expect(normalizeEstimatedTimeRange(45)).toBe(60)
    expect(normalizeEstimatedTimeRange(90)).toBe(61)
  })

  it('시간 정보가 없으면 정보 없음으로 표시한다', () => {
    expect(formatEstimatedTimeRange(0)).toBe('정보 없음')
  })
})
