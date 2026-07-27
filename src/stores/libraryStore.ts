import { create } from 'zustand'

interface LibraryState {
  favoriteGameIds: number[]
  recentSearches: string[]
  toggleFavoriteGame: (gameId: number) => void
  addRecentSearch: (query: string) => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  favoriteGameIds: [],
  recentSearches: [],
  toggleFavoriteGame: (gameId) =>
    set((state) => ({
      favoriteGameIds: state.favoriteGameIds.includes(gameId)
        ? state.favoriteGameIds.filter((id) => id !== gameId)
        : [...state.favoriteGameIds, gameId],
    })),
  addRecentSearch: (query) => {
    const normalizedQuery = query.trim()

    if (normalizedQuery.length === 0) {
      return
    }

    set((state) => ({
      recentSearches: [
        normalizedQuery,
        ...state.recentSearches.filter((item) => item !== normalizedQuery),
      ].slice(0, 5),
    }))
  },
}))
