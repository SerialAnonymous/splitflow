<script setup lang="ts">
import type { ExpenseWithParticipants } from '~/types/expense'

defineProps<{
  expenses: { expense: ExpenseWithParticipants; groupName: string; currency: string }[]
  limit?: number
}>()
</script>

<template>
  <div class="rounded-2xl bg-card p-4 shadow-card">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-foreground">Recent Bills</h2>
      <NuxtLink to="/groups" class="text-sm font-medium text-primary">Show All</NuxtLink>
    </div>
    <div v-if="!expenses.length" class="py-8 text-center text-sm text-muted-foreground">
      No expenses yet.
    </div>
    <ul v-else class="mt-4 space-y-3">
      <li
        v-for="item in expenses"
        :key="item.expense.id"
        class="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
      >
        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/groups/${item.expense.group_id}`" class="block">
            <p class="font-semibold text-foreground">{{ item.expense.description }}</p>
            <p class="text-sm text-muted-foreground">From {{ item.groupName }}</p>
          </NuxtLink>
          <div class="mt-2 flex items-center gap-1">
            <span
              v-for="(p, i) in (item.expense.participants ?? []).slice(0, 4)"
              :key="p.user_id"
              class="-ml-1.5 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary/30 text-[10px] font-medium text-foreground first:ml-0"
              :title="p.user?.name ?? p.user?.email"
            >
              {{ (p.user?.name ?? p.user?.email ?? '?')[0] }}
            </span>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span class="text-lg font-bold text-foreground">{{ item.currency }} {{ Number(item.expense.amount).toFixed(0) }}</span>
          <NuxtLink
            :to="`/groups/${item.expense.group_id}`"
            class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
          >
            Split Now
          </NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>
