import { defineStore } from 'pinia'
import type { Expense, ExpenseWithParticipants, ExpenseParticipant, ParticipantSplit } from '~/types/expense'

/** Map 'unequal' to DB value 'custom' */
function toDbSplitType(splitType: string): string {
  return splitType === 'unequal' ? 'custom' : splitType
}

function fromDbSplitType(splitType: string): string {
  return splitType === 'custom' ? 'unequal' : splitType
}

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [] as ExpenseWithParticipants[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    setError(message: string | null) {
      this.error = message
    },

    async getGroupExpenses(groupId: string, options?: { replaceState?: boolean }) {
      const replaceState = options?.replaceState !== false
      const { $supabase } = useNuxtApp()
      if (!$supabase) {
        if (replaceState) this.expenses = []
        return { data: [], error: { message: 'Supabase not configured' } }
      }

      this.loading = true
      this.setError(null)
      const { data: expenseRows, error: expError } = await $supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      this.loading = false
      if (expError) {
        this.setError(expError.message)
        if (replaceState) this.expenses = []
        return { data: [], error: expError }
      }

      const list = expenseRows ?? []
      const expenseIds = list.map((e) => e.id)
      const normalizeDate = (e: any) => ({ ...e, date: e.expense_date ?? e.date, split_type: fromDbSplitType(e.split_type) })
      if (expenseIds.length === 0) {
        const data = list.map((e) => ({ ...normalizeDate(e), participants: [] }))
        if (replaceState) this.expenses = data
        return { data, error: null }
      }

      const { data: partRows } = await $supabase
        .from('expense_splits')
        .select('*')
        .in('expense_id', expenseIds)

      const participantsByExpense: Record<string, ExpenseParticipant[]> = {}
      for (const p of partRows ?? []) {
        if (!participantsByExpense[p.expense_id]) participantsByExpense[p.expense_id] = []
        participantsByExpense[p.expense_id].push(p)
      }

      const userIds = [...new Set((partRows ?? []).map((p) => p.user_id).concat(list.map((e) => e.paid_by)))]
      let userMap: Record<string, { id: string; name: string | null; email: string }> = {}
      if (userIds.length > 0) {
        const { data: usersData } = await $supabase.from('users').select('id, name, email').in('id', userIds)
        userMap = (usersData ?? []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {})
      }

      const data = list.map((e) => ({
        ...normalizeDate(e),
        participants: (participantsByExpense[e.id] ?? []).map((p) => ({ ...p, user: userMap[p.user_id] })),
        paid_by_user: userMap[e.paid_by],
      }))
      if (replaceState) this.expenses = data
      return { data, error: null }
    },

    async addExpense(
      groupId: string,
      payload: {
        description: string
        amount: number
        paid_by: string
        date: string
        category?: string | null
        notes?: string | null
        split_type: string
        participantSplits: ParticipantSplit[]
      }
    ) {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      if (!$supabase || !authStore.userId) {
        this.setError('Not authenticated')
        return { data: null, error: { message: 'Not authenticated' } }
      }

      if (payload.participantSplits.length === 0) {
        this.setError('Select at least one participant.')
        return { data: null, error: { message: 'Select at least one participant.' } }
      }

      this.loading = true
      this.setError(null)
      const { data: expense, error: expError } = await $supabase
        .from('expenses')
        .insert({
          group_id: groupId,
          description: payload.description,
          amount: payload.amount,
          paid_by: payload.paid_by,
          expense_date: payload.date,
          split_type: toDbSplitType(payload.split_type),
          created_by: authStore.userId,
        })
        .select('*')
        .single()

      if (expError) {
        this.loading = false
        this.setError(expError.message)
        return { data: null, error: expError }
      }

      const rows = payload.participantSplits.map((p) => ({
        expense_id: expense.id,
        user_id: p.user_id,
        amount: Math.round(p.amount * 100) / 100,
        percentage: p.percentage ?? null,
      }))
      const { error: partError } = await $supabase.from('expense_splits').insert(rows)

      this.loading = false
      if (partError) {
        this.setError(partError.message)
        return { data: null, error: partError }
      }
      const normalized = { ...expense, date: expense.expense_date ?? expense.date, split_type: payload.split_type, participants: [] }
      this.expenses = [normalized, ...this.expenses]
      return { data: expense, error: null }
    },

    async editExpense(
      expenseId: string,
      payload: {
        description: string
        amount: number
        paid_by: string
        date: string
        category?: string | null
        notes?: string | null
        split_type: string
        participantSplits: ParticipantSplit[]
      }
    ) {
      const { $supabase } = useNuxtApp()
      if (!$supabase) return { data: null, error: { message: 'Supabase not configured' } }
      if (payload.participantSplits.length === 0) {
        this.setError('Select at least one participant.')
        return { data: null, error: { message: 'Select at least one participant.' } }
      }

      this.loading = true
      this.setError(null)
      const { data: expense, error: expError } = await $supabase
        .from('expenses')
        .update({
          description: payload.description,
          amount: payload.amount,
          paid_by: payload.paid_by,
          expense_date: payload.date,
          split_type: toDbSplitType(payload.split_type),
        })
        .eq('id', expenseId)
        .select('*')
        .single()

      if (expError) {
        this.loading = false
        this.setError(expError.message)
        return { data: null, error: expError }
      }

      await $supabase.from('expense_splits').delete().eq('expense_id', expenseId)
      const rows = payload.participantSplits.map((p) => ({
        expense_id: expenseId,
        user_id: p.user_id,
        amount: Math.round(p.amount * 100) / 100,
        percentage: p.percentage ?? null,
      }))
      const { error: partError } = await $supabase.from('expense_splits').insert(rows)
      this.loading = false
      if (partError) {
        this.setError(partError.message)
        return { data: null, error: partError }
      }
      const idx = this.expenses.findIndex((e) => e.id === expenseId)
      if (idx >= 0) this.expenses[idx] = { ...expense, split_type: payload.split_type, participants: [] }
      return { data: expense, error: null }
    },

    async updateExpenseReceipt(expenseId: string, receiptUrl: string | null) {
      const { $supabase } = useNuxtApp()
      if (!$supabase) return { error: { message: 'Supabase not configured' } }
      this.setError(null)
      const { error } = await $supabase
        .from('expenses')
        .update({ receipt_url: receiptUrl })
        .eq('id', expenseId)
      if (error) {
        this.setError(error.message)
        return { error }
      }
      const idx = this.expenses.findIndex((e) => e.id === expenseId)
      if (idx >= 0) this.expenses[idx] = { ...this.expenses[idx], receipt_url: receiptUrl }
      return { error: null }
    },

    async deleteExpense(expenseId: string) {
      const { $supabase } = useNuxtApp()
      if (!$supabase) return { error: { message: 'Supabase not configured' } }
      this.setError(null)
      const { error } = await $supabase.from('expenses').delete().eq('id', expenseId)
      if (error) {
        this.setError(error.message)
        return { error }
      }
      this.expenses = this.expenses.filter((e) => e.id !== expenseId)
      return { error: null }
    },

    clearExpenses() {
      this.expenses = []
    },
  },
})
