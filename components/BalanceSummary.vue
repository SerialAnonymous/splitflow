<script setup lang="ts">
defineProps<{
  totalYouOwe: number
  totalOwedToYou: number
  currency: string
}>()
</script>

<template>
  <div class="rounded-2xl bg-card p-4 shadow-card">
    <p class="text-sm font-medium text-muted-foreground">Available Balance</p>
    <div class="mt-1 flex items-center gap-2">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <span class="text-lg font-bold">$</span>
      </span>
      <span class="text-2xl font-bold tracking-tight text-foreground">
        {{ currency }} {{ (totalOwedToYou - totalYouOwe).toFixed(2) }}
      </span>
    </div>
    <div v-if="totalYouOwe > 0" class="mt-2 text-xs text-muted-foreground">
      You owe {{ currency }} {{ totalYouOwe.toFixed(2) }} · Owed to you {{ currency }} {{ totalOwedToYou.toFixed(2) }}
    </div>
  </div>
</template>
