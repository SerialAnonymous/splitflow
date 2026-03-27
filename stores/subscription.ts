import type { CheckoutPlanId } from '~/constants/checkoutPlans'

export type BillingCycle = 'monthly' | 'yearly'
export type PaymentProviderChoice = 'razorpay'
export type CheckoutUiStatus = 'idle' | 'loading' | 'success' | 'error'

export interface BillingDetails {
  fullName: string
  email: string
  country: string
  promoCode: string
}

const defaultBilling = (): BillingDetails => ({
  fullName: '',
  email: '',
  country: 'US',
  promoCode: '',
})

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    /** Plan being purchased (from route or user selection) */
    activePlanId: 'pro' as CheckoutPlanId,
    billingCycle: 'monthly' as BillingCycle,
    paymentProvider: 'razorpay' as PaymentProviderChoice,
    billing: defaultBilling(),
    checkoutStatus: 'idle' as CheckoutUiStatus,
    checkoutError: null as string | null,
    /** Plan id successfully purchased (for success copy) */
    completedPlanId: null as CheckoutPlanId | null,
  }),

  getters: {
    isYearly: (s) => s.billingCycle === 'yearly',
  },

  actions: {
    setActivePlanId(id: CheckoutPlanId) {
      this.activePlanId = id
    },

    setBillingCycle(cycle: BillingCycle) {
      this.billingCycle = cycle
    },

    setPaymentProvider(p: PaymentProviderChoice) {
      this.paymentProvider = p
    },

    patchBilling(patch: Partial<BillingDetails>) {
      this.billing = { ...this.billing, ...patch }
    },

    resetBilling() {
      this.billing = defaultBilling()
    },

    setCheckoutIdle() {
      this.checkoutStatus = 'idle'
      this.checkoutError = null
    },

    setCheckoutLoading() {
      this.checkoutStatus = 'loading'
      this.checkoutError = null
    },

    setCheckoutSuccess(planId: CheckoutPlanId) {
      this.checkoutStatus = 'success'
      this.checkoutError = null
      this.completedPlanId = planId
    },

    setCheckoutError(message: string) {
      this.checkoutStatus = 'error'
      this.checkoutError = message
    },

    hydrateEmailFromAuth(email: string | null) {
      if (email && !this.billing.email) {
        this.billing.email = email
      }
    },
  },
})
