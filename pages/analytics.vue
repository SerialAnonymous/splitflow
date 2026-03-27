<script setup lang="ts">
import type { ExpenseWithParticipants } from '~/types/expense'

definePageMeta({
  layout: 'app',
})

const groupStore = useGroupStore()
const expenseStore = useExpenseStore()
const authStore = useAuthStore()

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

onMounted(async () => {
  loading.value = true
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
})
</script>

<template>
  <div class="space-y-8 md:space-y-10">
    <div
      class="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/85 via-pink-50/35 to-violet-50/30 px-6 py-8 shadow-[0_20px_60px_-24px_rgba(124,58,237,0.12)] md:rounded-[2rem] md:px-10 md:py-9"
    >
      <div class="pointer-events-none absolute right-0 top-0 size-40 rounded-full bg-violet-200/40 blur-3xl" aria-hidden="true" />
      <h2 class="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">Analytics</h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-600 md:text-base">
        Spending by category, by member, and month—pooled across every group you belong to.
      </p>
    </div>

    <div v-if="loading" class="py-20 text-center text-neutral-500">Crunching numbers…</div>
    <GroupAnalytics
      v-else
      :expenses="allExpenses"
      :currency="primaryCurrency"
      :user-display-name="userDisplayName"
    />
  </div>
</template>
