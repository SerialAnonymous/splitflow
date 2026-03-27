import type { ExpenseWithParticipants } from '~/types/expense'

export interface BalanceSettlement {
  from: string
  to: string
  amount: number
}

/** Recorded payment: payer paid receiver amount (reduces debt from payer to receiver). */
export interface RecordedSettlement {
  payer_id: string
  receiver_id: string
  amount: number
}

/**
 * Compute net balance per user (in group currency).
 * Positive = they are owed money. Negative = they owe money.
 * Recorded settlements: payer paid receiver → payer balance +amount, receiver balance -amount.
 */
export function getNetBalances(
  expenses: ExpenseWithParticipants[],
  recordedSettlements: RecordedSettlement[] = []
): Map<string, number> {
  const balances = new Map<string, number>()

  function add(userId: string, delta: number) {
    balances.set(userId, (balances.get(userId) ?? 0) + delta)
  }

  for (const expense of expenses) {
    const payerId = expense.paid_by
    const total = expense.amount
    const participants = expense.participants ?? []

    // Payer paid total
    add(payerId, total)

    // Each participant owes their share
    for (const p of participants) {
      const share = p.amount ?? 0
      add(p.user_id, -share)
    }
  }

  for (const s of recordedSettlements) {
    add(s.payer_id, s.amount)
    add(s.receiver_id, -s.amount)
  }

  return balances
}

/**
 * Minimize number of transactions by greedily settling largest debtors with largest creditors.
 * Returns list of settlements: from owes to amount.
 */
function minimizeTransactions(balances: Map<string, number>): BalanceSettlement[] {
  const debtors: { userId: string; amount: number }[] = []
  const creditors: { userId: string; amount: number }[] = []

  for (const [userId, net] of balances) {
    const amount = Math.round(net * 100) / 100
    if (amount < -0.001) debtors.push({ userId, amount: -amount })
    else if (amount > 0.001) creditors.push({ userId, amount })
  }

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const settlements: BalanceSettlement[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)
    if (amount < 0.001) break

    settlements.push({ from: debtor.userId, to: creditor.userId, amount: Math.round(amount * 100) / 100 })

    debtor.amount -= amount
    creditor.amount -= amount
    if (debtor.amount < 0.001) i++
    if (creditor.amount < 0.001) j++
  }

  return settlements
}

/**
 * Calculate who owes whom within a group from expenses and optional recorded settlements.
 *
 * Steps:
 * 1. For each expense, use participant shares (already stored per user).
 * 2. Apply recorded settlements (payer paid receiver reduces that debt).
 * 3. Contribution vs payment: each user's net = total they paid - total they owe.
 * 4. Minimize number of transactions via greedy settlement.
 *
 * @param expenses - Group expenses with participants (e.g. from expense store)
 * @param recordedSettlements - Payments already recorded (e.g. from settlement store)
 * @returns Array of { from, to, amount } meaning "from owes to amount"
 */
export function calculateBalances(
  expenses: ExpenseWithParticipants[],
  recordedSettlements: RecordedSettlement[] = []
): BalanceSettlement[] {
  const balances = getNetBalances(expenses, recordedSettlements)
  return minimizeTransactions(balances)
}
