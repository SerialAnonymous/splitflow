<script setup lang="ts">
const openIndex = ref<number | null>(0)

const items = [
  {
    q: 'Can I switch between monthly and yearly later?',
    a: 'Yes. Change your billing period on your account page. Yearly switches take effect on your next renewal; we’ll prorate fairly when upgrading mid-cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Major cards (Visa, Mastercard, Amex) and popular wallets where available. Invoicing for Team is available for annual contracts via sales.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'You can run on Free for as long as you like. When you upgrade to Pro, you get immediate access to every Pro feature—if it’s not a fit, cancel within the refund window shown at checkout.',
  },
  {
    q: 'Do you offer student or nonprofit discounts?',
    a: 'We’re piloting programs for verified nonprofits and student orgs. Email support with your details and we’ll share what’s available in your region.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Data is encrypted in transit and at rest in SOC-2–style infrastructure. You can export your group history anytime from Pro and Team plans.',
  },
]
</script>

<template>
  <section id="pricing-faq" class="relative px-4 py-16 md:py-24" aria-labelledby="pricing-faq-heading">
    <div class="mx-auto max-w-2xl text-center">
      <h2
        id="pricing-faq-heading"
        class="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl"
      >
        Pricing questions
      </h2>
      <p class="mt-4 text-neutral-600">
        Straight answers—no finance-degree required.
      </p>
    </div>

    <SaasCard class="mx-auto mt-10 max-w-3xl divide-y divide-white/50 overflow-hidden border-white/60 bg-white/50 p-0 backdrop-blur-xl">
      <div v-for="(item, i) in items" :key="i">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-neutral-900 transition-colors duration-300 hover:bg-white/40 md:px-8 md:text-base"
          :aria-expanded="openIndex === i"
          @click="openIndex = openIndex === i ? null : i"
        >
          {{ item.q }}
          <span
            class="shrink-0 text-xl font-light text-neutral-400 transition-transform duration-300"
            :class="openIndex === i ? 'rotate-45' : ''"
          >+</span>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-show="openIndex === i"
            class="border-t border-white/40 px-6 pb-6 text-sm leading-relaxed text-neutral-600 md:px-8"
          >
            <p class="pt-4">{{ item.a }}</p>
          </div>
        </Transition>
      </div>
    </SaasCard>
  </section>
</template>
