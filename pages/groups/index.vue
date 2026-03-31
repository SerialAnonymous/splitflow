<script setup lang="ts">
import type { GroupWithMemberCount } from '~/types/group'
import { FREE_MAX_GROUPS } from '~/constants/freePlanLimits'
import { getNetBalances, type RecordedSettlement } from '~/utils/calculateBalances'
import { Plus, Users } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

const authStore = useAuthStore()
const groupStore = useGroupStore()
const userPlanStore = useUserPlanStore()
const expenseStore = useExpenseStore()
const settlementStore = useSettlementStore()

const showCreateModal = ref(false)
const loadingBalances = ref(true)

type EnrichedGroup = GroupWithMemberCount & { myBalance: number }
const groupsWithBalance = ref<EnrichedGroup[]>([])

async function loadGroupsAndBalances() {
  loadingBalances.value = true
  const { data: groups } = await groupStore.getUserGroups()
  const userId = authStore.userId
  if (!groups?.length || !userId) {
    groupsWithBalance.value = (groups ?? []).map((g) => ({ ...g, myBalance: 0 }))
    loadingBalances.value = false
    return
  }

  const out: EnrichedGroup[] = []
  for (const g of groups) {
    if (!g.id) continue
    const [expRes, setRes] = await Promise.all([
      expenseStore.getGroupExpenses(g.id, { replaceState: false }),
      settlementStore.getGroupSettlements(g.id, { replaceState: false }),
    ])
    const recorded: RecordedSettlement[] = (setRes.data ?? []).map((s) => ({
      payer_id: s.payer_id,
      receiver_id: s.receiver_id,
      amount: s.amount,
    }))
    const net = getNetBalances(expRes.data ?? [], recorded).get(userId) ?? 0
    out.push({ ...g, myBalance: Math.round(net * 100) / 100 })
  }
  groupsWithBalance.value = out
  loadingBalances.value = false
}

function balanceLabel(balance: number, currency: string) {
  if (Math.abs(balance) < 0.001) return `Settled up · ${currency}`
  if (balance > 0) return `${currency} ${balance.toFixed(2)} owed to you`
  return `You owe ${currency} ${(-balance).toFixed(2)}`
}

function balanceTone(balance: number) {
  if (Math.abs(balance) < 0.001) return 'text-neutral-600'
  if (balance > 0) return 'text-emerald-800'
  return 'text-rose-700'
}

async function onGroupCreated() {
  showCreateModal.value = false
  await loadGroupsAndBalances()
}

function tryOpenCreateGroupModal() {
  if (userPlanStore.isFree && groupStore.groups.length >= FREE_MAX_GROUPS) {
    userPlanStore.openUpgradeModal()
    return
  }
  showCreateModal.value = true
}

onMounted(() => {
  loadGroupsAndBalances()
})
</script>

<template>
  <div class="space-y-8 md:space-y-10">
    <div
      class="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/80 via-violet-50/35 to-pink-50/30 px-6 py-8 shadow-[0_20px_60px_-24px_rgba(124,58,237,0.12)] md:rounded-[2rem] md:px-10 md:py-9"
    >
      <div class="pointer-events-none absolute -left-16 bottom-0 size-48 rounded-full bg-violet-200/35 blur-3xl" aria-hidden="true" />
      <h2 class="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">Your groups</h2>
      <p class="mt-2 max-w-xl text-sm text-neutral-600 md:text-base">
        Every shared space in one airy grid—balances update as expenses land.
      </p>
    </div>

    <div v-if="groupStore.error" class="rounded-2xl border border-rose-200/60 bg-rose-50/50 px-4 py-3 text-sm text-rose-800">
      {{ groupStore.error }}
    </div>

    <div
      v-if="groupStore.loading && groupStore.groups.length === 0"
      class="py-20 text-center text-neutral-500 transition duration-250"
    >
      Loading groups…
    </div>

    <div
      v-else-if="!groupStore.groups.length"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <button
        type="button"
        class="group text-left"
        @click="tryOpenCreateGroupModal"
      >
        <GlassCard
          class="flex min-h-[220px] flex-col items-center justify-center border-2 border-dashed border-white/70 bg-white/40 p-8 transition duration-250 group-hover:scale-[1.02] group-hover:border-violet-200/80 group-hover:bg-white/55"
        >
          <div
            class="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-400 text-white shadow-lg transition duration-250 group-hover:scale-105"
          >
            <Plus class="size-8" stroke-width="2.5" />
          </div>
          <p class="mt-5 text-lg font-bold text-neutral-900">Create your first group</p>
          <p class="mt-1 text-center text-sm text-neutral-600">Start splitting bills in seconds.</p>
        </GlassCard>
      </button>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        type="button"
        class="group text-left"
        @click="tryOpenCreateGroupModal"
      >
        <GlassCard
          class="flex min-h-[200px] flex-col justify-between border-2 border-dashed border-violet-200/50 bg-gradient-to-br from-violet-50/50 to-pink-50/40 p-6 transition duration-250 group-hover:scale-[1.02] group-hover:shadow-[0_20px_50px_-16px_rgba(124,58,237,0.15)]"
        >
          <div class="flex size-12 items-center justify-center rounded-2xl bg-white/80 text-violet-600 shadow-sm">
            <Plus class="size-6" stroke-width="2.5" />
          </div>
          <div>
            <p class="text-lg font-bold text-neutral-900">Create group</p>
            <p class="mt-1 text-sm text-neutral-600">New trip, home, or crew.</p>
          </div>
        </GlassCard>
      </button>

      <NuxtLink
        v-for="g in groupsWithBalance"
        :key="g.id"
        :to="`/groups/${g.id}`"
        class="group block"
      >
        <GlassCard class="flex h-full min-h-[200px] flex-col p-6 transition duration-250 group-hover:scale-[1.02]">
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 text-xl font-bold text-neutral-800 shadow-inner"
            >
              {{ g.name.slice(0, 1).toUpperCase() }}
            </div>
            <Users class="size-5 text-neutral-400" aria-hidden="true" />
          </div>
          <p class="mt-5 text-lg font-bold text-neutral-900">{{ g.name }}</p>
          <p class="mt-1 text-sm text-neutral-500">
            {{ g.member_count ?? 0 }} {{ (g.member_count ?? 0) === 1 ? 'member' : 'members' }} · {{ g.currency }}
          </p>
          <p
            class="mt-4 text-sm font-semibold tabular-nums"
            :class="balanceTone(g.myBalance)"
          >
            <span v-if="loadingBalances" class="text-neutral-400">Balance…</span>
            <span v-else>{{ balanceLabel(g.myBalance, g.currency) }}</span>
          </p>
          <span
            class="mt-auto inline-flex items-center justify-center rounded-xl bg-neutral-900/90 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition duration-250 group-hover:bg-neutral-900"
          >
            Open group
          </span>
        </GlassCard>
      </NuxtLink>
    </div>

    <CreateGroupModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onGroupCreated"
    />
  </div>
</template>
