'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminUser {
  id: string
  name: string
  email: string
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
      setAuth: (admin, token) => set({ admin, accessToken: token }),
      logout: () => set({ admin: null, accessToken: null }),
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
