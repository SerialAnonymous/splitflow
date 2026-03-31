<script setup lang="ts">
import type { ExpenseWithParticipants } from '~/types/expense'
import { buildExpensesCsv, downloadTextFile } from '~/utils/exportExpensesCsv'

definePageMeta({
  layout: 'app',
})

const groupStore = useGroupStore()
const expenseStore = useExpenseStore()
const authStore = useAuthStore()
const userPlanStore = useUserPlanStore()

const loading = ref(true)
const allExpenses = ref<ExpenseWithParticipants[]>([])
const primaryCurrency = ref('USD')

function userDisplayName(userId: string) {
  for (const e of allExpenses.value) {
    if (e.paid_by === userId && e.paid_by_user) {
      return e.paid_by_user.name || e.paid_by_user.email || userId.slice(0, 8)
    }
    const p = e.participants?.find((x) => x.user_id === userId)
    if (p?.user) return p.user.name || p.user.email || userId.slice(0, 8)
  }
  if (userId === authStore.userId) return authStore.userEmail?.split('@')[0] ?? 'You'
  return userId.slice(0, 8)
}

async function loadAnalyticsData() {
  loading.value = true
  await userPlanStore.fetchPlan()
  if (!userPlanStore.hasFullAccess) {
    allExpenses.value = []
    primaryCurrency.value = 'USD'
    loading.value = false
    return
  }
  const { data: groups } = await groupStore.getUserGroups()
  if (!groups?.length) {
    allExpenses.value = []
    loading.value = false
    return
  }
  primaryCurrency.value = groups[0]?.currency ?? 'USD'
  const merged: ExpenseWithParticipants[] = []
  for (const g of groups) {
    if (!g.id) continue
    const { data } = await expenseStore.getGroupExpenses(g.id, { replaceState: false })
    if (data?.length) merged.push(...data)
  }
  allExpenses.value = merged
  loading.value = false
}

function onExportCsv() {
  if (!userPlanStore.hasFullAccess) {
    userPlanStore.openUpgradeModal()
    return
  }
  if (!allExpenses.value.length) return
  const csv = buildExpensesCsv(allExpenses.value, primaryCurrency.value)
  downloadTextFile(`splitflow-analytics-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8')
}

onMounted(() => {
  void loadAnalyticsData()
})
</script>

<template>
  <div class="space-y-8 md:space-y-10">
    <div
      class="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/85 via-pink-50/35 to-violet-50/30 px-6 py-8 shadow-[0_20px_60px_-24px_rgba(124,58,237,0.12)] md:rounded-[2rem] md:px-10 md:py-9"
    >
      <div class="pointer-events-none absolute right-0 top-0 size-40 rounded-full bg-violet-200/40 blur-3xl" aria-hidden="true" />
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">Analytics</h2>
          <p class="mt-2 max-w-2xl text-sm text-neutral-600 md:text-base">
            Spending by category, by member, and month—pooled across every group you belong to.
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 self-start rounded-xl border border-white/70 bg-white/50 px-4 py-2.5 text-sm font-semibold text-neutral-800 backdrop-blur-sm transition hover:bg-white/80"
          @click="onExportCsv"
        >
          Export CSV
        </button>
      </div>
    </div>

    <div v-if="loading" class="py-20 text-center text-neutral-500">Crunching numbers…</div>
    <GlassCard
      v-else-if="!userPlanStore.hasFullAccess"
      class="flex flex-col items-center gap-4 p-10 text-center md:p-14"
    >
      <div class="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 text-2xl shadow-inner" aria-hidden="true">
        📊
      </div>
      <h3 class="text-lg font-bold text-neutral-900 md:text-xl">Analytics is part of Pro</h3>
      <p class="max-w-md text-sm text-neutral-600">
        See spending by category, member, and month across all your groups—upgrade when you want the full picture.
      </p>
      <button
        type="button"
        class="mt-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
        @click="userPlanStore.openUpgradeModal()"
      >
        Unlock Pro Features
      </button>
    </GlassCard>
    <GroupAnalytics
      v-else
      :expenses="allExpenses"
      :currency="primaryCurrency"
      :user-display-name="userDisplayName"
    />
  </div>
</template>
