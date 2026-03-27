<script setup lang="ts">
import type { CheckoutPlanDefinition } from '~/constants/checkoutPlans'

const props = defineProps<{
  plan: CheckoutPlanDefinition
  yearly: boolean
  /** Illustrative promo when code entered */
  promoApplied?: boolean
}>()

/** Sticker price shown before yearly discount (12 × monthly) */
const listPlanPrice = computed(() =>
  props.yearly ? props.plan.monthlyUsd * 12 : props.plan.monthlyUsd
)

const yearlyCommitmentDiscount = computed(() => {
  if (!props.yearly) return 0
  return listPlanPrice.value - props.plan.yearlyTotalUsd
})

const afterPlanDiscounts = computed(() =>
  props.yearly ? props.plan.yearlyTotalUsd : props.plan.monthlyUsd
)

const promoDiscount = computed(() => {
  if (!props.promoApplied) return 0
  return Math.round(afterPlanDiscounts.value * 0.1 * 100) / 100
})

const total = computed(() => Math.max(0, afterPlanDiscounts.value - promoDiscount.value))
</script>

<template>
  <GlassCard class="p-5 md:p-6">
    <h3 class="text-sm font-bold uppercase tracking-wide text-neutral-500">Price breakdown</h3>
    <ul class="mt-4 space-y-3 text-sm">
      <li class="flex justify-between gap-4 text-neutral-700">
        <span>{{ plan.name }} · {{ yearly ? '12 × monthly list' : 'Monthly' }}</span>
        <span class="shrink-0 font-medium tabular-nums text-neutral-900">
          ${{ listPlanPrice.toFixed(2) }}
        </span>
      </li>
      <li
        v-if="yearly && yearlyCommitmentDiscount > 0"
        class="flex justify-between gap-4 text-emerald-800"
      >
        <span>Yearly discount</span>
        <span class="shrink-0 font-semibold tabular-nums">
          −${{ yearlyCommitmentDiscount.toFixed(2) }}
        </span>
      </li>
      <li v-if="promoApplied && promoDiscount > 0" class="flex justify-between gap-4 text-emerald-800">
        <span>Promo (illustrative 10%)</span>
        <span class="shrink-0 font-semibold tabular-nums">−${{ promoDiscount.toFixed(2) }}</span>
      </li>
      <li class="flex justify-between gap-4 border-t border-white/50 pt-3 text-neutral-600">
        <span>Estimated taxes</span>
        <span class="shrink-0 text-neutral-500">At payment</span>
      </li>
    </ul>
    <div class="mt-4 flex items-center justify-between border-t border-white/60 pt-4">
      <span class="text-sm font-semibold text-neutral-600">Total due today</span>
      <span class="text-xl font-bold tabular-nums text-neutral-900 md:text-2xl">
        ${{ total.toFixed(2) }}
      </span>
    </div>
    <p v-if="!yearly" class="mt-3 text-xs text-neutral-500">
      Renews monthly until canceled. No hidden fees.
    </p>
  </GlassCard>
</template>
