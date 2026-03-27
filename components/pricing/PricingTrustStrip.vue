<script setup lang="ts">
import { Globe, ShieldCheck, Undo2 } from 'lucide-vue-next'

const items = [
  {
    icon: Undo2,
    title: 'Cancel anytime',
    body: 'Downgrade or stop renewal in two clicks—your data stays exportable.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    body: 'Checkout uses trusted processors; we never store full card numbers on our servers.',
  },
  {
    icon: Globe,
    title: 'Global access',
    body: 'Use SplitFlow wherever your group is—web and mobile, synced in real time.',
  },
]
</script>

<template>
  <section class="relative px-4 py-12 md:py-16" aria-label="Trust">
    <SaasCard
      class="mx-auto max-w-5xl border-white/60 bg-gradient-to-r from-white/55 via-pink-50/25 to-white/55 px-6 py-8 shadow-[0_16px_48px_-20px_rgba(0,0,0,0.12)] md:px-10 md:py-10"
    >
      <div class="grid gap-8 md:grid-cols-3 md:gap-6">
        <div
          v-for="(item, i) in items"
          :key="item.title"
          class="flex gap-4 rounded-2xl border border-white/50 bg-white/35 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 md:flex-col md:p-6 md:hover:-translate-y-0.5"
        >
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 text-violet-700"
          >
            <component :is="item.icon" class="size-5" stroke-width="2" />
          </span>
          <div>
            <p class="font-semibold text-neutral-900">{{ item.title }}</p>
            <p class="mt-1.5 text-sm leading-relaxed text-neutral-600">
              {{ item.body }}
            </p>
          </div>
        </div>
      </div>
    </SaasCard>
  </section>
</template>
