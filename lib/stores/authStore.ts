'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminUser {
  id: string
  name: string
  email: string
  // TODO: requires BE to return role in login response
  role?: string
}

interface AuthStore {
  admin: AdminUser | null
  accessToken: string | null
  _hasHydrated: boolean
  setAuth: (admin: AdminUser, token: string) => void
  logout: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      _hasHydrated: false,
      setAuth: (admin, token) => {
        if (typeof window !== 'undefined') {
          document.cookie = 'admin-session=1; path=/; SameSite=Strict'
        }
        set({ admin, accessToken: token })
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
        }
        set({ admin: null, accessToken: null })
      },
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'admin-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  )
)
