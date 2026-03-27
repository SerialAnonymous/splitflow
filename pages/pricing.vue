<script setup lang="ts">
definePageMeta({
  layout: 'marketing',
})

useHead({
  title: 'Pricing — SplitFlow.',
  meta: [
    {
      name: 'description',
      content:
        'Simple pricing for SplitFlow—free, Pro, and Team plans for shared expenses, balances, and settlements.',
    },
  ],
})
</script>

<template>
  <div class="mx-auto w-full max-w-[90rem]">
    <LayoutNavbar />
    <PricingOverview />
    <PricingComparison />
    <PricingTrustStrip />
    <PricingPageFaq />
    <PricingClosingCta />
    <LayoutFooter />
  </div>
</template>
