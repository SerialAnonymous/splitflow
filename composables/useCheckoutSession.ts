import type { CheckoutPlanId } from '~/constants/checkoutPlans'
import type { BillingCycle, BillingDetails } from '~/stores/subscription'

export interface CreateCheckoutSessionPayload {
  planId: CheckoutPlanId
  billingCycle: BillingCycle
  billing: BillingDetails
}

export interface CreateCheckoutSessionResult {
  ok: boolean
  /** When set, redirect the browser (real Stripe/Razorpay checkout) */
  redirectUrl?: string | null
  message?: string
}

/**
 * Starts checkout: `POST /api/checkout/create-session` (Razorpay subscription checkout link).
 * Requires `accessToken` (Supabase JWT); returns `redirectUrl` when the gateway is configured.
 */
export async function createCheckoutSession(
  payload: CreateCheckoutSessionPayload,
  accessToken: string | null | undefined
): Promise<CreateCheckoutSessionResult> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  return await $fetch<CreateCheckoutSessionResult>('/api/checkout/create-session', {
    method: 'POST',
    body: payload,
    headers,
  })
}
