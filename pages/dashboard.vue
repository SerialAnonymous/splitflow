<script setup lang="ts">
import type { ExpenseWithParticipants } from '~/types/expense'
import type { GroupWithMemberCount } from '~/types/group'
import AddExpenseModal from '~/components/expense/AddExpenseModal.vue'
import { Plus } from 'lucide-vue-next'
import { getNetBalances, type RecordedSettlement } from '~/utils/calculateBalances'

definePageMeta({
  layout: 'app',
})

const authStore = useAuthStore()
const groupStore = useGroupStore()
const expenseStore = useExpenseStore()
const settlementStore = useSettlementStore()
const router = useRouter()

const loading = ref(true)
const totalYouOwe = ref(0)
const totalOwedToYou = ref(0)
const netBalance = ref(0)
const recentExpensesWithGroup = ref<{ expense: ExpenseWithParticipants; groupName: string; currency: string }[]>([])
const dashboardGroups = ref<GroupWithMemberCount[]>([])
const dashboardGroupIds = ref<string[]>([])
const summaryCurrency = ref('USD')

const showExpenseModal = ref(false)
const expenseModalGroupId = ref<string | null>(null)
const expenseModalCurrency = ref('USD')

useDashboardRealtime(dashboardGroupIds, () => loadDashboard(true))

const RECENT_LIMIT = 8
const GROUPS_PREVIEW = 8

async function loadDashboard(silent = false) {
  if (!silent) loading.value = true
  totalYouOwe.value = 0
  totalOwedToYou.value = 0
  netBalance.value = 0
  recentExpensesWithGroup.value = []
  if (!silent) dashboardGroups.value = []

  const userId = authStore.userId
  if (!userId) {
    loading.value = false
    return
  }

  const { data: groups, error: groupsError } = await groupStore.getUserGroups()
  if (groupsError || !groups?.length) {
    if (!silent) loading.value = false
    dashboardGroupIds.value = []
    if (groups) dashboardGroups.value = groups
    return
  }

  dashboardGroupIds.value = groups.map((g) => g.id)
  dashboardGroups.value = groups.slice(0, GROUPS_PREVIEW)
  summaryCurrency.value = groups[0]?.currency ?? 'USD'

  const groupMap = new Map<string | undefined, { name: string; currency: string }>()
  groups.forEach((g) => groupMap.set(g.id, { name: g.name, currency: g.currency }))

  let youOwe = 0
  let owedToYou = 0
  const allExpenses: { expense: ExpenseWithParticipants; groupName: string; currency: string }[] = []

  for (const group of groups) {
    const [expRes, setRes] = await Promise.all([
      expenseStore.getGroupExpenses(group.id, { replaceState: false }),
      settlementStore.getGroupSettlements(group.id, { replaceState: false }),
    ])
    const expenses = expRes.data ?? []
    const settlements = setRes.data ?? []
    const recorded: RecordedSettlement[] = settlements.map((s) => ({
      payer_id: s.payer_id,
      receiver_id: s.receiver_id,
      amount: s.amount,
    }))
    const balances = getNetBalances(expenses, recorded)
    const myBalance = balances.get(userId) ?? 0
    if (myBalance < -0.001) youOwe += -myBalance
    else if (myBalance > 0.001) owedToYou += myBalance

    const info = groupMap.get(group.id)
    expenses.forEach((e) => {
      allExpenses.push({
        expense: e,
        groupName: info?.name ?? 'Group',
        currency: info?.currency ?? group.currency,
      })
    })
  }

  totalYouOwe.value = Math.round(youOwe * 100) / 100
  totalOwedToYou.value = Math.round(owedToYou * 100) / 100
  netBalance.value = Math.round((owedToYou - youOwe) * 100) / 100

  allExpenses.sort((a, b) => {
    const da = a.expense.date || a.expense.created_at || ''
    const db = b.expense.date || b.expense.created_at || ''
    return db.localeCompare(da)
  })
  recentExpensesWithGroup.value = allExpenses.slice(0, RECENT_LIMIT)
  if (!silent) loading.value = false
}

async function openAddExpense() {
  const groups = dashboardGroups.value.length ? dashboardGroups.value : groupStore.groups
  if (!groups.length) {
    await router.push('/groups')
    return
  }
  const g = groups[0]
  expenseModalGroupId.value = g.id!
  expenseModalCurrency.value = g.currency ?? 'USD'
  await groupStore.getGroupMembers(g.id!)
  showExpenseModal.value = true
}

