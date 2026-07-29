import { create } from 'zustand'

interface LibraryState {
  favoriteGameIds: number[]
  recentSearches: string[]
  toggleFavoriteGame: (gameId: number) => void
  addRecentSearch: (query: string) => void
}

const STORAGE_KEY = 'steam-achievement-wiki-library'

function loadStoredLibrary() {
  try {
    const rawLibrary = window.localStorage.getItem(STORAGE_KEY)

    if (!rawLibrary) {
      return { favoriteGameIds: [], recentSearches: [] }
    }

    return JSON.parse(rawLibrary) as Pick<
      LibraryState,
      'favoriteGameIds' | 'recentSearches'
    >
  } catch {
    return { favoriteGameIds: [], recentSearches: [] }
  }
}

function persistLibrary(
  favoriteGameIds: number[],
  recentSearches: string[],
) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ favoriteGameIds, recentSearches }),
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
