export interface StorageAdapter {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

interface StorageEnvelope<T> {
  version: number
  data: T
}

interface ReadVersionedStorageOptions<T> {
  storage: StorageAdapter
  key: string
  version: number
  fallback: T
  parse: (value: unknown) => T | null
}

function isStorageEnvelope(
  value: unknown,
): value is StorageEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    typeof value.version === 'number' &&
    'data' in value
  )
}

export function writeVersionedStorage<T>(
  storage: StorageAdapter,
  key: string,
  version: number,
  data: T,
) {
  try {
    storage.setItem(key, JSON.stringify({ version, data }))
    return true
  } catch {
    return false
  }
}

export function readVersionedStorage<T>({
  storage,
  key,
  version,
  fallback,
  parse,
}: ReadVersionedStorageOptions<T>): T {
  try {
    const rawValue = storage.getItem(key)

    if (!rawValue) {
      return fallback
    }

    const storedValue: unknown = JSON.parse(rawValue)

    if (isStorageEnvelope(storedValue)) {
      if (storedValue.version > version) {
        return fallback
      }

      const parsedData = parse(storedValue.data)

      if (parsedData === null) {
        return fallback
      }

      if (storedValue.version < version) {
        writeVersionedStorage(storage, key, version, parsedData)
      }

      return parsedData
    }

    const migratedData = parse(storedValue)

    if (migratedData === null) {
      return fallback
    }

    writeVersionedStorage(storage, key, version, migratedData)
    return migratedData
  } catch {
    return fallback
  }
}