async function onExpenseSaved() {
  showExpenseModal.value = false
  expenseModalGroupId.value = null
  await loadDashboard(true)
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="space-y-8 md:space-y-10">
    <ClientOnly>
      <template v-if="!authStore.isAuthenticated">
        <GlassCard class="p-8 text-center md:p-10">
          <div class="mx-auto flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-violet-100 text-4xl shadow-inner">
            💵
          </div>
          <h2 class="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
            Split fairly, stay in sync.
          </h2>
          <p class="mt-2 text-neutral-600">
            Sign in to see balances, groups, and recent activity.
          </p>
          <NuxtLink
            to="/login"
            class="mt-8 inline-flex rounded-2xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-800"
          >
            Sign in
          </NuxtLink>
        </GlassCard>
      </template>

      <template v-else>
        <div
          class="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/80 via-pink-50/40 to-violet-50/30 px-6 py-8 shadow-[0_20px_60px_-24px_rgba(124,58,237,0.15)] md:rounded-[2rem] md:px-10 md:py-10"
        >
          <div
            class="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-pink-200/40 blur-3xl"
            aria-hidden="true"
          />
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Welcome back
          </p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            {{ authStore.userEmail?.split('@')[0] ?? 'there' }}, here’s your money picture.
          </h2>
          <p class="mt-2 max-w-xl text-sm text-neutral-600 md:text-base">
            Balances across every group you’re in—clear, current, and calm.
          </p>
        </div>

        <div v-if="loading" class="py-16 text-center text-neutral-500">
          Loading your overview…
        </div>

        <template v-else>
          <div class="grid gap-4 sm:grid-cols-3">
            <GlassCard class="p-6">
              <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">You owe</p>
              <p class="mt-2 text-2xl font-bold tabular-nums text-neutral-900 md:text-3xl">
                {{ summaryCurrency }} {{ totalYouOwe.toFixed(2) }}
              </p>
            </GlassCard>
            <GlassCard class="p-6">
              <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">You’re owed</p>
              <p class="mt-2 text-2xl font-bold tabular-nums text-emerald-800 md:text-3xl">
                {{ summaryCurrency }} {{ totalOwedToYou.toFixed(2) }}
              </p>
            </GlassCard>
            <GlassCard class="p-6 ring-1 ring-pink-200/50">
              <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Net</p>
              <p
                class="mt-2 text-2xl font-bold tabular-nums md:text-3xl"
                :class="netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'"
              >
                {{ netBalance >= 0 ? '+' : '' }}{{ summaryCurrency }} {{ netBalance.toFixed(2) }}
              </p>
            </GlassCard>
          </div>

          <GlassCard class="p-6 md:p-8">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-lg font-bold text-neutral-900">Recent expenses</h3>
              <NuxtLink to="/groups" class="text-sm font-semibold text-violet-700 hover:text-violet-900">
                All groups
              </NuxtLink>
            </div>
            <div v-if="!recentExpensesWithGroup.length" class="py-12 text-center text-sm text-neutral-500">
              No expenses yet. Add one from a group or tap the + button.
            </div>
            <ul v-else class="mt-6 space-y-3">
              <li
                v-for="item in recentExpensesWithGroup"
                :key="item.expense.id"
                class="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/40 p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-md"
              >
                <div class="min-w-0 flex-1">
                  <NuxtLink :to="`/groups/${item.expense.group_id}`" class="font-semibold text-neutral-900 hover:underline">
                    {{ item.expense.description }}
                  </NuxtLink>
                  <p class="text-sm text-neutral-500">{{ item.groupName }}</p>
                </div>
                <span class="shrink-0 text-lg font-bold tabular-nums text-neutral-900">
                  {{ item.currency }} {{ Number(item.expense.amount).toFixed(2) }}
                </span>
              </li>
            </ul>
          </GlassCard>

          <div>
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-neutral-900">Active groups</h3>
              <NuxtLink to="/groups" class="text-sm font-semibold text-violet-700 hover:text-violet-900">
                Manage
              </NuxtLink>
            </div>
            <div v-if="!dashboardGroups.length" class="rounded-[1.75rem] border border-dashed border-white/60 bg-white/30 py-12 text-center text-neutral-500">
              You’re not in any groups yet.
              <NuxtLink to="/groups" class="mt-2 block font-semibold text-violet-700">Create one</NuxtLink>
            </div>
            <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NuxtLink
                v-for="g in dashboardGroups"
                :key="g.id"
                :to="`/groups/${g.id}`"
                class="group block"
              >
                <GlassCard class="h-full p-5 transition duration-200 group-hover:scale-[1.02]">
                  <div class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 text-lg font-bold text-neutral-800">
                    {{ g.name.slice(0, 1) }}
                  </div>
                  <p class="mt-4 font-bold text-neutral-900">{{ g.name }}</p>
                  <p class="mt-1 text-sm text-neutral-500">
                    {{ g.member_count ?? 0 }} members · {{ g.currency }}
                  </p>
                </GlassCard>
              </NuxtLink>
            </div>
          </div>
        </template>
      </template>
    </ClientOnly>

    <!-- FAB: desktop + mobile -->
    <button
      v-if="authStore.isAuthenticated && !loading"
      type="button"
      class="fixed bottom-8 right-8 z-40 hidden size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-[0_12px_40px_-8px_rgba(124,58,237,0.55)] transition duration-250 hover:scale-105 md:flex"
      aria-label="Add expense"
      @click="openAddExpense"
    >
      <Plus class="size-7" stroke-width="2.5" />
    </button>
    <button
      v-if="authStore.isAuthenticated && !loading"
      type="button"
      class="fixed bottom-6 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-[0_12px_40px_-8px_rgba(124,58,237,0.55)] transition duration-250 hover:scale-105 md:hidden"
      aria-label="Add expense"
      @click="openAddExpense"
    >
      <Plus class="size-7" stroke-width="2.5" />
    </button>

    <AddExpenseModal
      v-if="showExpenseModal && expenseModalGroupId"
      :group-id="expenseModalGroupId"
      :members="groupStore.members"
      :currency="expenseModalCurrency"
      mode="add"
      @close="showExpenseModal = false; expenseModalGroupId = null"
      @saved="onExpenseSaved"
    />
  </div>
</template>
