export type CheckoutPlanId = 'pro' | 'team'

export interface CheckoutPlanDefinition {
  id: CheckoutPlanId
  name: string
  description: string
  monthlyUsd: number
  /** Per-month equivalent when billed yearly */
  yearlyUsdPerMonth: number
  yearlyTotalUsd: number
  highlights: string[]
}

export const CHECKOUT_PLANS: Record<CheckoutPlanId, CheckoutPlanDefinition> = {
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited groups, richer history, and exports for serious splitters.',
    monthlyUsd: 12,
    yearlyUsdPerMonth: 7,
    yearlyTotalUsd: 84,
    highlights: [
      'Unlimited groups & 12 members each',
      'Unlimited history, search & CSV export',
      'Receipt capture & email reminders',
    ],
  },
  team: {
    id: 'team',
    name: 'Team',
    description: 'Roles, audit trails, and priority support for larger crews.',
    monthlyUsd: 39,
    yearlyUsdPerMonth: 24,
    yearlyTotalUsd: 288,
    highlights: [
      'Everything in Pro',
      'Up to 50 members & admin controls',
      'Audit trail & priority support',
    ],
  },
}

export function normalizeCheckoutPlanId(raw: unknown): CheckoutPlanId {
  return raw === 'team' ? 'team' : 'pro'
}
