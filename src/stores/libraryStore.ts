import { create } from 'zustand'
import {
  parseLibraryStorage,
  type LibraryStorageData,
} from '../utils/localStorageSchemas'
import {
  readVersionedStorage,
  writeVersionedStorage,
} from '../utils/versionedStorage'

interface LibraryState {
  favoriteGameIds: number[]
  recentSearches: string[]
  toggleFavoriteGame: (gameId: number) => void
  addRecentSearch: (query: string) => void
}

const STORAGE_KEY = 'steam-achievement-wiki-library'
const STORAGE_VERSION = 1

function loadStoredLibrary(): LibraryStorageData {
  return readVersionedStorage({
    storage: window.localStorage,
    key: STORAGE_KEY,
    version: STORAGE_VERSION,
    fallback: { favoriteGameIds: [], recentSearches: [] },
    parse: parseLibraryStorage,
  })
}

function persistLibrary(
  favoriteGameIds: number[],
  recentSearches: string[],
) {
  writeVersionedStorage(
    window.localStorage,
    STORAGE_KEY,
    STORAGE_VERSION,
    { favoriteGameIds, recentSearches },
  )
}

export const useLibraryStore = create<LibraryState>((set) => {
  const storedLibrary = loadStoredLibrary()

  return {
    favoriteGameIds: storedLibrary.favoriteGameIds,
    recentSearches: storedLibrary.recentSearches,
    toggleFavoriteGame: (gameId) =>
      set((state) => {
        const favoriteGameIds = state.favoriteGameIds.includes(gameId)
          ? state.favoriteGameIds.filter((id) => id !== gameId)
          : [...state.favoriteGameIds, gameId]

        persistLibrary(favoriteGameIds, state.recentSearches)

        return { favoriteGameIds }
      }),
    addRecentSearch: (query) => {
      const normalizedQuery = query.trim()

      if (normalizedQuery.length === 0) {
        return
      }

      set((state) => {
        const recentSearches = [
          normalizedQuery,
          ...state.recentSearches.filter((item) => item !== normalizedQuery),
        ].slice(0, 5)

        persistLibrary(state.favoriteGameIds, recentSearches)

        return { recentSearches }
      })
    },
  }
})
