/**
 * Razorpay subscription lifecycle (SplitFlow)
 * ------------------------------------------
 * Trial = time before Razorpay `start_at` on the subscription. The customer is not charged;
 * SplitFlow still treats them as entitled to Pro/Team (status `trial`) once the subscription exists.
 *
 * After `start_at`, Razorpay begins the paid cadence (same plan: e.g. yearly). Each successful
 * charge typically emits `invoice.paid`; we set `status = active` and mirror billing window.
 *
 * Auto-renew: handled entirely by Razorpay until `total_count` is exhausted or the sub is cancelled.
 *
 * Cancel: user may cancel anytime in Razorpay. `subscription.cancelled` → we set `cancelled` +
 * `cancel_at_period_end = true` and keep `plan` as pro/team until the gateway ends access; then
 * you may downgrade on `subscription.completed` / `halted` (optional follow-up).
 *
 * Security: signature verified with RAZORPAY_WEBHOOK_SECRET; writes use Supabase service role only.
 */
import type { H3Event } from 'h3'
import { createError, getHeader, readRawBody } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { getSupabaseServiceClient } from './supabaseService'
import {
  downgradeToFree,
  markSubscriptionCancelledAtPeriodEnd,
  upsertPaidSubscription,
} from './subscriptionSync'
import { getRazorpayPlanEnv, planFromRazorpayPlanId } from './razorpayPlans'

/** Subscription entity (Razorpay API / webhooks) */
export interface RzpSubEntity {
  id: string
  plan_id?: string
  customer_id?: string
  start_at?: number | null
  current_start?: number | null
  current_end?: number | null
  notes?: Record<string, string | undefined>
  status?: string
}

interface RzpInvoiceEntity {
  id?: string
  subscription_id?: string | null
  billing_start?: number | null
  billing_end?: number | null
}

interface RzpWebhookJson {
  event?: string
  payload?: {
    subscription?: { entity?: RzpSubEntity }
    invoice?: { entity?: RzpInvoiceEntity }
  }
}

function resolveUserIdFromSubNotes(entity: RzpSubEntity): string | null {
  const n = entity.notes
  if (!n) return null
  return n.supabase_user_id ?? n.user_id ?? null
}

function resolvePlan(entity: RzpSubEntity, planEnv: ReturnType<typeof getRazorpayPlanEnv>): 'pro' | 'team' {
  const p = entity.notes?.plan
  if (p === 'team' || p === 'pro') return p
  return planFromRazorpayPlanId(entity.plan_id, planEnv)
}

function trialEndIso(entity: RzpSubEntity): string | null {
  if (entity.start_at == null) return null
  return new Date(entity.start_at * 1000).toISOString()
}

