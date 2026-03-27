import Stripe from 'stripe'
import type { H3Event } from 'h3'

export function getStripe(event: H3Event): Stripe | null {
  const secret = useRuntimeConfig(event).stripeSecretKey as string
  if (!secret) return null
  return new Stripe(secret)
}
