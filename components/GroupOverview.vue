<script setup lang="ts">
import type { GroupWithMemberCount } from '~/types/group'

defineProps<{
  groups: GroupWithMemberCount[]
}>()
</script>

<template>
  <div class="rounded-2xl bg-card p-4 shadow-card">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-foreground">Previous Bills</h2>
      <NuxtLink to="/groups" class="text-sm font-medium text-primary">Show All</NuxtLink>
    </div>
    <div v-if="!groups.length" class="py-6 text-center text-sm text-muted-foreground">
      No groups yet.
    </div>
    <div v-else class="mt-4 flex gap-3 overflow-x-auto pb-1">
      <NuxtLink
        v-for="g in groups.slice(0, 6)"
        :key="g.id"
        :to="`/groups/${g.id}`"
        class="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-3 min-w-[100px]"
      >
        <span class="text-lg font-bold text-foreground">{{ g.name.slice(0, 1) }}</span>
        <span class="text-xs font-medium text-foreground truncate max-w-full">{{ g.name }}</span>
        <span class="text-[10px] text-muted-foreground">{{ g.currency }} · {{ g.member_count ?? 0 }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
