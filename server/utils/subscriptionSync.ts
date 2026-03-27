import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

type Plan = 'free' | 'pro' | 'team'
type SubStatus = 'active' | 'cancelled' | 'expired' | 'trial'

export type RuntimePriceConfig = {
  stripePriceProMonthly: string
  stripePriceProYearly: string
  stripePriceTeamMonthly: string
  stripePriceTeamYearly: string
}

export function planFromStripePriceId(priceId: string | undefined, cfg: RuntimePriceConfig): Plan {
  if (!priceId) return 'pro'
  if (priceId === cfg.stripePriceProMonthly || priceId === cfg.stripePriceProYearly) return 'pro'
  if (priceId === cfg.stripePriceTeamMonthly || priceId === cfg.stripePriceTeamYearly) return 'team'
  return 'pro'
}

export async function upsertPaidSubscription(admin: SupabaseClient, row: {
  user_id: string
  plan: Plan
  status: SubStatus
  provider: 'stripe' | 'razorpay'
  provider_subscription_id: string | null
  provider_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}) {
  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: row.user_id,
      plan: row.plan,
      status: row.status,
      provider: row.provider,
      provider_subscription_id: row.provider_subscription_id,
      provider_customer_id: row.provider_customer_id,
      current_period_start: row.current_period_start,
      current_period_end: row.current_period_end,
      cancel_at_period_end: row.cancel_at_period_end,
    },
    { onConflict: 'user_id' }
  )
  if (error) throw error
}

export async function downgradeToFree(admin: SupabaseClient, userId: string) {
  const { error } = await admin
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'expired',
      provider: null,
      provider_subscription_id: null,
      provider_customer_id: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
    })
    .eq('user_id', userId)
  if (error) throw error
}

export async function syncFromStripeSubscription(
  admin: SupabaseClient,
  sub: Stripe.Subscription,
  cfg: RuntimePriceConfig
) {
  const userId = sub.metadata?.supabase_user_id || sub.metadata?.user_id
  if (!userId) {
    console.warn('[stripe] subscription without supabase_user_id metadata', sub.id)
    return
  }

  const priceId = sub.items.data[0]?.price?.id
  const planMeta = sub.metadata?.plan as Plan | undefined
  const plan: Plan =
    planMeta && ['pro', 'team'].includes(planMeta)
      ? planMeta
      : planFromStripePriceId(priceId, cfg)

  const terminal = ['canceled', 'unpaid', 'incomplete_expired'].includes(sub.status)
  if (terminal) {
    await downgradeToFree(admin, userId)
    return
  }

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null

  await upsertPaidSubscription(admin, {
    user_id: userId,
    plan,
    status: sub.status === 'past_due' ? 'active' : 'active',
    provider: 'stripe',
    provider_subscription_id: sub.id,
    provider_customer_id: customerId,
    current_period_start: sub.current_period_start
      ? new Date(sub.current_period_start * 1000).toISOString()
      : null,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
  })
}
