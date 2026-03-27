import { defineStore } from 'pinia'
import type { Settlement, SettlementWithUsers, RecordSettlementPayload } from '~/types/settlement'

export const useSettlementStore = defineStore('settlement', {
  state: () => ({
    settlements: [] as SettlementWithUsers[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    setError(message: string | null) {
      this.error = message
    },

    async getGroupSettlements(groupId: string, options?: { replaceState?: boolean }) {
      const replaceState = options?.replaceState !== false
      const { $supabase } = useNuxtApp()
      if (!$supabase) {
        if (replaceState) this.settlements = []
        return { data: [], error: { message: 'Supabase not configured' } }
      }

      this.loading = true
      this.setError(null)

      const { data: rows, error } = await $supabase
        .from('settlements')
        .select('*')
        .eq('group_id', groupId)

      this.loading = false
      if (error) {
        this.setError(error.message)
        if (replaceState) this.settlements = []
        return { data: [], error }
      }

      const list = (rows ?? []) as (Settlement & { from_user?: string; to_user?: string; settled_at?: string })[]
      const normalized: Settlement[] = list.map((r) => ({
        id: r.id,
        group_id: r.group_id,
        payer_id: r.payer_id ?? r.from_user!,
        receiver_id: r.receiver_id ?? r.to_user!,
        amount: Number(r.amount),
        note: r.note ?? null,
        date: r.date ?? (r.settled_at ? r.settled_at.slice(0, 10) : ''),
        created_at: r.created_at ?? r.settled_at ?? '',
      }))
      normalized.sort((a, b) => (b.date || b.created_at).localeCompare(a.date || a.created_at))

      const userIds = [...new Set(normalized.flatMap((s) => [s.payer_id, s.receiver_id]))]
      let userMap: Record<string, { id: string; name: string | null; email: string }> = {}
      if (userIds.length > 0) {
        const { data: usersData } = await $supabase.from('users').select('id, name, email').in('id', userIds)
        userMap = (usersData ?? []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {})
      }

      const data = normalized.map((s) => ({
        ...s,
        payer: userMap[s.payer_id],
        receiver: userMap[s.receiver_id],
      }))
      if (replaceState) this.settlements = data
      return { data, error: null }
    },

    async recordSettlement(groupId: string, payload: RecordSettlementPayload) {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      if (!$supabase || !authStore.userId) {
        this.setError('Not authenticated')
        return { data: null, error: { message: 'Not authenticated' } }
      }

      if (payload.payer === payload.receiver) {
        this.setError('Payer and receiver must be different.')
        return { data: null, error: { message: 'Payer and receiver must be different.' } }
      }
      if (payload.amount <= 0) {
        this.setError('Amount must be greater than 0.')
        return { data: null, error: { message: 'Amount must be greater than 0.' } }
      }

      this.loading = true
      this.setError(null)

      const amount = Math.round(payload.amount * 100) / 100
      const note = payload.note?.trim() || null

      let row: Settlement | null = null
      let err = null

      const res = await $supabase
        .from('settlements')
        .insert({
          group_id: groupId,
          payer_id: payload.payer,
          receiver_id: payload.receiver,
          amount,
          note,
          date: payload.date,
        })
        .select('*')
        .single()

      if (res.error) {
        const msg = res.error.message ?? ''
        if (msg.includes('payer_id') || msg.includes('receiver_id') || msg.includes('date')) {
          const res001 = await $supabase
            .from('settlements')
            .insert({
              group_id: groupId,
              from_user: payload.payer,
              to_user: payload.receiver,
              amount,
              note,
              settled_at: `${payload.date}T12:00:00.000Z`,
              created_by: authStore.userId,
            })
            .select('*')
            .single()
          if (!res001.error) row = res001.data as Settlement & { from_user: string; to_user: string; settled_at: string }
          else err = res001.error
        } else err = res.error
      } else {
        row = res.data
      }

      this.loading = false
      if (err) {
        this.setError(err.message)
        return { data: null, error: err }
      }
      return { data: row, error: null }
    },

    clearSettlements() {
      this.settlements = []
    },
  },
})
