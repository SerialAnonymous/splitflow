<script setup lang="ts">
import {
  CHECKOUT_TRIAL_TRUST_HEADLINE,
  afterTrialBillingSummary,
  formatInr,
  trialLineAfterYearFree,
  type CheckoutPlanDefinition,
} from '~/constants/checkoutPlans'
import { Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  plan: CheckoutPlanDefinition
}>()

const yearly = defineModel<boolean>('yearly', { required: true })

const annualSavingsVsMonthly = computed(() => {
  const monthlyAnnualized = props.plan.monthlyInr * 12
  const save = monthlyAnnualized - props.plan.yearlyTotalInr
  return Math.max(0, save)
})
</script>

<template>
  <GlassCard class="relative overflow-hidden p-6 md:p-8">
    <div
      class="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-violet-200/35 blur-3xl"
      aria-hidden="true"
    />
    <div class="relative">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Selected plan</p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            {{ plan.name }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-neutral-600">
            {{ plan.description }}
          </p>
        </div>
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-400 text-white shadow-lg"
        >
          <Sparkles class="size-6" stroke-width="2" />
        </div>
      </div>

      <p
        class="mt-6 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-2.5 text-sm font-semibold leading-snug text-emerald-950"
      >
        {{ CHECKOUT_TRIAL_TRUST_HEADLINE }}
      </p>
      <p class="mt-2 text-sm leading-relaxed text-neutral-700">
        {{ trialLineAfterYearFree(plan) }}
      </p>

      <div class="mt-6 flex flex-wrap items-end gap-2 border-t border-white/40 pt-6">
        <span class="text-4xl font-bold tabular-nums tracking-tight text-neutral-900 md:text-5xl">
          {{ formatInr(0) }}
        </span>
        <span class="pb-1.5 text-sm font-medium text-neutral-500">due today</span>
      </div>
      <p class="mt-2 text-sm leading-relaxed text-neutral-600">
        {{ afterTrialBillingSummary(plan, yearly) }}
      </p>
      <p class="mt-1 text-xs text-neutral-500">
        Monthly vs yearly applies
        <span class="font-medium text-neutral-600">after</span>
        your free year—not to today’s checkout.
      </p>

      <div
        class="mt-6 inline-flex rounded-full border border-white/70 bg-white/50 p-1 shadow-inner backdrop-blur-sm"
        role="group"
        aria-label="Billing period"
      >
        <button
          type="button"
          class="rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-out"
          :class="
            !yearly
              ? 'bg-neutral-900 text-white shadow-md'
              : 'text-neutral-600 hover:text-neutral-900'
          "
          :aria-pressed="!yearly"
          @click="yearly = false"
        >
          Monthly
        </button>
        <button
          type="button"
          class="rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-out"
          :class="
            yearly
              ? 'bg-neutral-900 text-white shadow-md'
              : 'text-neutral-600 hover:text-neutral-900'
          "
          :aria-pressed="yearly"
          @click="yearly = true"
        >
          Yearly
        </button>
      </div>

      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="yearly && annualSavingsVsMonthly > 0"
          class="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/70 px-4 py-2 text-sm font-semibold text-emerald-900"
        >
          After year 1: save {{ formatInr(annualSavingsVsMonthly) }}/yr vs monthly
        </div>
      </Transition>

      <ul class="mt-8 space-y-3 border-t border-white/50 pt-8">
        <li
          v-for="(line, i) in plan.highlights"
          :key="i"
          class="flex gap-3 text-sm text-neutral-700"
        >
          <span class="mt-0.5 size-1.5 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-400" />
          {{ line }}
        </li>
      </ul>
    </div>
  </GlassCard>
</template>
