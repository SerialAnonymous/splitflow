export interface CreateSubscriptionApiResponse {
  subscription_id: string
  razorpay: {
    key: string
    subscription_id: string
    name: string
    description: string
    prefill?: { email?: string; name?: string }
  }
}

function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Razorpay checkout script'))
    document.body.appendChild(s)
  })
}

type RazorpayInstance = {
  open: () => void
  on: (event: string, fn: (payload: unknown) => void) => void
}

type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance

/**
 * Creates a delayed-start Razorpay subscription (see POST /api/create-subscription) and opens Checkout.
 * Webhooks are the source of truth for `public.subscriptions`; this only drives UX.
 */
export async function openRazorpaySubscriptionModal(
  plan: 'pro' | 'team',
  accessToken: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  await loadRazorpayCheckoutScript()
  const Razorpay = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay
  if (!Razorpay) {
    return { ok: false, message: 'Razorpay failed to initialize.' }
  }

  const data = await $fetch<CreateSubscriptionApiResponse>('/api/create-subscription', {
    method: 'POST',
    body: { plan },
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return await new Promise<{ ok: true } | { ok: false; message: string }>((resolve) => {
    let settled = false
    const done = (result: { ok: true } | { ok: false; message: string }) => {
      if (settled) return
      settled = true
      resolve(result)
    }

    const options: Record<string, unknown> = {
      ...data.razorpay,
      handler() {
        done({ ok: true })
      },
      modal: {
        ondismiss() {
          done({ ok: false, message: 'Checkout closed.' })
        },
      },
    }

    const rzp = new Razorpay(options)
    rzp.on('payment.failed', () => {
      done({ ok: false, message: 'Payment failed. You were not charged.' })
    })
    rzp.open()
  })
}
