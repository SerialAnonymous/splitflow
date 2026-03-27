<script setup lang="ts">
const openIndex = ref(0)
const items = [
  {
    q: 'Is SplitFlow free to start?',
    a: 'Yes. Create a group, add expenses, and see balances without paying. Paid plans add larger groups, exports, and priority support when you’re ready to scale.',
  },
  {
    q: 'How do settlements work?',
    a: 'Record who paid whom (cash, transfer, or card). SplitFlow updates balances instantly so the group always agrees on who’s square.',
  },
  {
    q: 'Can I split unevenly or by percentage?',
    a: 'Absolutely—equal splits, custom amounts, or percentages per person. Perfect for couples, roommates with different room sizes, or teams with tiered contributions.',
  },
  {
    q: 'Do you store bank credentials?',
    a: 'No. You log expenses and settlements yourself; we don’t need your banking login. Connect only what you choose, and we use industry-standard encryption for your data.',
  },
  {
    q: 'Can I export for taxes or reimbursements?',
    a: 'Yes. Download clean summaries and line items when your accountant, employer, or spreadsheet asks for proof—without rebuilding everything by hand.',
  },
]
</script>

<template>
  <section id="blog" class="relative px-4 py-20 md:py-28">
    <div class="mx-auto max-w-3xl text-center">
      <h2 class="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Questions, answered</h2>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <GlowCtaButton href="mailto:sales@splitflow.app" size="md" class="shadow-md">
          Talk to us
        </GlowCtaButton>
        <a href="#footer-cta" class="text-sm font-semibold text-neutral-700 underline-offset-4 transition hover:text-neutral-900 hover:underline">
          Contact Us
        </a>
      </div>
    </div>

    <div class="mx-auto mt-14 max-w-3xl">
      <SaasCard class="divide-y divide-neutral-200/60 overflow-hidden border-white/60 bg-white/55 p-0">
        <div v-for="(item, i) in items" :key="i" class="text-left">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-neutral-900 transition hover:bg-white/50 md:px-8 md:py-5 md:text-base"
            @click="openIndex = openIndex === i ? -1 : i"
          >
            {{ item.q }}
            <span
              class="shrink-0 text-xl font-light text-neutral-400 transition-transform duration-300"
              :class="openIndex === i ? 'rotate-45' : ''"
            >+</span>
          </button>
          <div
            v-show="openIndex === i && item.a"
            class="border-t border-neutral-100/90 px-6 pb-6 pt-0 text-sm leading-relaxed text-neutral-600 md:px-8"
          >
            <p class="pt-4">{{ item.a }}</p>
          </div>
        </div>
      </SaasCard>
    </div>
  </section>
</template>
