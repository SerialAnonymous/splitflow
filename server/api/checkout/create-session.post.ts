import type { H3Event } from 'h3'
import { getSupabaseUserFromBearer } from '../../utils/supabaseUser'
import { RAZORPAY_SUBSCRIPTION_TOTAL_COUNT_MAX } from '../../utils/razorpayPlans'

interface Body {
  planId?: string
  billingCycle?: string
  billing?: {
    fullName?: string
    email?: string
    country?: string
    promoCode?: string
  }
}

function razorpayPlanId(
  event: H3Event,
  planId: 'pro' | 'team',
  yearly: boolean
): string | null {
  const c = useRuntimeConfig(event)
  const map = {
    pro: { m: c.razorpayPlanProMonthly, y: c.razorpayPlanProYearly },
    team: { m: c.razorpayPlanTeamMonthly, y: c.razorpayPlanTeamYearly },
  }[planId]
  const id = yearly ? map.y : map.m
  return typeof id === 'string' && id.length > 0 ? id : null
}

async function createRazorpayCheckout(
  event: H3Event,
  opts: {
    userId: string
    email: string
    planId: 'pro' | 'team'
    yearly: boolean
  }
) {
  const c = useRuntimeConfig(event)
  const keyId = c.razorpayKeyId as string
  const keySecret = c.razorpayKeySecret as string
  if (!keyId || !keySecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).',
    })
  }

  const planRzp = razorpayPlanId(event, opts.planId, opts.yearly)
  if (!planRzp) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Razorpay plan IDs are not configured (RAZORPAY_PLAN_* in .env).',
    })
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const total_count = opts.yearly ? 5 : RAZORPAY_SUBSCRIPTION_TOTAL_COUNT_MAX

  let res: {
    id?: string
    short_url?: string
    error?: { description?: string; code?: string }
  }
  try {
    res = await $fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: {
        plan_id: planRzp,
        total_count,
        customer_notify: 1,
        notify_info: { notify_email: opts.email },
        notes: {
          supabase_user_id: opts.userId,
          plan: opts.planId,
        },
      },
    })
  } catch (err: unknown) {
    const e = err as { data?: { error?: { description?: string } }; message?: string }
    const msg = e?.data?.error?.description ?? e?.message ?? 'Razorpay request failed'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  if (res.error?.description) {
    throw createError({
      statusCode: 400,
      statusMessage: res.error.description,
    })
  }

  if (!res.short_url) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Razorpay did not return a payment link (short_url).',
    })
  }

  return {
    ok: true as const,
    redirectUrl: res.short_url,
    sessionId: res.id ?? `rzp_${Date.now()}`,
    message: 'Redirecting to Razorpay.',
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)

  if (!body?.planId || !['pro', 'team'].includes(body.planId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid plan' })
  }
  if (!body.billing?.email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }
  if (!body.billing?.fullName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Full name is required' })
  }

  const user = await getSupabaseUserFromBearer(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sign in required to start checkout.',
    })
  }

  const planId = body.planId as 'pro' | 'team'
  const yearly = body.billingCycle === 'yearly'
  const email = body.billing.email.trim()
  return createRazorpayCheckout(event, {
    userId: user.id,
    email,
    planId,
    yearly,
  })
})
