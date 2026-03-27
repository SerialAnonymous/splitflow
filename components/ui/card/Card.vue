<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn(
      'rounded-2xl border border-border/60 bg-card text-card-foreground shadow-card',
      props.class
    )"
  >
    <slot />
  </div>
</template>
