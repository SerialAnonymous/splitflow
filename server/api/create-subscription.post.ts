/**
 * POST /api/create-subscription
 * Creates a Razorpay subscription with `start_at` = now + 365 days (no charge until then),
 * then returns public checkout options for Razorpay.js modal.
 *
 * Security: `user_id` in the body is ignored — the Supabase user comes from the Bearer JWT only.
 */
import { createError } from 'h3'
import { getSupabaseUserFromBearer } from '../utils/supabaseUser'

interface Body {
  /** Ignored if present — use Authorization bearer only */
  user_id?: string
  plan?: string
}

const SECONDS_PER_DAY = 86400
const TRIAL_DAYS = 365

/** Default Pro plan when RAZORPAY_PLAN_PRO_SUBSCRIPTION is unset (product owner supplied id). */
const DEFAULT_RAZORPAY_PLAN_PRO = 'plan_SW8ofMTWo6K0sY'

function razorpaySubscriptionPlanId(event: ReturnType<typeof useRuntimeConfig>, plan: 'pro' | 'team'): string | null {
  const c = event
  if (plan === 'pro') {
    const id = (c.razorpayPlanProSubscription as string)?.trim()
    return id || DEFAULT_RAZORPAY_PLAN_PRO
  }
  const team =
    ((c.razorpayPlanTeamSubscription as string)?.trim() ||
      (c.razorpayPlanTeamYearly as string)?.trim()) ||
    ''
  return team || null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const planRaw = body?.plan
  if (planRaw !== 'pro' && planRaw !== 'team') {
    throw createError({ statusCode: 400, statusMessage: 'plan must be pro or team' })
  }
  const plan = planRaw

  const user = await getSupabaseUserFromBearer(event)
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const c = useRuntimeConfig(event)
  const keyId = c.razorpayKeyId as string
  const keySecret = c.razorpayKeySecret as string
  if (!keyId || !keySecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).',
    })
  }

  const planId = razorpaySubscriptionPlanId(c, plan)
  if (!planId) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Team Razorpay plan is not configured (RAZORPAY_PLAN_TEAM_SUBSCRIPTION or RAZORPAY_PLAN_TEAM_YEARLY).',
    })
  }

  const email = user.email?.trim() || ''
  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    ''

  const startAt = Math.floor(Date.now() / 1000) + TRIAL_DAYS * SECONDS_PER_DAY

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  type RzpCreateSubRes = {
    id?: string
    short_url?: string
    error?: { description?: string; code?: string }
  }

  let res: RzpCreateSubRes
  try {
    res = await $fetch<RzpCreateSubRes>('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: {
        plan_id: planId,
        total_count: 120,
        quantity: 1,
        customer_notify: 1,
        start_at: startAt,
        ...(email ? { notify_info: { notify_email: email } } : {}),
        notes: {
          supabase_user_id: user.id,
          user_id: user.id,
          plan,
        },
      },
    })
  } catch (err: unknown) {
    const e = err as { data?: { error?: { description?: string } }; message?: string }
    const msg = e?.data?.error?.description ?? e?.message ?? 'Razorpay request failed'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  if (res.error?.description) {
    throw createError({ statusCode: 400, statusMessage: res.error.description })
  }

  const subscriptionId = res.id
  if (!subscriptionId) {
    throw createError({ statusCode: 500, statusMessage: 'Razorpay did not return subscription id.' })
  }

  return {
    subscription_id: subscriptionId,
    razorpay: {
      key: keyId,
      subscription_id: subscriptionId,
      name: 'SplitFlow',
      description: plan === 'team' ? 'SplitFlow Team' : 'SplitFlow Pro',
      prefill: {
        email: email || undefined,
        name: fullName || undefined,
      },
    },
  }
})
