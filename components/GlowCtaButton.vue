<script setup lang="ts">
/**
 * Pill CTA with trailing arrow + lightweight mouse-tracking inner glow (CSS vars + rAF).
 */
import type { ComponentPublicInstance } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'

function resolveGlowEl(el: Element | ComponentPublicInstance | null): HTMLElement | null {
  if (!el) return null
  if (el instanceof HTMLElement) return el
  const inst = el as ComponentPublicInstance & { $el?: unknown }
  return inst.$el instanceof HTMLElement ? inst.$el : null
}

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit'
    size?: 'md' | 'lg'
    variant?: 'dark' | 'glass'
    /** Extra classes on the outer interactive element */
    class?: string
  }>(),
  {
    type: 'button',
    size: 'lg',
    variant: 'dark',
  }
)

const root = ref<HTMLElement | null>(null)

function setGlowRef(el: Element | ComponentPublicInstance | null) {
  root.value = resolveGlowEl(el)
}

let rafId = 0
let pending: { x: number; y: number } | null = null

function applyGlow(el: HTMLElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return
  const px = ((clientX - r.left) / r.width) * 100
  const py = ((clientY - r.top) / r.height) * 100
  el.style.setProperty('--gx', `${px}%`)
  el.style.setProperty('--gy', `${py}%`)
}

function onMouseMove(e: MouseEvent) {
  const el = root.value
  if (!el) return
  pending = { x: e.clientX, y: e.clientY }
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    if (pending && root.value) {
      applyGlow(root.value, pending.x, pending.y)
      pending = null
    }
  })
}

function onMouseEnter(e: MouseEvent) {
  if (root.value) applyGlow(root.value, e.clientX, e.clientY)
}

function onMouseLeave() {
  pending = null
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  root.value?.style.setProperty('--gx', '50%')
  root.value?.style.setProperty('--gy', '50%')
}

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})

const sizeClass = computed(() =>
  props.size === 'lg' ? 'px-10 py-3.5 text-sm' : 'px-7 py-3 text-sm'
)

const variantClass = computed(() => {
  if (props.variant === 'glass') {
    return [
      'border-zinc-900 bg-white/15 text-zinc-900 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.2)] backdrop-blur-md',
      'hover:bg-white/25 hover:border-zinc-800',
      'focus-visible:outline-zinc-900',
    ].join(' ')
  }
  return [
    'border-white/30 bg-neutral-900 text-white shadow-[0_10px_36px_-12px_rgba(0,0,0,0.45)]',
    'hover:border-white/45 hover:bg-neutral-800',
    'focus-visible:outline-neutral-900',
  ].join(' ')
})
</script>

<template>
  <NuxtLink
    v-if="to !== undefined && to !== ''"
    :ref="setGlowRef"
    :to="to"
    :class="[
      'glow-cta group relative isolate inline-flex min-h-10 items-center justify-center gap-2 overflow-hidden rounded-full border font-semibold transition-[box-shadow,background-color,border-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      sizeClass,
      variantClass,
      props.class,
    ]"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <span class="glow-cta__sheen pointer-events-none absolute inset-0 rounded-full opacity-90" aria-hidden="true" />
    <span class="glow-cta__spot pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
    <span class="relative z-[1] inline-flex items-center gap-2">
      <slot />
      <ArrowRight class="size-4 shrink-0" stroke-width="2" aria-hidden="true" />
    </span>
  </NuxtLink>
  <a
    v-else-if="href"
    :ref="setGlowRef"
    :href="href"
    :class="[
      'glow-cta group relative isolate inline-flex min-h-10 items-center justify-center gap-2 overflow-hidden rounded-full border font-semibold transition-[box-shadow,background-color,border-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      sizeClass,
      variantClass,
      props.class,
    ]"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <span class="glow-cta__sheen pointer-events-none absolute inset-0 rounded-full opacity-90" aria-hidden="true" />
    <span class="glow-cta__spot pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
    <span class="relative z-[1] inline-flex items-center gap-2">
      <slot />
      <ArrowRight class="size-4 shrink-0" stroke-width="2" aria-hidden="true" />
    </span>
  </a>
  <button
    v-else
    :ref="setGlowRef"
    :type="type"
    :class="[
      'glow-cta group relative isolate inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border font-semibold transition-[box-shadow,background-color,border-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      sizeClass,
      variantClass,
      props.class,
    ]"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <span class="glow-cta__sheen pointer-events-none absolute inset-0 rounded-full opacity-90" aria-hidden="true" />
    <span class="glow-cta__spot pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
    <span class="relative z-[1] inline-flex items-center gap-2">
      <slot />
      <ArrowRight class="size-4 shrink-0" stroke-width="2" aria-hidden="true" />
    </span>
  </button>
</template>

<style scoped>
.glow-cta {
  --gx: 50%;
  --gy: 50%;
}

/* Static top highlight (reference: subtle vertical lift) */
.glow-cta__sheen {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.08) 38%,
    transparent 72%
  );
  mix-blend-mode: soft-light;
}

/* Cursor-following inner glow (small radius = tight spotlight) */
.glow-cta__spot {
  background: radial-gradient(
    220px circle at var(--gx) var(--gy),
    rgba(255, 255, 255, 0.62) 0%,
    rgba(255, 255, 255, 0.22) 14%,
    rgba(255, 255, 255, 0.06) 28%,
    transparent 52%
  );
  mix-blend-mode: soft-light;
}

/* Glass variant: same tight radius, tuned for frosted bg */
.glow-cta.border-zinc-900 .glow-cta__spot {
  background: radial-gradient(
    220px circle at var(--gx) var(--gy),
    rgba(255, 255, 255, 0.78) 0%,
    rgba(255, 255, 255, 0.32) 15%,
    rgba(255, 255, 255, 0.08) 30%,
    transparent 54%
  );
  mix-blend-mode: overlay;
}

.glow-cta.border-zinc-900 .glow-cta__sheen {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0.12) 45%, transparent 70%);
  mix-blend-mode: overlay;
  opacity: 0.72;
}
</style>
