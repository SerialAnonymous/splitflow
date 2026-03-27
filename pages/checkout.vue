<script setup lang="ts">
import { CHECKOUT_PLANS, normalizeCheckoutPlanId } from '~/constants/checkoutPlans'
import { createCheckoutSession } from '~/composables/useCheckoutSession'
import { Loader2, ShieldCheck, Ban, Sparkles, PartyPopper, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

function resolveCheckoutErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'data' in e) {
    const data = (e as { data?: { message?: string; statusMessage?: string } }).data
    if (data?.message) return data.message
    if (data?.statusMessage) return data.statusMessage
  }
  if (e instanceof Error && e.message) return e.message
  return 'Payment could not be started. Please try again.'
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sub = useSubscriptionStore()

useHead({
  title: 'Checkout — SplitFlow.',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

const planId = computed(() => normalizeCheckoutPlanId(route.query.plan))
const plan = computed(() => CHECKOUT_PLANS[planId.value])

const yearly = computed({
  get: () => sub.billingCycle === 'yearly',
  set: (v: boolean) => sub.setBillingCycle(v ? 'yearly' : 'monthly'),
})

const providerModel = computed({
  get: () => sub.paymentProvider,
  set: (v) => sub.setPaymentProvider(v),
})

const promoApplied = computed(() => sub.billing.promoCode.trim().length > 0)

watch(
  planId,
  (id) => {
    sub.setActivePlanId(id)
  },
  { immediate: true }
)

watch(
  () => authStore.userEmail,
  (email) => {
    sub.hydrateEmailFromAuth(email)
  },
  { immediate: true }
)

onMounted(() => {
  sub.hydrateEmailFromAuth(authStore.userEmail)
})

async function onContinuePayment() {
  sub.setCheckoutLoading()
  try {
    const { $supabase } = useNuxtApp()
    const { data: { session } } = $supabase
      ? await $supabase.auth.getSession()
      : { data: { session: null } }
    if (!session?.access_token) {
      await router.push({
        path: '/login',
        query: { redirect: route.fullPath },
      })
      sub.setCheckoutIdle()
      return
    }

    const res = await createCheckoutSession(
      {
        planId: sub.activePlanId,
        billingCycle: sub.billingCycle,
        billing: { ...sub.billing },
      },
      session.access_token
    )
    if (res.redirectUrl) {
      window.location.href = res.redirectUrl
      return
    }
    sub.setCheckoutSuccess(sub.activePlanId)
  } catch (e: unknown) {
    sub.setCheckoutError(resolveCheckoutErrorMessage(e))
  }
}

function onRetry() {
  sub.setCheckoutIdle()
}

function goDashboard() {
  sub.setCheckoutIdle()
  router.push('/dashboard')
}

const successTitle = computed(() => {
  const id = sub.completedPlanId ?? sub.activePlanId
  return id === 'team' ? 'Welcome to Team 🚀' : 'Welcome to Pro 🚀'
})
</script>

<template>
  <div class="checkout-root">
    <!-- Success state -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="sub.checkoutStatus === 'success'" class="mx-auto max-w-lg py-8 text-center md:py-16">
        <GlassCard class="p-10 md:p-12">
          <div
            class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-violet-500 text-white shadow-xl"
          >
            <PartyPopper class="size-10" stroke-width="2" />
          </div>
          <h1 class="mt-8 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            {{ successTitle }}
          </h1>
          <p class="mt-4 text-sm leading-relaxed text-neutral-600 md:text-base">
            Your workspace is ready for unlimited history, smarter exports, and calmer group money ops.
            Billing confirmation will arrive by email once the gateway is connected.
          </p>
          <button
            type="button"
            class="mt-10 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-4 text-sm font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl"
            @click="goDashboard"
          >
            Go to Dashboard
          </button>
        </GlassCard>
      </div>
    </Transition>

    <!-- Error state -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="sub.checkoutStatus === 'error'" class="mx-auto max-w-lg py-8 text-center md:py-16">
        <GlassCard class="border-rose-200/50 bg-rose-50/30 p-10 md:p-12">
          <div
            class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-700 shadow-inner"
          >
            <AlertCircle class="size-10" stroke-width="2" />
          </div>
          <h1 class="mt-8 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            Payment didn’t go through
          </h1>
          <p class="mt-4 text-sm leading-relaxed text-neutral-600">
            {{ sub.checkoutError || 'Something interrupted checkout. No charges were made.' }}
          </p>
          <button
            type="button"
            class="mt-10 w-full rounded-2xl border border-neutral-900/10 bg-neutral-900 py-4 text-sm font-semibold text-white shadow-md transition duration-300 hover:bg-neutral-800"
            @click="onRetry"
          >
            Retry payment
          </button>
        </GlassCard>
      </div>
    </Transition>

    <!-- Main checkout -->
    <div v-if="sub.checkoutStatus === 'idle' || sub.checkoutStatus === 'loading'" class="pb-8">
      <nav class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500" aria-label="Breadcrumb">
        <NuxtLink to="/pricing" class="transition hover:text-violet-700">Pricing</NuxtLink>
        <span class="mx-2 text-neutral-300">/</span>
        <span class="text-neutral-700">Upgrade plan</span>
      </nav>

      <header class="relative mt-6 overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/85 via-pink-50/35 to-violet-50/30 px-6 py-10 shadow-[0_24px_64px_-28px_rgba(124,58,237,0.15)] md:rounded-[2rem] md:px-10 md:py-12">
        <div
          class="pointer-events-none absolute -right-24 top-0 size-56 rounded-full bg-pink-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div class="pointer-events-none absolute bottom-0 left-1/4 size-40 rounded-full bg-violet-200/30 blur-3xl" />
        <div class="relative">
          <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            <Sparkles class="size-3.5 text-violet-500" />
            Upgrade plan
          </p>
          <h1 class="mt-3 max-w-3xl text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
            Upgrade your SplitFlow experience
          </h1>
          <p class="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
            Unlock advanced splitting, exports, and calmer group finances—checkout takes under a minute.
            You’re subscribing to <span class="font-semibold text-neutral-800">{{ plan.name }}</span>.
          </p>
        </div>
      </header>

      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          :key="`${planId}-${sub.billingCycle}`"
          class="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start"
        >
          <div class="lg:col-span-5">
            <CheckoutPlanSummaryCard v-model:yearly="yearly" :plan="plan" />
          </div>

          <div class="space-y-6 lg:col-span-7">
            <CheckoutBillingForm v-model="sub.billing" />
            <CheckoutPaymentMethodSelector v-model="providerModel" />
            <CheckoutPriceBreakdown :plan="plan" :yearly="yearly" :promo-applied="promoApplied" />

            <GlassCard class="p-6 md:p-8">
              <button
                type="button"
                class="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-4 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(124,58,237,0.45)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_20px_50px_-16px_rgba(124,58,237,0.35)] disabled:pointer-events-none disabled:opacity-60"
                :disabled="sub.checkoutStatus === 'loading'"
                @click="onContinuePayment"
              >
                <Loader2
                  v-if="sub.checkoutStatus === 'loading'"
                  class="size-5 animate-spin"
                  aria-hidden="true"
                />
                <span>{{
                  sub.checkoutStatus === 'loading' ? 'Starting secure session…' : 'Continue to Secure Payment'
                }}</span>
              </button>

              <ul
                class="mt-8 flex flex-col gap-4 border-t border-white/50 pt-8 text-sm text-neutral-600 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10"
              >
                <li class="flex items-center justify-center gap-2">
                  <Ban class="size-4 shrink-0 text-neutral-400" />
                  Cancel anytime
                </li>
                <li class="flex items-center justify-center gap-2">
                  <ShieldCheck class="size-4 shrink-0 text-emerald-600" />
                  No hidden charges
                </li>
                <li class="flex items-center justify-center gap-2">
                  <ShieldCheck class="size-4 shrink-0 text-violet-600" />
                  Data secured
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
