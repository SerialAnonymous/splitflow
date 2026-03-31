<script setup lang="ts">
import type { ExpensePrefill } from '~/components/ExpenseForm.vue'
import type { ExpenseWithParticipants } from '~/types/expense'
import AddExpenseModal from '~/components/expense/AddExpenseModal.vue'
import { isExpenseWithinFreeHistory } from '~/constants/freePlanLimits'
import { calculateBalances } from '~/utils/calculateBalances'
import { Plus, Receipt } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

const route = useRoute()
const router = useRouter()
const groupId = computed(() => route.params.id as string)

useGroupRealtime(groupId)

const groupStore = useGroupStore()
const authStore = useAuthStore()
const expenseStore = useExpenseStore()
const settlementStore = useSettlementStore()
const userPlanStore = useUserPlanStore()

const showInviteModal = ref(false)
const showExpenseModal = ref(false)
const expenseModalMode = ref<'add' | 'edit'>('add')
const expenseToEdit = ref<ExpenseWithParticipants | null>(null)
const expenseFormPrefill = ref<ExpensePrefill | null>(null)
const showSettlementModal = ref(false)
const showInvoiceScan = ref(false)
const leaving = ref(false)
const acceptingInvite = ref(false)
const activeTab = ref<'expenses' | 'balances' | 'activity'>('expenses')

const tabs = [
  { id: 'expenses' as const, label: 'Expenses' },
  { id: 'balances' as const, label: 'Balances' },
  { id: 'activity' as const, label: 'Activity' },
]

async function loadGroup(id: string) {
  const { data, error } = await groupStore.getGroupById(id)
  if (error || !data) {
    await router.replace('/groups')
    return
  }
  await Promise.all([
    groupStore.getGroupMembers(id),
    expenseStore.getGroupExpenses(id),
    settlementStore.getGroupSettlements(id),
  ])
}

onMounted(() => {
  loadGroup(groupId.value)
})

watch(groupId, (id, prev) => {
  if (id && id !== prev) loadGroup(id)
})

let expenseHistoryIo: IntersectionObserver | null = null
let activityHistoryIo: IntersectionObserver | null = null

onUnmounted(() => {
  expenseHistoryIo?.disconnect()
  activityHistoryIo?.disconnect()
  groupStore.clearCurrentGroup()
  expenseStore.clearExpenses()
  settlementStore.clearSettlements()
})

const recordedSettlements = computed(() =>
  settlementStore.settlements.map((s) => ({
    payer_id: s.payer_id,
    receiver_id: s.receiver_id,
    amount: s.amount,
  }))
)
const balances = computed(() =>
  calculateBalances(expenseStore.expenses, recordedSettlements.value)
)

const settlementHint = computed(() => {
  const b = balances.value
  if (!b.length) return null
  const [first] = b
  return `${memberDisplay(first.from)} can pay ${memberDisplay(first.to)} ${groupStore.currentGroup?.currency ?? ''} ${first.amount.toFixed(2)} to knock down the largest balance.`
})

const memberDisplay = (userId: string) => {
  const m = groupStore.members.find((x) => x.user_id === userId)
  return m?.user?.name || m?.user?.email || userId.slice(0, 6) + '…'
}

const avatarMembers = computed(() => groupStore.members.filter((m) => m.status === 'active').slice(0, 5))
const extraMemberCount = computed(() =>
  Math.max(0, groupStore.members.filter((m) => m.status === 'active').length - 5)
)

const isMember = computed(() =>
  groupStore.members.some((m) => m.user_id === authStore.userId && m.status === 'active')
)
const isPendingMember = computed(() =>
  groupStore.members.some((m) => m.user_id === authStore.userId && m.status === 'pending')
)

type ActivityRow = {
  sortKey: string
  kind: 'expense' | 'settlement'
  title: string
  subtitle: string
  amount: string | null
}

const activityItems = computed((): ActivityRow[] => {
  const cur = groupStore.currentGroup
  if (!cur) return []
  const c = cur.currency
  const rows: ActivityRow[] = []
  for (const e of expenseStore.expenses) {
    const key = (e.created_at || e.date || '').toString()
    rows.push({
      sortKey: key,
      kind: 'expense',
      title: e.description,
      subtitle: `Expense · ${memberDisplay(e.paid_by)} paid`,
      amount: `${c} ${Number(e.amount).toFixed(2)}`,
    })
  }
  for (const s of settlementStore.settlements) {
    const key = (s.created_at || s.date || '').toString()
    rows.push({
      sortKey: key,
      kind: 'settlement',
      title: 'Payment recorded',
      subtitle: `${memberDisplay(s.payer_id)} → ${memberDisplay(s.receiver_id)}`,
      amount: `${c} ${Number(s.amount).toFixed(2)}`,
    })
  }
  return rows.sort((a, b) => b.sortKey.localeCompare(a.sortKey))
})

