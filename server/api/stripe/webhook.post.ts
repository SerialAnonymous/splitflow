import { createError, getHeader, readRawBody } from 'h3'
import type Stripe from 'stripe'
import { getStripe } from '../../utils/stripeClient'
import { getSupabaseServiceClient } from '../../utils/supabaseService'
import { syncFromStripeSubscription, type RuntimePriceConfig } from '../../utils/subscriptionSync'

export default defineEventHandler(async (event) => {
  const stripe = getStripe(event)
  const webhookSecret = useRuntimeConfig(event).stripeWebhookSecret as string
  const admin = getSupabaseServiceClient(event)

  if (!stripe || !webhookSecret || !admin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Stripe webhook is not configured (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY).',
    })
  }

  const signature = getHeader(event, 'stripe-signature')
  if (!signature) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Stripe-Signature header' })
  }

  const raw = await readRawBody(event)
  if (raw === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const payload = typeof raw === 'string' ? raw : raw.toString('utf8')

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  const cfg = useRuntimeConfig(event)
  const priceCfg: RuntimePriceConfig = {
    stripePriceProMonthly: cfg.stripePriceProMonthly as string,
    stripePriceProYearly: cfg.stripePriceProYearly as string,
    stripePriceTeamMonthly: cfg.stripePriceTeamMonthly as string,
    stripePriceTeamYearly: cfg.stripePriceTeamYearly as string,
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        const subId = session.subscription
        if (typeof subId === 'string') {
          const sub = await stripe.subscriptions.retrieve(subId)
          await syncFromStripeSubscription(admin, sub, priceCfg)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object as Stripe.Subscription
        await syncFromStripeSubscription(admin, sub, priceCfg)
        break
      }
      default:
        break
    }
  } catch (e) {
    console.error('[stripe webhook] handler error', e)
    throw createError({ statusCode: 500, statusMessage: 'Webhook processing failed' })
  }

  return { received: true }
})
