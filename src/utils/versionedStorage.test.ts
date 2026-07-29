import { describe, expect, it } from 'vitest'
import {
  readVersionedStorage,
  type StorageAdapter,
} from './versionedStorage'

function createStorage(initialValue?: string) {
  const values = new Map<string, string>()

  if (initialValue !== undefined) {
    values.set('test-key', initialValue)
  }

  const storage: StorageAdapter = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }

  return { storage, values }
}

describe('versioned storage', () => {
  it('기존 비버전 데이터를 읽고 현재 버전 형식으로 마이그레이션한다', () => {
    const { storage, values } = createStorage(
      JSON.stringify({ items: ['legacy'] }),
    )

    const result = readVersionedStorage({
      storage,
      key: 'test-key',
      version: 1,
      fallback: { items: [] as string[] },
      parse: (value) =>
        typeof value === 'object' &&
        value !== null &&
        'items' in value &&
        Array.isArray(value.items)
          ? { items: value.items.filter((item) => typeof item === 'string') }
          : null,
    })

    expect(result).toEqual({ items: ['legacy'] })
    expect(JSON.parse(values.get('test-key') ?? '')).toEqual({
      version: 1,
      data: { items: ['legacy'] },
    })
  })

  it('앱보다 새로운 버전은 덮어쓰지 않고 안전한 기본값을 사용한다', () => {
    const futureValue = JSON.stringify({
      version: 3,
      data: { items: ['future'] },
    })
    const { storage, values } = createStorage(futureValue)

    const result = readVersionedStorage({
      storage,
      key: 'test-key',
      version: 1,
      fallback: { items: [] as string[] },
      parse: () => ({ items: ['parsed'] }),
    })

    expect(result).toEqual({ items: [] })
    expect(values.get('test-key')).toBe(futureValue)
  })
})