function expenseUnlocked(e: ExpenseWithParticipants) {
  if (userPlanStore.hasFullAccess) return true
  return isExpenseWithinFreeHistory(e.date || e.created_at)
}

function activityUnlocked(row: ActivityRow) {
  if (userPlanStore.hasFullAccess) return true
  return isExpenseWithinFreeHistory(row.sortKey)
}

const firstLockedExpenseIndex = computed(() => {
  if (userPlanStore.hasFullAccess) return -1
  const i = expenseStore.expenses.findIndex((e) => !expenseUnlocked(e))
  return i
})

const firstLockedActivityIndex = computed(() => {
  if (userPlanStore.hasFullAccess) return -1
  const items = activityItems.value
  const i = items.findIndex((r) => !activityUnlocked(r))
  return i
})

const expenseLockSentinel = ref<HTMLElement | null>(null)
const activityLockSentinel = ref<HTMLElement | null>(null)
const showExpenseHistoryUnlock = ref(false)
const showActivityHistoryUnlock = ref(false)

function setExpenseLockSentinel(el: unknown) {
  if (el == null) {
    expenseLockSentinel.value = null
    return
  }
  expenseLockSentinel.value = el instanceof HTMLElement ? el : null
}

function setActivityLockSentinel(el: unknown) {
  if (el == null) {
    activityLockSentinel.value = null
    return
  }
  activityLockSentinel.value = el instanceof HTMLElement ? el : null
}

function bindExpenseHistoryIo() {
  expenseHistoryIo?.disconnect()
  expenseHistoryIo = null
  showExpenseHistoryUnlock.value = false
  if (!import.meta.client || userPlanStore.hasFullAccess || firstLockedExpenseIndex.value < 0) return
  const el = expenseLockSentinel.value
  if (!el) return
  expenseHistoryIo = new IntersectionObserver(
    ([e]) => {
      showExpenseHistoryUnlock.value = !!(e?.isIntersecting)
    },
    { threshold: 0, rootMargin: '0px 0px -12% 0px' }
  )
  expenseHistoryIo.observe(el)
}

function bindActivityHistoryIo() {
  activityHistoryIo?.disconnect()
  activityHistoryIo = null
  showActivityHistoryUnlock.value = false
  if (!import.meta.client || userPlanStore.hasFullAccess || firstLockedActivityIndex.value < 0) return
  const el = activityLockSentinel.value
  if (!el) return
  activityHistoryIo = new IntersectionObserver(
    ([e]) => {
      showActivityHistoryUnlock.value = !!(e?.isIntersecting)
    },
    { threshold: 0, rootMargin: '0px 0px -12% 0px' }
  )
  activityHistoryIo.observe(el)
}

watch(
  [expenseLockSentinel, firstLockedExpenseIndex, () => expenseStore.expenses.length, () => userPlanStore.hasFullAccess],
  () => nextTick(() => bindExpenseHistoryIo())
)

watch(
  [activityLockSentinel, firstLockedActivityIndex, () => activityItems.value.length, () => userPlanStore.hasFullAccess],
  () => nextTick(() => bindActivityHistoryIo())
)

async function handleLeave() {
  if (!confirm('Leave this group? You can rejoin later if invited.')) return
  leaving.value = true
  const { error } = await groupStore.leaveGroup(groupId.value)
  leaving.value = false
  if (!error) await router.push('/groups')
}

async function handleAcceptInvite() {
  acceptingInvite.value = true
  const { error } = await groupStore.joinGroup(groupId.value)
  acceptingInvite.value = false
  if (!error) await groupStore.getGroupMembers(groupId.value)
}

function onInvited() {
  groupStore.getGroupMembers(groupId.value)
}

function openAddExpense() {
  expenseModalMode.value = 'add'
  expenseToEdit.value = null
  expenseFormPrefill.value = null
  showExpenseModal.value = true
}

function openAddViaInvoice() {
  if (!userPlanStore.hasFullAccess) {
    userPlanStore.openUpgradeModal()
    return
  }
  showInvoiceScan.value = true
}

function onInvoiceConfirm(data: ExpensePrefill) {
  expenseFormPrefill.value = data
  showInvoiceScan.value = false
  expenseModalMode.value = 'add'
  expenseToEdit.value = null
  showExpenseModal.value = true
}

