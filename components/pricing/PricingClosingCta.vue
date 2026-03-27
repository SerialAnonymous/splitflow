<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section
    class="relative px-4 pb-8 pt-4 md:pb-12 md:pt-8"
    aria-labelledby="pricing-cta-heading"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-gradient-to-r from-violet-400/15 via-pink-300/20 to-amber-200/15 blur-3xl"
      aria-hidden="true"
    />

    <SaasCard
      class="relative mx-auto max-w-4xl overflow-hidden border-white/60 bg-gradient-to-br from-white/70 via-white/55 to-pink-50/40 px-8 py-12 text-center shadow-[0_24px_70px_-28px_rgba(124,58,237,0.18)] md:px-14 md:py-16"
    >
      <div
        class="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-pink-300/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl"
        aria-hidden="true"
      />

      <h2
        id="pricing-cta-heading"
        class="relative text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl lg:text-[2.5rem]"
      >
        Your group’s money deserves a calmer home.
      </h2>
      <p class="relative mx-auto mt-5 max-w-lg text-base text-neutral-600 md:text-lg">
        Start free, invite your people, and upgrade only when SplitFlow is clearly earning its keep.
      </p>

      <div class="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
        <NuxtLink
          to="/signup"
          class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-10 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(124,58,237,0.55),0_8px_24px_-8px_rgba(219,39,119,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_48px_-12px_rgba(124,58,237,0.5)] hover:brightness-105 sm:w-auto"
        >
          Start free today
          <ArrowRight class="size-4 shrink-0" stroke-width="2" aria-hidden="true" />
        </NuxtLink>
        <a
          href="mailto:sales@splitflow.app"
          class="text-sm font-semibold text-neutral-700 underline-offset-4 transition hover:text-neutral-900 hover:underline"
        >
          Talk to sales
        </a>
      </div>
    </SaasCard>
  </section>
</template>
