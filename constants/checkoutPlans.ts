export type CheckoutPlanId = 'pro' | 'team'

export interface CheckoutPlanDefinition {
  id: CheckoutPlanId
  name: string
  description: string
  /** INR per month when billed monthly (after trial) */
  monthlyInr: number
  /** Effective INR per month when billed yearly */
  yearlyPerMonthInr: number
  /** Total INR for one year when billed yearly */
  yearlyTotalInr: number
  highlights: string[]
}

/** Single source for displayed subscription prices (marketing + checkout). */
export const CHECKOUT_PLANS: Record<CheckoutPlanId, CheckoutPlanDefinition> = {
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited groups, richer history, exports, and analytics for serious splitters.',
    monthlyInr: 299,
    yearlyPerMonthInr: 199,
    yearlyTotalInr: 2388,
    highlights: [
      'Unlimited groups & 12 members each',
      'Unlimited history, search & CSV export',
      'Receipt capture, email reminders & analytics',
    ],
  },
  team: {
    id: 'team',
    name: 'Team',
    description: 'Roles, audit logs, and priority support for larger crews.',
    monthlyInr: 999,
    yearlyPerMonthInr: 666,
    yearlyTotalInr: 7992,
    highlights: [
      'Everything in Pro',
      'Up to 50 members & admin controls',
      'Audit logs & priority support',
    ],
  },
}

/** Human-readable INR for UI (Indian grouping). */
export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function proTrialLineAfterPrice(): string {
  return trialLineAfterYearFree(CHECKOUT_PLANS.pro)
}

/** Shown on checkout / upgrade — same idea for Pro and Team (1y Razorpay start_at). */
export function trialLineAfterYearFree(plan: CheckoutPlanDefinition): string {
  return `Free for 1 year. ${formatInr(plan.monthlyInr)}/month after.`
}

/** Headline trust line near checkout price + CTA. */
export const CHECKOUT_TRIAL_TRUST_HEADLINE = 'No charge today. Starts after 1 year.'

/** How billing reads after the free year (matches monthly/yearly toggle). */
export function afterTrialBillingSummary(plan: CheckoutPlanDefinition, yearly: boolean): string {
  if (yearly) {
    return `After year 1: ${formatInr(plan.yearlyTotalInr)}/year (${formatInr(plan.yearlyPerMonthInr)}/month avg). Cancel anytime before you’re charged.`
  }
  return `After year 1: ${formatInr(plan.monthlyInr)}/month. Cancel anytime before you’re charged.`
}

export function normalizeCheckoutPlanId(raw: unknown): CheckoutPlanId {
  return raw === 'team' ? 'team' : 'pro'
}