function openEditExpense(expense: ExpenseWithParticipants) {
  expenseModalMode.value = 'edit'
  expenseToEdit.value = expense
  expenseFormPrefill.value = null
  showExpenseModal.value = true
}

function closeExpenseModal() {
  showExpenseModal.value = false
  expenseToEdit.value = null
  expenseFormPrefill.value = null
}

async function onExpenseSaved() {
  await expenseStore.getGroupExpenses(groupId.value)
}

async function onExpenseModalSaved() {
  await onExpenseSaved()
  closeExpenseModal()
}

async function onSettlementSaved() {
  await settlementStore.getGroupSettlements(groupId.value)
}

async function handleDeleteExpense(expense: ExpenseWithParticipants) {
  if (!confirm(`Delete "${expense.description}"?`)) return
  const { error } = await expenseStore.deleteExpense(expense.id)
  if (!error) await expenseStore.getGroupExpenses(groupId.value)
}

function memberInitial(m: (typeof groupStore.members)[0]) {
  const n = m.user?.name || m.user?.email || '?'
  return n[0]!.toUpperCase()
}
</script>

<template>
  <div class="space-y-6 pb-28 md:space-y-8 md:pb-8">
    <div v-if="!groupStore.currentGroup && groupStore.loading" class="py-20 text-center text-neutral-500">
      Loading group…
    </div>

    <template v-else-if="groupStore.currentGroup">
      <GlassCard class="relative overflow-hidden p-6 md:p-8">
        <div
          class="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-pink-200/30 blur-3xl"
          aria-hidden="true"
        />
        <div class="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0 flex-1">
            <h2 class="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              {{ groupStore.currentGroup.name }}
            </h2>
            <p v-if="groupStore.currentGroup.description" class="mt-2 text-sm text-neutral-600 md:text-base">
              {{ groupStore.currentGroup.description }}
            </p>
            <p class="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {{ groupStore.currentGroup.currency }}
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-2">
              <div class="flex -space-x-2">
                <div
                  v-for="m in avatarMembers"
                  :key="m.user_id"
                  class="flex size-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-100 to-violet-100 text-xs font-bold text-neutral-800 shadow-sm"
                  :title="m.user?.name || m.user?.email || ''"
                >
                  {{ memberInitial(m) }}
                </div>
                <div
                  v-if="extraMemberCount > 0"
                  class="flex size-10 items-center justify-center rounded-full border-2 border-white bg-white/80 text-xs font-semibold text-neutral-600"
                >
                  +{{ extraMemberCount }}
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
              <button
                v-if="isPendingMember"
                type="button"
                class="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition duration-250 hover:scale-[1.02] hover:bg-neutral-800 disabled:opacity-50"
                :disabled="acceptingInvite"
                @click="handleAcceptInvite"
              >
                {{ acceptingInvite ? 'Joining…' : 'Accept invite' }}
              </button>
              <button
                v-if="isMember"
                type="button"
                class="rounded-full border border-white/70 bg-white/50 px-5 py-2.5 text-sm font-semibold text-neutral-800 backdrop-blur-sm transition duration-250 hover:bg-white/80"
                @click="showInviteModal = true"
              >
                Invite
              </button>
              <button
                v-if="isMember"
                type="button"
                class="rounded-full border border-rose-200/60 bg-rose-50/50 px-5 py-2.5 text-sm font-semibold text-rose-800 transition duration-250 hover:bg-rose-100/80 disabled:opacity-50"
                :disabled="leaving"
                @click="handleLeave"
              >
                {{ leaving ? 'Leaving…' : 'Leave group' }}
              </button>
            </div>
          </div>

          <div v-if="isMember" class="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200/60 bg-violet-50/50 px-4 py-3 text-sm font-semibold text-violet-900 transition duration-250 hover:bg-violet-100/60"
              @click="openAddViaInvoice"
            >
              <Receipt class="size-4" />
              Via invoice
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-250 hover:scale-[1.02] hover:shadow-xl"
              @click="openAddExpense"
            >
              <Plus class="size-5" stroke-width="2.5" />
              Add expense
            </button>
          </div>
        </div>
      </GlassCard>

      <div v-if="groupStore.error" class="rounded-2xl border border-rose-200/60 bg-rose-50/50 px-4 py-3 text-sm text-rose-800">
        {{ groupStore.error }}
      </div>

      <!-- Sub-navigation tabs -->
      <div
        class="sticky top-[4.5rem] z-20 mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-1 rounded-[1.25rem] border border-white/55 bg-white/40 p-1.5 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.1)] backdrop-blur-xl md:top-24"
      >
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-250"
          :class="
            activeTab === t.id
              ? 'bg-white/90 text-neutral-900 shadow-md'
              : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-900'
          "
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Expenses -->
      <GlassCard v-show="activeTab === 'expenses'" class="p-6 md:p-8">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-lg font-bold text-neutral-900">Timeline</h3>
            <p class="text-sm text-neutral-500">Every split, newest first.</p>
          </div>
        </div>

        <div v-if="expenseStore.loading && expenseStore.expenses.length === 0" class="py-16 text-center text-neutral-500">
          Loading expenses…
        </div>
        <div v-else-if="expenseStore.expenses.length === 0" class="py-16 text-center text-neutral-500">
          No expenses yet. Add one to get started.
        </div>
        <ul v-else class="relative mt-8 space-y-0">
          <li
            v-for="(expense, idx) in expenseStore.expenses"
            :key="expense.id"
            class="flex gap-4 pb-10 transition-[filter,opacity] duration-200 last:pb-0"
            :class="
              expenseUnlocked(expense)
                ? ''
                : 'pointer-events-none select-none blur-[3px] opacity-[0.48]'
            "
            :ref="
              idx === firstLockedExpenseIndex && firstLockedExpenseIndex >= 0
                ? (el) => setExpenseLockSentinel(el)
                : undefined
            "
          >
            <div class="flex w-9 shrink-0 flex-col items-center pt-1">
              <span
                class="size-3.5 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-400 shadow-md ring-4 ring-white/70"
              />
              <div
                v-if="idx < expenseStore.expenses.length - 1"
                class="mt-2 w-px flex-1 min-h-[3rem] rounded-full bg-gradient-to-b from-violet-200/90 to-violet-100/20"
              />
            </div>
            <div class="min-w-0 flex-1">
              <ExpenseItem
                variant="glass"
                :expense="expense"
                :currency="groupStore.currentGroup.currency"
                :current-user-id="authStore.userId"
                :can-edit="isMember"
                @edit="openEditExpense"
                @delete="handleDeleteExpense"
              />
            </div>
          </li>
        </ul>

        <div class="mt-10 border-t border-white/40 pt-8">
          <h4 class="text-sm font-bold uppercase tracking-wide text-neutral-500">Members</h4>
          <div class="mt-4 rounded-2xl border border-white/50 bg-white/35 p-4 backdrop-blur-sm">
            <GroupMemberList
              :members="groupStore.members"
              :current-user-id="authStore.userId"
              :can-manage="isMember"
            />
          </div>
        </div>
      </GlassCard>

      <!-- Balances -->
      <div v-show="activeTab === 'balances'" class="space-y-6">
        <GlassCard class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <h3 class="text-lg font-bold text-neutral-900">Who owes whom</h3>
            <p class="text-sm text-neutral-500">After recorded payments.</p>
          </div>
          <button
            v-if="isMember"
            type="button"
            class="rounded-2xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition duration-250 hover:scale-[1.02]"
            @click="showSettlementModal = true"
          >
            Record payment
          </button>
        </GlassCard>

        <GlassCard v-if="settlementHint" class="border-violet-200/40 bg-violet-50/30 p-5 md:p-6">
          <p class="text-xs font-bold uppercase tracking-wide text-violet-800">Simplified suggestion</p>
          <p class="mt-2 text-sm text-neutral-800">{{ settlementHint }}</p>
        </GlassCard>

        <div v-if="balances.length === 0" class="rounded-[1.75rem] border border-dashed border-white/60 bg-white/30 py-16 text-center text-neutral-500 md:rounded-[2rem]">
          Everyone is settled up.
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2">
          <GlassCard
            v-for="(b, i) in balances"
            :key="`${b.from}-${b.to}-${i}`"
            class="p-5 transition duration-250 md:hover:-translate-y-0.5"
          >
            <p class="text-sm text-neutral-600">
              <span class="font-semibold text-neutral-900">{{ memberDisplay(b.from) }}</span>
              owes
              <span class="font-semibold text-neutral-900">{{ memberDisplay(b.to) }}</span>
            </p>
            <p class="mt-3 text-2xl font-bold tabular-nums text-neutral-900">
              {{ groupStore.currentGroup.currency }} {{ b.amount.toFixed(2) }}
            </p>
          </GlassCard>
        </div>
      </div>

      <!-- Activity -->
      <GlassCard v-show="activeTab === 'activity'" class="p-6 md:p-8">
        <h3 class="text-lg font-bold text-neutral-900">Activity</h3>
        <p class="text-sm text-neutral-500">Expenses and payments in one stream.</p>
        <ul v-if="!activityItems.length" class="py-16 text-center text-neutral-500">
          Nothing here yet.
        </ul>
        <ul v-else class="relative mt-8 space-y-0">
          <li
            v-for="(row, idx) in activityItems"
            :key="`${row.kind}-${row.sortKey}-${idx}`"
            class="flex gap-4 pb-8 transition-[filter,opacity] duration-200 last:pb-0"
            :class="
              activityUnlocked(row)
                ? ''
                : 'pointer-events-none select-none blur-[3px] opacity-[0.48]'
            "
            :ref="
              idx === firstLockedActivityIndex && firstLockedActivityIndex >= 0
                ? (el) => setActivityLockSentinel(el)
                : undefined
            "
          >
            <div class="flex w-9 shrink-0 flex-col items-center pt-1">
              <span
                class="size-3 shrink-0 rounded-full shadow-sm ring-4 ring-white/70"
                :class="row.kind === 'expense' ? 'bg-pink-400' : 'bg-emerald-400'"
              />
              <div
                v-if="idx < activityItems.length - 1"
                class="mt-2 w-px flex-1 min-h-[2rem] rounded-full bg-gradient-to-b from-neutral-200/80 to-transparent"
              />
            </div>
            <GlassCard class="min-w-0 flex-1 !rounded-2xl p-4 md:!rounded-[1.35rem]">
              <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">{{ row.kind === 'expense' ? 'Expense' : 'Settlement' }}</p>
              <p class="mt-1 font-semibold text-neutral-900">{{ row.title }}</p>
              <p class="mt-0.5 text-sm text-neutral-600">{{ row.subtitle }}</p>
              <p v-if="row.amount" class="mt-2 text-lg font-bold tabular-nums text-neutral-900">
                {{ row.amount }}
              </p>
            </GlassCard>
          </li>
        </ul>
      </GlassCard>

      <!-- Desktop FAB -->
      <button
        v-if="isMember"
        type="button"
        class="fixed bottom-8 right-8 z-30 hidden size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-[0_12px_40px_-8px_rgba(124,58,237,0.55)] transition duration-250 hover:scale-105 md:flex"
        aria-label="Add expense"
        @click="openAddExpense"
      >
        <Plus class="size-7" stroke-width="2.5" />
      </button>

      <button
        v-if="isMember"
        type="button"
        class="fixed bottom-6 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-[0_12px_40px_-8px_rgba(124,58,237,0.55)] transition duration-250 hover:scale-105 md:hidden"
        aria-label="Add expense"
        @click="openAddExpense"
      >
        <Plus class="size-7" stroke-width="2.5" />
      </button>
    </template>

    <AddExpenseModal
      v-if="showExpenseModal && groupStore.currentGroup"
      :group-id="groupId"
      :members="groupStore.members"
      :currency="groupStore.currentGroup.currency"
      :mode="expenseModalMode"
      :initial-expense="expenseToEdit"
      :prefill="expenseFormPrefill"
      @close="closeExpenseModal"
      @saved="onExpenseModalSaved"
    />

    <InvoiceScanFlow
      v-if="showInvoiceScan"
      @close="showInvoiceScan = false"
      @confirm="onInvoiceConfirm"
    />

    <InviteMemberModal
      v-if="showInviteModal && groupStore.currentGroup"
      :group-id="groupId"
      :group-name="groupStore.currentGroup.name"
      @close="showInviteModal = false"
      @invited="onInvited"
    />

    <SettlementModal
      v-if="showSettlementModal && groupStore.currentGroup"
      :group-id="groupId"
      :members="groupStore.members"
      :currency="groupStore.currentGroup.currency"
      @close="showSettlementModal = false"
      @saved="onSettlementSaved"
    />

    <Teleport to="body">
      <div
        v-if="
          userPlanStore.isFree &&
          ((activeTab === 'expenses' && showExpenseHistoryUnlock) ||
            (activeTab === 'activity' && showActivityHistoryUnlock))
        "
        class="pointer-events-none fixed inset-x-0 bottom-24 z-[35] flex justify-center px-4 md:bottom-10"
      >
        <div
          class="pointer-events-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-violet-200/70 bg-white/90 px-5 py-4 text-center shadow-xl backdrop-blur-md"
        >
          <p class="text-sm font-bold text-neutral-900">Unlock full history</p>
          <p class="text-xs text-neutral-600">
            Pro keeps every expense and payment visible—upgrade when you’re ready.
          </p>
          <button
            type="button"
            class="mt-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-95"
            @click="userPlanStore.openUpgradeModal()"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
