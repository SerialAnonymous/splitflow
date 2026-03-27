<script setup lang="ts">
defineProps<{
  class?: string
  as?: string
}>()
</script>

<template>
  <component
    :is="as ?? 'div'"
    :class="[
      'rounded-[1.75rem] border border-white/60 bg-white/65 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08),0_4px_24px_-8px_rgba(124,58,237,0.06)] backdrop-blur-xl transition-all duration-200 ease-out md:rounded-[2rem]',
      'md:hover:-translate-y-0.5 md:hover:shadow-[0_20px_50px_-16px_rgba(124,58,237,0.12),0_12px_36px_-12px_rgba(0,0,0,0.08)]',
      $props.class,
    ]"
  >
    <slot />
  </component>
</template>