async function fetchRazorpaySubscription(
  subscriptionId: string,
  keyId: string,
  keySecret: string
): Promise<RzpSubEntity | null> {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  try {
    return await $fetch<RzpSubEntity>(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Basic ${auth}` },
    })
  } catch {
    return null
  }
}

async function handleTrialFromSubscription(
  event: H3Event,
  entity: RzpSubEntity
): Promise<{ received: true } | { received: true; skipped: string }> {
  const admin = getSupabaseServiceClient(event)
  if (!admin) return { received: true, skipped: 'no supabase admin' }

  const userId = resolveUserIdFromSubNotes(entity)
  if (!userId) {
    console.warn('[razorpay webhook] trial: missing supabase_user_id / user_id in notes', entity.id)
    return { received: true, skipped: 'no user id' }
  }

  const planEnv = getRazorpayPlanEnv(event)
  const plan = resolvePlan(entity, planEnv)
  const trialEnd = trialEndIso(entity)

  await upsertPaidSubscription(admin, {
    user_id: userId,
    plan,
    status: 'trial',
    provider: 'razorpay',
    provider_subscription_id: entity.id,
    provider_customer_id: entity.customer_id ?? null,
    trial_end: trialEnd,
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
  })

  return { received: true }
}

async function handleInvoicePaid(event: H3Event, inv: RzpInvoiceEntity): Promise<{ received: true } | { received: true; skipped: string }> {
  const admin = getSupabaseServiceClient(event)
  const c = useRuntimeConfig(event)
  const keyId = c.razorpayKeyId as string
  const keySecret = c.razorpayKeySecret as string
  if (!admin) return { received: true, skipped: 'no supabase admin' }

  const subId = inv.subscription_id
  if (!subId) return { received: true, skipped: 'invoice without subscription_id' }

  let entity: RzpSubEntity | null = null
  if (keyId && keySecret) {
    entity = await fetchRazorpaySubscription(subId, keyId, keySecret)
  }
  if (!entity) {
    console.warn('[razorpay webhook] invoice.paid: could not load subscription', subId)
    return { received: true, skipped: 'subscription fetch failed' }
  }

  const userId = resolveUserIdFromSubNotes(entity)
  if (!userId) {
    console.warn('[razorpay webhook] invoice.paid: missing user in subscription notes', subId)
    return { received: true, skipped: 'no user id' }
  }

  const planEnv = getRazorpayPlanEnv(event)
  const plan = resolvePlan(entity, planEnv)

  const periodStart =
    inv.billing_start != null ? new Date(inv.billing_start * 1000).toISOString() : null
  const periodEnd =
    inv.billing_end != null ? new Date(inv.billing_end * 1000).toISOString() : null

  await upsertPaidSubscription(admin, {
    user_id: userId,
    plan,
    status: 'active',
    provider: 'razorpay',
    provider_subscription_id: entity.id,
    provider_customer_id: entity.customer_id ?? null,
    trial_end: trialEndIso(entity),
    current_period_start: periodStart ?? (entity.current_start != null ? new Date(entity.current_start * 1000).toISOString() : null),
    current_period_end: periodEnd ?? (entity.current_end != null ? new Date(entity.current_end * 1000).toISOString() : null),
    cancel_at_period_end: false,
  })

  return { received: true }
}

async function handleSubscriptionCancelled(event: H3Event, entity: RzpSubEntity): Promise<{ received: true } | { received: true; skipped: string }> {
  const admin = getSupabaseServiceClient(event)
  if (!admin) return { received: true, skipped: 'no supabase admin' }

  const userId = resolveUserIdFromSubNotes(entity)
  if (!userId) {
    console.warn('[razorpay webhook] cancel: missing user id', entity.id)
    return { received: true, skipped: 'no user id' }
  }

  await markSubscriptionCancelledAtPeriodEnd(admin, userId, {
    providerSubscriptionId: entity.id,
  })

  return { received: true }
}

/** subscription.completed / halted: no more billing — downgrade to free. */
async function handleSubscriptionEnded(event: H3Event, entity: RzpSubEntity): Promise<{ received: true } | { received: true; skipped: string }> {
  const admin = getSupabaseServiceClient(event)
  if (!admin) return { received: true, skipped: 'no supabase admin' }

  const userId = resolveUserIdFromSubNotes(entity)
  if (!userId) return { received: true, skipped: 'no user id' }

  await downgradeToFree(admin, userId)
  return { received: true }
}

export async function handleRazorpayWebhook(event: H3Event) {
  const secret = useRuntimeConfig(event).razorpayWebhookSecret as string
  const admin = getSupabaseServiceClient(event)

  if (!secret || !admin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Razorpay webhook not configured (RAZORPAY_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY).',
    })
  }

  const body = await readRawBody(event, 'utf8')
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const sig = getHeader(event, 'x-razorpay-signature')
  if (!sig) {
    throw createError({ statusCode: 400, statusMessage: 'Missing X-Razorpay-Signature' })
  }

  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const sigBuf = Buffer.from(sig, 'utf8')
  const expBuf = Buffer.from(expected, 'utf8')
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid signature' })
  }

  let json: RzpWebhookJson
  try {
    json = JSON.parse(body) as RzpWebhookJson
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const eventName = json.event ?? ''
  const subEntity = json.payload?.subscription?.entity
  const invEntity = json.payload?.invoice?.entity

  if (eventName === 'subscription.created' || eventName === 'subscription.authenticated') {
    if (!subEntity?.id) return { received: true, ignored: 'no subscription entity' }
    return handleTrialFromSubscription(event, subEntity)
  }

  if (eventName === 'invoice.paid' && invEntity) {
    return handleInvoicePaid(event, invEntity)
  }

  if (eventName === 'subscription.cancelled' && subEntity?.id) {
    return handleSubscriptionCancelled(event, subEntity)
  }

  if (eventName === 'subscription.completed' && subEntity?.id) {
    return handleSubscriptionEnded(event, subEntity)
  }

  if (eventName === 'subscription.halted' && subEntity?.id) {
    return handleSubscriptionEnded(event, subEntity)
  }

  if (eventName === 'subscription.charged' && subEntity?.id) {
    const admin2 = getSupabaseServiceClient(event)
    if (!admin2) return { received: true, skipped: 'no supabase admin' }
    const userId = resolveUserIdFromSubNotes(subEntity)
    if (!userId) return { received: true, skipped: 'no user id' }
    const planEnv = getRazorpayPlanEnv(event)
    const plan = resolvePlan(subEntity, planEnv)
    await upsertPaidSubscription(admin2, {
      user_id: userId,
      plan,
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: subEntity.id,
      provider_customer_id: subEntity.customer_id ?? null,
      trial_end: trialEndIso(subEntity),
      current_period_start:
        subEntity.current_start != null
          ? new Date(subEntity.current_start * 1000).toISOString()
          : null,
      current_period_end:
        subEntity.current_end != null
          ? new Date(subEntity.current_end * 1000).toISOString()
          : null,
      cancel_at_period_end: false,
    })
    return { received: true }
  }

  if (eventName === 'subscription.activated' && subEntity?.id) {
    const now = Math.floor(Date.now() / 1000)
    const startAt = subEntity.start_at
    if (startAt != null && startAt > now) {
      return handleTrialFromSubscription(event, subEntity)
    }
    const admin2 = getSupabaseServiceClient(event)
    if (!admin2) return { received: true, skipped: 'no supabase admin' }
    const userId = resolveUserIdFromSubNotes(subEntity)
    if (!userId) return { received: true, skipped: 'no user id' }
    const planEnv = getRazorpayPlanEnv(event)
    const plan = resolvePlan(subEntity, planEnv)
    await upsertPaidSubscription(admin2, {
      user_id: userId,
      plan,
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: subEntity.id,
      provider_customer_id: subEntity.customer_id ?? null,
      trial_end: trialEndIso(subEntity),
      current_period_start:
        subEntity.current_start != null
          ? new Date(subEntity.current_start * 1000).toISOString()
          : null,
      current_period_end:
        subEntity.current_end != null
          ? new Date(subEntity.current_end * 1000).toISOString()
          : null,
      cancel_at_period_end: false,
    })
    return { received: true }
  }

  return { received: true, ignored: eventName }
}
