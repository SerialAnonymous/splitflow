<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()

const benefits = [
  'Unlimited groups',
  'Full history',
  'Analytics',
  'Receipt uploads',
]

function onOverlayClick() {
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
    @click.self="onOverlayClick"
  >
    <GlassCard class="relative w-full max-w-md p-6 shadow-2xl md:p-8" @click.stop>
      <button
        type="button"
        class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        aria-label="Close"
        @click="emit('close')"
      >
        <span class="text-xl leading-none text-neutral-600">×</span>
      </button>
      <h2 class="pr-8 text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
        Unlock Pro Features
      </h2>
      <ul class="mt-5 space-y-2.5 text-sm text-neutral-700">
        <li v-for="b in benefits" :key="b" class="flex items-center gap-2">
          <span class="text-emerald-600" aria-hidden="true">✓</span>
          {{ b }}
        </li>
      </ul>
      <p class="mt-6 text-sm leading-relaxed text-neutral-600">
        Free for 1 year. ₹299/month after. Cancel anytime.
      </p>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-white/70 bg-white/50 px-4 text-sm font-semibold text-neutral-800 backdrop-blur-sm transition hover:bg-white/80"
          @click="emit('close')"
        >
          Not now
        </button>
        <NuxtLink
          to="/checkout?plan=pro"
          class="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
          @click="emit('close')"
        >
          Upgrade to Pro
        </NuxtLink>
      </div>
    </GlassCard>
  </div>
</template>
