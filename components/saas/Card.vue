<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>

<template>
  <div
    :class="[
      'rounded-[1.75rem] border border-white/55 bg-white/65 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-300 ease-out md:rounded-[2rem] md:hover:-translate-y-0.5 md:hover:shadow-[0_24px_55px_-18px_rgba(124,58,237,0.12),0_16px_40px_-16px_rgba(0,0,0,0.1)]',
      $props.class,
    ]"
  >
    <slot />
  </div>
</template>
