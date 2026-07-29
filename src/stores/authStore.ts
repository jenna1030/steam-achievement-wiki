import { create } from 'zustand'

const STORAGE_KEY = 'steam-achievement-wiki-auth'

interface SteamUser {
  steamId: string
}

interface AuthState {
  user: SteamUser | null
  loginWithSteamId: (steamId: string) => void
  logout: () => void
}

function loadStoredUser() {
  try {
    const rawUser = window.localStorage.getItem(STORAGE_KEY)

    return rawUser ? (JSON.parse(rawUser) as SteamUser) : null
  } catch {
    return null
  }
}

function persistUser(user: SteamUser | null) {
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadStoredUser(),
  loginWithSteamId: (steamId) =>
    set(() => {
      const user = { steamId }

      persistUser(user)

      return { user }
    }),
  logout: () =>
    set(() => {
      persistUser(null)

      return { user: null }
    }),
}))
