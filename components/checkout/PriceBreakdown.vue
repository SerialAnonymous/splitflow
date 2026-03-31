<script setup lang="ts">
import {
  CHECKOUT_TRIAL_TRUST_HEADLINE,
  formatInr,
  trialLineAfterYearFree,
  type CheckoutPlanDefinition,
} from '~/constants/checkoutPlans'

const props = defineProps<{
  plan: CheckoutPlanDefinition
  yearly: boolean
  /** Illustrative promo when code entered */
  promoApplied?: boolean
}>()

/** Recurring amount after the free year (not charged at checkout). */
const recurringAfterYear1 = computed(() =>
  props.yearly ? props.plan.yearlyTotalInr : props.plan.monthlyInr
)

const recurringLabel = computed(() =>
  props.yearly ? 'Billed once per year after year 1' : 'Per month after year 1'
)

const promoDiscount = computed(() => {
  if (!props.promoApplied) return 0
  return Math.round(recurringAfterYear1.value * 0.1 * 100) / 100
})

const recurringAfterPromo = computed(() =>
  Math.max(0, recurringAfterYear1.value - promoDiscount.value)
)
</script>

<template>
  <GlassCard class="p-5 md:p-6">
    <h3 class="text-sm font-bold uppercase tracking-wide text-neutral-500">Due today</h3>
    <p class="mt-2 text-sm font-semibold leading-snug text-emerald-950">
      {{ CHECKOUT_TRIAL_TRUST_HEADLINE }}
    </p>
    <p class="mt-1.5 text-sm text-neutral-700">
      {{ trialLineAfterYearFree(plan) }}
    </p>

    <ul class="mt-5 space-y-3 border-t border-white/50 pt-5 text-sm">
      <li class="flex justify-between gap-4 text-neutral-800">
        <span>{{ plan.name }} · first year</span>
        <span class="shrink-0 font-semibold tabular-nums text-emerald-800">{{ formatInr(0) }}</span>
      </li>
      <li class="flex justify-between gap-4 text-neutral-600">
        <span class="max-w-[70%]">{{ recurringLabel }} (if you stay subscribed)</span>
        <span class="shrink-0 font-medium tabular-nums text-neutral-700">
          {{ formatInr(recurringAfterPromo) }}
        </span>
      </li>
      <li v-if="promoApplied && promoDiscount > 0" class="flex justify-between gap-4 text-emerald-800">
        <span>Promo (illustrative 10% on future renewals)</span>
        <span class="shrink-0 font-semibold tabular-nums">−{{ formatInr(promoDiscount) }}</span>
      </li>
      <li class="flex justify-between gap-4 text-neutral-500">
        <span>Taxes &amp; fees</span>
        <span class="shrink-0">At first charge (after year 1)</span>
      </li>
    </ul>
    <div class="mt-4 flex items-center justify-between border-t border-white/60 pt-4">
      <span class="text-sm font-semibold text-neutral-800">Total due today</span>
      <span class="text-xl font-bold tabular-nums text-emerald-800 md:text-2xl">
        {{ formatInr(0) }}
      </span>
    </div>
    <p class="mt-3 text-xs leading-relaxed text-neutral-500">
      You won’t be charged for the plan until your free year ends. Cancel anytime before then in Razorpay.
    </p>
  </GlassCard>
</template>
