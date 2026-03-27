<script setup lang="ts">
import { Label } from 'radix-vue'
import { type HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

interface Props {
  for?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <Label
    v-bind="props"
    :class="cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      props.class
    )"
  >
    <slot />
  </Label>
</template>
