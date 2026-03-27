import { createError, getHeader, readRawBody } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { getSupabaseServiceClient } from '../../utils/supabaseService'
import { downgradeToFree, upsertPaidSubscription } from '../../utils/subscriptionSync'
import { getRazorpayPlanEnv, planFromRazorpayPlanId } from '../../utils/razorpayPlans'

/** Razorpay subscription entity (subset) */
interface RzpSubEntity {
  id: string
  plan_id?: string
  customer_id?: string
  current_start?: number | null
  current_end?: number | null
  notes?: Record<string, string>
  status?: string
}

export default defineEventHandler(async (event) => {
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

  let json: { event?: string; payload?: { subscription?: { entity?: RzpSubEntity } } }
  try {
    json = JSON.parse(body)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const eventName = json.event
  if (
    eventName !== 'subscription.activated' &&
    eventName !== 'subscription.charged' &&
    eventName !== 'subscription.completed' &&
    eventName !== 'subscription.cancelled'
  ) {
    return { received: true, ignored: eventName }
  }

  const entity = json.payload?.subscription?.entity
  if (!entity?.id) {
    return { received: true, ignored: 'no subscription entity' }
  }

  const planEnv = getRazorpayPlanEnv(event)
  const userId = entity.notes?.supabase_user_id
  if (!userId) {
    console.warn('[razorpay webhook] missing notes.supabase_user_id', entity.id)
    return { received: true, skipped: 'no user id' }
  }

  const planNote = entity.notes?.plan
  const plan =
    planNote === 'team' || planNote === 'pro'
      ? planNote
      : planFromRazorpayPlanId(entity.plan_id, planEnv)

  if (eventName === 'subscription.cancelled' || entity.status === 'cancelled') {
    await downgradeToFree(admin, userId)
    return { received: true }
  }

  await upsertPaidSubscription(admin, {
    user_id: userId,
    plan,
    status: 'active',
    provider: 'razorpay',
    provider_subscription_id: entity.id,
    provider_customer_id: entity.customer_id ?? null,
    current_period_start: entity.current_start
      ? new Date(entity.current_start * 1000).toISOString()
      : null,
    current_period_end: entity.current_end
      ? new Date(entity.current_end * 1000).toISOString()
      : null,
    cancel_at_period_end: false,
  })

  return { received: true }
})
