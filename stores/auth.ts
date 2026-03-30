import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.id ?? null,
    userEmail: (state) => state.user?.email ?? null,
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
      this.loading = false
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * Mirrors auth.users → public.users and/or public.profiles (whatever exists).
     * DB RPC bypasses RLS and matches your real FK (profiles vs users).
     */
    async syncPublicUserRow() {
      const { $supabase } = useNuxtApp()
      if (!$supabase || !this.user?.id) return
      const { error } = await $supabase.rpc('ensure_creator_mirror_rows')
      if (import.meta.dev && error) {
        console.warn('[auth] ensure_creator_mirror_rows', error.message)
      }
    },

    async init() {
      const { $supabase } = useNuxtApp()
      if (!$supabase?.auth) {
        this.setLoading(false)
        return
      }
      this.loading = true

      const { data: { session } } = await $supabase.auth.getSession()
      this.setUser(session?.user ?? null)
      await this.syncPublicUserRow()

      $supabase.auth.onAuthStateChange((_event, session) => {
        this.setUser(session?.user ?? null)
        void this.syncPublicUserRow()
      })
    },

    async signOut() {
      const { $supabase } = useNuxtApp()
      if (!$supabase?.auth) return
      await $supabase.auth.signOut()
      this.setUser(null)
    },

    async login(email: string, password: string) {
      const { $supabase } = useNuxtApp()
      if (!$supabase?.auth) return { error: { message: 'Supabase not configured' } as Error }
      this.setLoading(true)
      const { data, error } = await $supabase.auth.signInWithPassword({ email, password })
      this.setLoading(false)
      if (error) return { error }
      this.setUser(data.user)
      void this.syncPublicUserRow()
      return { data, error: null }
    },

    async signUp(email: string, password: string, options?: { displayName?: string }) {
      const { $supabase } = useNuxtApp()
      if (!$supabase?.auth) return { error: { message: 'Supabase not configured' } as any }
      this.setLoading(true)
      const { data, error } = await $supabase.auth.signUp({
        email,
        password,
        options: options?.displayName ? { data: { full_name: options.displayName } } : undefined,
      })
      this.setLoading(false)
      if (error) return { error }
      // Only set user if we have a session (email confirmation may be disabled).
      // If Supabase requires email confirmation, session is null and we should not mark as logged in.
      if (data.session) {
        this.setUser(data.user ?? null)
        void this.syncPublicUserRow()
      } else {
        this.setUser(null)
      }
      return {
        data: {
          user: data.user,
          session: data.session,
          needsEmailConfirmation: !!data.user && !data.session,
        },
        error: null,
      }
    },
  },
})
