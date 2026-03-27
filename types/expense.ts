export type ExpenseSplitType = 'equal' | 'unequal' | 'percentage' | 'shares'

/** DB uses 'custom' for unequal; we map in the store */
export const EXPENSE_SPLIT_TYPES = ['equal', 'unequal', 'percentage', 'shares'] as const

export interface Expense {
  id: string
  group_id: string
  description: string
  amount: number
  paid_by: string
  category: string | null
  split_type: string
  date: string
  notes: string | null
  receipt_url?: string | null
  created_at: string
}

export interface ExpenseParticipant {
  id: string
  expense_id: string
  user_id: string
  amount: number
  percentage: number | null
  shares: number | null
  user?: {
    id: string
    name: string | null
    email: string
  }
}

export interface ExpenseWithParticipants extends Expense {
  participants?: ExpenseParticipant[]
  paid_by_user?: { id: string; name: string | null; email: string }
}

export interface ParticipantSplit {
  user_id: string
  amount: number
  percentage?: number
  shares?: number
}
