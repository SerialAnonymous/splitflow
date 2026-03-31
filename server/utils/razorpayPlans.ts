import type { H3Event } from 'h3'

/**
 * Razorpay caps `total_count` per plan period/interval (commonly 100 for yearly billing).
 * Exceeding it returns: "Exceeds the maximum total_count (100) allowed for the given period and interval".
 */
export const RAZORPAY_SUBSCRIPTION_TOTAL_COUNT_MAX = 100

export interface RazorpayPlanEnv {
  razorpayPlanProMonthly: string
  razorpayPlanProYearly: string
  razorpayPlanTeamMonthly: string
  razorpayPlanTeamYearly: string
}

export function planFromRazorpayPlanId(planId: string | undefined, env: RazorpayPlanEnv): 'pro' | 'team' {
  if (!planId) return 'pro'
  if (planId === env.razorpayPlanTeamMonthly || planId === env.razorpayPlanTeamYearly) return 'team'
  return 'pro'
}

export function getRazorpayPlanEnv(event: H3Event): RazorpayPlanEnv {
  const c = useRuntimeConfig(event)
  return {
    razorpayPlanProMonthly: (c.razorpayPlanProMonthly as string) ?? '',
    razorpayPlanProYearly: (c.razorpayPlanProYearly as string) ?? '',
    razorpayPlanTeamMonthly: (c.razorpayPlanTeamMonthly as string) ?? '',
    razorpayPlanTeamYearly: (c.razorpayPlanTeamYearly as string) ?? '',
  }
}
