<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const yearly = ref(false)

const plans = computed(() => {
  const y = yearly.value
  return [
    {
      id: 'free',
      name: 'Free',
      highlight: false,
      price: '$0',
      cycle: y ? 'forever' : 'forever',
      subPrice: null as string | null,
      tagline: 'Get started with friends or a small crew.',
      features: [
        '1 active group',
        'Up to 4 members',
        'Split expenses & balances',
        '7-day activity history',
        'Mobile & web access',
      ],
      cta: 'Start Free',
      ctaTo: '/signup',
      ctaExternal: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      highlight: true,
      price: y ? '$7' : '$12',
      cycle: y ? '/month, billed yearly' : '/month',
      subPrice: y ? '$84 billed once per year' : null,
      tagline: 'For couples, roommates, and power splitters.',
      features: [
        'Unlimited groups',
        'Up to 12 members per group',
        'Unlimited history & search',
        'Receipt capture & notes',
        'CSV export',
        'Email reminders',
      ],
      cta: 'Upgrade to Pro',
      ctaTo: '/checkout?plan=pro',
      ctaExternal: false,
    },
    {
      id: 'team',
      name: 'Team',
      highlight: false,
      price: y ? '$24' : '$39',
      cycle: y ? '/month, billed yearly' : '/month',
      subPrice: y ? '$288 billed once per year' : null,
      tagline: 'Offsites, clubs, and finance-approved workflows.',
      features: [
        'Everything in Pro',
        'Up to 50 members per group',
        'Role-based permissions',
        'Admin dashboard & audit trail',
        'Priority chat support',
        'Custom export & integrations*',
      ],
      cta: 'Upgrade to Team',
      ctaTo: '/checkout?plan=team',
      ctaExternal: false,
    },
  ]
})
</script>

<template>
  <section class="relative px-4 pb-16 pt-10 md:pb-24 md:pt-14" aria-labelledby="pricing-heading">
    <!-- Ambient blobs -->
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[min(90vw,42rem)] -translate-x-1/2 rounded-full bg-[#FFAAB4]/20 blur-[100px]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-[#FFD2BE]/35 blur-[90px] md:right-[10%]"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-5xl text-center">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Pricing
      </p>
      <h1
        id="pricing-heading"
        class="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 md:text-5xl lg:text-[3.25rem]"
      >
        Simple pricing.<br class="hidden sm:block" />
        No spreadsheet required.
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg">
        Pick a plan that matches how your group spends. Upgrade when you’re ready—no hidden fees, no surprise
        line items.
      </p>

      <!-- Billing toggle -->
      <div class="mt-10 flex flex-col items-center gap-3">
        <div
          class="inline-flex rounded-full border border-white/70 bg-white/45 p-1 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl"
          role="group"
          aria-label="Billing period"
        >
          <button
            type="button"
            :class="[
              'rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300',
              !yearly
                ? 'bg-neutral-900 text-white shadow-md'
                : 'text-neutral-600 hover:text-neutral-900',
            ]"
            :aria-pressed="!yearly"
            @click="yearly = false"
          >
            Monthly
          </button>
          <button
            type="button"
            :class="[
              'rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300',
              yearly
                ? 'bg-neutral-900 text-white shadow-md'
                : 'text-neutral-600 hover:text-neutral-900',
            ]"
            :aria-pressed="yearly"
            @click="yearly = true"
          >
            Yearly
          </button>
        </div>
        <p
          class="text-sm text-neutral-500 transition-opacity duration-300"
          :class="yearly ? 'opacity-100' : 'opacity-70'"
        >
          <span class="font-medium text-neutral-700">Save up to ~33%</span>
          when you pay yearly—same features, calmer cash flow.
        </p>
      </div>
    </div>

    <!-- Cards -->
    <div
      class="relative mx-auto mt-16 grid max-w-7xl gap-8 md:grid-cols-2 md:gap-6 lg:mt-20 lg:grid-cols-3 lg:items-stretch lg:gap-8"
    >
      <div
        v-for="plan in plans"
        :key="plan.id"
        :class="[
          'relative flex flex-col',
          plan.highlight ? 'lg:z-[1] lg:scale-[1.03]' : '',
          plan.id === 'team' ? 'md:col-span-2 md:flex md:justify-center lg:col-span-1 lg:block' : '',
        ]"
      >
        <div
          v-if="plan.highlight"
          class="absolute -top-3 left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-gradient-to-r from-violet-600/90 to-pink-500/90 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-pink-500/20"
        >
          Most popular
        </div>

        <SaasCard
          :class="[
            'relative flex h-full w-full flex-col overflow-hidden border-white/60 bg-gradient-to-br from-white/75 via-white/60 to-pink-50/30 p-8 transition-all duration-300 md:p-10',
            plan.id === 'team' ? 'max-w-md lg:max-w-none' : '',
            plan.highlight
              ? 'ring-2 ring-pink-200/60 shadow-[0_28px_70px_-24px_rgba(124,58,237,0.2),0_20px_50px_-20px_rgba(0,0,0,0.12)] md:hover:-translate-y-1 md:hover:shadow-[0_32px_80px_-24px_rgba(124,58,237,0.25),0_24px_55px_-20px_rgba(0,0,0,0.14)]'
              : 'md:hover:-translate-y-0.5',
          ]"
        >
          <div
            class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-pink-200/40 to-violet-200/30 blur-2xl"
            aria-hidden="true"
          />

          <div class="relative">
            <p class="text-sm font-semibold text-neutral-500">{{ plan.name }}</p>
            <div class="mt-4 flex flex-wrap items-baseline gap-1">
              <span class="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">{{ plan.price }}</span>
              <span v-if="plan.price !== '$0'" class="text-lg font-medium text-neutral-500">{{ plan.cycle }}</span>
            </div>
            <p v-if="plan.subPrice" class="mt-1 text-sm text-neutral-500">
              {{ plan.subPrice }}
            </p>
            <p class="mt-4 text-sm leading-relaxed text-neutral-600">
              {{ plan.tagline }}
            </p>
          </div>

          <ul class="relative mt-8 flex-1 space-y-3.5 border-t border-white/50 pt-8">
            <li
              v-for="(f, i) in plan.features"
              :key="i"
              class="flex gap-3 text-sm text-neutral-700"
            >
              <span
                class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700"
              >
                <Check class="size-3.5" stroke-width="2.5" />
              </span>
              <span>{{ f }}</span>
            </li>
          </ul>

          <p v-if="plan.id === 'team'" class="relative mt-4 text-center text-xs leading-relaxed text-neutral-500">
            * Enterprise integrations available on request.
          </p>

          <div class="relative mt-10">
            <GlowCtaButton
              v-if="!plan.ctaExternal && plan.ctaTo"
              :to="plan.ctaTo"
              size="md"
              class="w-full justify-center shadow-md"
            >
              {{ plan.cta }}
            </GlowCtaButton>
            <GlowCtaButton
              v-else-if="plan.ctaExternal && plan.ctaHref"
              :href="plan.ctaHref"
              size="md"
              class="w-full justify-center shadow-md"
            >
              {{ plan.cta }}
            </GlowCtaButton>
          </div>
        </SaasCard>
      </div>
    </div>
  </section>
</template>
