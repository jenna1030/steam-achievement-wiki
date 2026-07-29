import { create } from 'zustand'
import {
  clearSteamSession,
  fetchSteamSession,
  type SteamSessionUser,
} from '../apis/steamApi'

const LEGACY_STORAGE_KEY = 'steam-achievement-wiki-auth'

type AuthStatus = 'idle' | 'loading' | 'ready'

interface AuthState {
  user: SteamSessionUser | null
  status: AuthStatus
  hydrate: () => Promise<SteamSessionUser | null>
  logout: () => Promise<void>
}

let hydrationRequest: Promise<SteamSessionUser | null> | null = null

function requestSession() {
  hydrationRequest ??= fetchSteamSession().finally(() => {
    hydrationRequest = null
  })

  return hydrationRequest
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  hydrate: async () => {
    set({ status: 'loading' })

    try {
      const user = await requestSession()

      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      set({ status: 'ready', user })

      return user
    } catch {
      set({ status: 'ready', user: null })

      return null
    }
  },
  logout: async () => {
    try {
      await clearSteamSession()
    } finally {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      set({ status: 'ready', user: null })
    }
  },
}))
