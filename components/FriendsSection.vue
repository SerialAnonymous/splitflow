<script setup lang="ts">
import type { GroupWithMemberCount } from '~/types/group'

defineProps<{
  groups: GroupWithMemberCount[]
}>()
</script>

<template>
  <div class="rounded-2xl bg-card p-4 shadow-card">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-foreground">Friends</h2>
      <NuxtLink to="/groups" class="text-sm font-medium text-primary">Show All</NuxtLink>
    </div>
    <div v-if="!groups.length" class="py-6 text-center text-sm text-muted-foreground">
      Join groups to see friends.
    </div>
    <div v-else class="mt-4 flex gap-4 overflow-x-auto pb-1">
      <NuxtLink
        v-for="g in groups.slice(0, 8)"
        :key="g.id"
        :to="`/groups/${g.id}`"
        class="flex shrink-0 flex-col items-center gap-1"
      >
        <span
          class="flex size-12 items-center justify-center rounded-full bg-primary/30 text-sm font-bold text-foreground"
        >
          {{ g.name.slice(0, 1) }}
        </span>
        <span class="max-w-[64px] truncate text-xs text-muted-foreground">{{ g.name.slice(0, 8) }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
