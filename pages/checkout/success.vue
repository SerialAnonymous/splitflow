<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

useHead({
  title: 'Payment received — SplitFlow.',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
</script>

<template>
  <div class="mx-auto max-w-lg py-10 text-center md:py-16">
    <GlassCard class="p-10 md:p-12">
      <div
        class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-400 text-white shadow-lg"
      >
        <Sparkles class="size-8" stroke-width="2" />
      </div>
      <h1 class="mt-8 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
        Payment received
      </h1>
      <p class="mt-4 text-sm leading-relaxed text-neutral-600 md:text-base">
        Thanks—your subscription is updating. It may take a few seconds for your plan to show as Pro or Team in
        settings while webhooks finish syncing.
      </p>
      <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
        >
          Go to Dashboard
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/50 px-6 py-3.5 text-sm font-semibold text-neutral-800 backdrop-blur-sm transition hover:bg-white/80"
        >
          View settings
        </NuxtLink>
      </div>
    </GlassCard>
  </div>
</template>
