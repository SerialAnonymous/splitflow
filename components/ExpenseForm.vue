<script setup lang="ts">
import type { GroupMember } from '~/types/group'
import type { ExpenseWithParticipants, ParticipantSplit } from '~/types/expense'
import { EXPENSE_SPLIT_TYPES } from '~/types/expense'

export interface ExpensePrefill {
  description?: string
  amount?: number
  date?: string
}

const props = withDefaults(
  defineProps<{
    groupId: string
    members: GroupMember[]
    currency: string
    mode: 'add' | 'edit'
    initialExpense?: ExpenseWithParticipants | null
    /** Prefill for add mode (e.g. from invoice scan) */
    prefill?: ExpensePrefill | null
    /** When true, render form body only (parent supplies overlay + glass shell). */
    embedded?: boolean
  }>(),
  { embedded: false }
)

const emit = defineEmits<{
  close: []
  saved: []
}>()

const expenseStore = useExpenseStore()

const description = ref('')
const amount = ref<number>(0)
const paidBy = ref('')
const date = ref('')
const category = ref('')
const notes = ref('')
const splitType = ref<string>('equal')
const selectedUserIds = ref<string[]>([])
const customAmounts = ref<Record<string, number>>({})
const customPercentages = ref<Record<string, number>>({})
const customShares = ref<Record<string, number>>({})
const receiptUrl = ref<string | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)

const activeMembers = computed(() => props.members.filter((m) => m.user_id && (m.status === 'active' || !m.status)))

function initFromExpense() {
  if (!props.initialExpense) return
  const e = props.initialExpense
  description.value = e.description
  amount.value = Number(e.amount)
  paidBy.value = e.paid_by
  date.value = e.date
  category.value = e.category ?? ''
  notes.value = e.notes ?? ''
  splitType.value = e.split_type === 'custom' ? 'unequal' : e.split_type
  selectedUserIds.value = e.participants?.map((p) => p.user_id) ?? []
  receiptUrl.value = e.receipt_url ?? null
  customAmounts.value = {}
  customPercentages.value = {}
  customShares.value = {}
  e.participants?.forEach((p) => {
    customAmounts.value[p.user_id] = Number(p.amount)
    if (p.percentage != null) customPercentages.value[p.user_id] = Number(p.percentage)
    if (p.shares != null) customShares.value[p.user_id] = Number(p.shares)
  })
}

onMounted(() => {
  if (props.mode === 'edit' && props.initialExpense) {
    initFromExpense()
    return
  }
  const today = new Date().toISOString().slice(0, 10)
  date.value = today
  if (activeMembers.value.length > 0 && !paidBy.value) paidBy.value = activeMembers.value[0].user_id
  if (props.mode === 'add' && props.prefill) {
    if (props.prefill.description != null) description.value = props.prefill.description
    if (props.prefill.amount != null && props.prefill.amount > 0) amount.value = props.prefill.amount
    if (props.prefill.date != null) date.value = props.prefill.date
  }
})

function buildParticipantSplits(): ParticipantSplit[] {
  const total = amount.value
  const ids = selectedUserIds.value
  if (ids.length === 0) return []

  if (splitType.value === 'equal') {
    const amt = Math.round((total / ids.length) * 100) / 100
    return ids.map((user_id) => ({ user_id, amount: amt }))
  }
  if (splitType.value === 'unequal') {
    return ids.map((user_id) => ({
      user_id,
      amount: customAmounts.value[user_id] ?? 0,
    }))
  }
  if (splitType.value === 'percentage') {
    return ids.map((user_id) => {
      const pct = customPercentages.value[user_id] ?? 0
      return { user_id, amount: Math.round((total * pct) / 100 * 100) / 100, percentage: pct }
    })
  }
  if (splitType.value === 'shares') {
    const totalShares = ids.reduce((s, id) => s + (customShares.value[id] ?? 0), 0)
    if (totalShares <= 0) return ids.map((user_id) => ({ user_id, amount: 0, shares: 0 }))
    return ids.map((user_id) => {
      const sh = customShares.value[user_id] ?? 0
      const amt = Math.round((total * sh) / totalShares * 100) / 100
      return { user_id, amount: amt, shares: sh }
    })
  }
  return ids.map((user_id) => ({ user_id, amount: total / ids.length }))
}

function validate(): string | null {
  if (!description.value.trim()) return 'Description is required.'
  if (amount.value <= 0) return 'Amount must be greater than 0.'
  if (!paidBy.value) return 'Select who paid.'
  if (selectedUserIds.value.length === 0) return 'Select at least one participant.'
  if (splitType.value === 'unequal') {
    const sum = selectedUserIds.value.reduce((s, id) => s + (customAmounts.value[id] ?? 0), 0)
    if (Math.abs(sum - amount.value) > 0.02) return `Amounts must sum to ${amount.value.toFixed(2)}.`
  }
  if (splitType.value === 'percentage') {
    const sum = selectedUserIds.value.reduce((s, id) => s + (customPercentages.value[id] ?? 0), 0)
    if (Math.abs(sum - 100) > 0.1) return 'Percentages must sum to 100.'
  }
  return null
}

async function onSubmit() {
  error.value = null
  const err = validate()
  if (err) {
    error.value = err
    return
  }
  loading.value = true
  const payload = {
    description: description.value.trim(),
    amount: amount.value,
    paid_by: paidBy.value,
    date: date.value,
    category: category.value.trim() || null,
    notes: notes.value.trim() || null,
    split_type: splitType.value,
    participantSplits: buildParticipantSplits(),
  }
  if (props.mode === 'edit' && props.initialExpense) {
    const result = await expenseStore.editExpense(props.initialExpense.id, payload)
    loading.value = false
    if (result.error) {
      error.value = result.error.message ?? 'Failed to update expense.'
      return
    }
  } else {
    const result = await expenseStore.addExpense(props.groupId, payload)
    loading.value = false
    if (result.error) {
      error.value = result.error.message ?? 'Failed to add expense.'
      return
    }
  }
  emit('saved')
  emit('close')
}

function toggleParticipant(userId: string) {
  const idx = selectedUserIds.value.indexOf(userId)
  if (idx >= 0) selectedUserIds.value = selectedUserIds.value.filter((id) => id !== userId)
  else selectedUserIds.value = [...selectedUserIds.value, userId]
}

function onReceiptUpdate(v: string | null) {
  receiptUrl.value = v
  if (props.initialExpense) expenseStore.updateExpenseReceipt(props.initialExpense.id, v)
}
</script>

<template>
  <!-- Standalone modal -->
  <div
    v-if="!embedded"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    @click.self="emit('close')"
  >
    <Card class="w-full max-w-lg" @click.stop>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{{ mode === 'edit' ? 'Edit expense' : 'Add expense' }}</CardTitle>
        <button type="button" class="rounded-sm opacity-70 hover:opacity-100" aria-label="Close" @click="emit('close')">
          <span class="text-xl">×</span>
        </button>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div v-if="error" class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ error }}
          </div>

          <div class="space-y-2">
            <Label for="exp-desc">Description</Label>
            <Input id="exp-desc" v-model="description" placeholder="e.g. Dinner" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="exp-amount">Amount ({{ currency }})</Label>
              <Input id="exp-amount" v-model.number="amount" type="number" step="0.01" min="0" required />
            </div>
            <div class="space-y-2">
              <Label for="exp-date">Date</Label>
              <Input id="exp-date" v-model="date" type="date" required />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="exp-paid">Paid by</Label>
            <select
              id="exp-paid"
              v-model="paidBy"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option v-for="m in activeMembers" :key="m.user_id" :value="m.user_id">
                {{ m.user?.name || m.user?.email || m.user_id }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="exp-category">Category (optional)</Label>
            <Input id="exp-category" v-model="category" placeholder="Food, Transport, etc." />
          </div>

          <div class="space-y-2">
            <Label for="exp-notes">Notes (optional)</Label>
            <Input id="exp-notes" v-model="notes" placeholder="Notes" />
          </div>

          <div v-if="mode === 'edit' && initialExpense" class="space-y-2">
            <Label>Receipt</Label>
            <ReceiptUploader
              :group-id="groupId"
              :expense-id="initialExpense.id"
              :model-value="receiptUrl"
              :disabled="loading"
              @update:model-value="onReceiptUpdate"
              @error="(msg) => { error = msg }"
            />
          </div>

          <div class="space-y-2">
            <Label>Split type</Label>
            <select
              v-model="splitType"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option v-for="t in EXPENSE_SPLIT_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label>Participants</Label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="m in activeMembers"
                :key="m.user_id"
                class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                :class="selectedUserIds.includes(m.user_id) ? 'border-primary bg-primary/10' : 'border-input'"
              >
                <input
                  type="checkbox"
                  :checked="selectedUserIds.includes(m.user_id)"
                  @change="toggleParticipant(m.user_id)"
                />
                {{ m.user?.name || m.user?.email || 'Member' }}
              </label>
            </div>
          </div>

          <template v-if="splitType === 'unequal' && selectedUserIds.length">
            <Label>Amount per person ({{ currency }})</Label>
            <div class="space-y-2">
              <div
                v-for="userId in selectedUserIds"
                :key="userId"
                class="flex items-center gap-2"
              >
                <span class="w-32 truncate text-sm">{{
                  activeMembers.find((m) => m.user_id === userId)?.user?.name || activeMembers.find((m) => m.user_id === userId)?.user?.email || 'User'
                }}</span>
                <Input
                  v-model.number="customAmounts[userId]"
                  type="number"
                  step="0.01"
                  min="0"
                  class="flex-1"
                />
              </div>
            </div>
          </template>
          <template v-if="splitType === 'percentage' && selectedUserIds.length">
            <Label>Percentage per person (%)</Label>
            <div class="space-y-2">
              <div
                v-for="userId in selectedUserIds"
                :key="userId"
                class="flex items-center gap-2"
              >
                <span class="w-32 truncate text-sm">{{
                  activeMembers.find((m) => m.user_id === userId)?.user?.name || activeMembers.find((m) => m.user_id === userId)?.user?.email || 'User'
                }}</span>
                <Input
                  v-model.number="customPercentages[userId]"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="flex-1"
                />
              </div>
            </div>
          </template>
          <template v-if="splitType === 'shares' && selectedUserIds.length">
            <Label>Shares per person</Label>
            <div class="space-y-2">
              <div
                v-for="userId in selectedUserIds"
                :key="userId"
                class="flex items-center gap-2"
              >
                <span class="w-32 truncate text-sm">{{
                  activeMembers.find((m) => m.user_id === userId)?.user?.name || activeMembers.find((m) => m.user_id === userId)?.user?.email || 'User'
                }}</span>
                <Input
                  v-model.number="customShares[userId]"
                  type="number"
                  min="0"
                  step="1"
                  class="flex-1"
                />
              </div>
            </div>
          </template>

          <div class="flex gap-2 pt-4">
            <button
              type="button"
              class="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              :disabled="loading"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              :disabled="loading"
            >
              {{ loading ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- Embedded in glass modal (no outer scrim) -->
  <div v-else class="w-full max-w-lg" @click.stop>
    <div class="flex flex-row items-center justify-between border-b border-white/50 px-6 pb-4 pt-2">
      <h2 class="text-lg font-bold text-neutral-900">
        {{ mode === 'edit' ? 'Edit expense' : 'Add expense' }}
      </h2>
      <button type="button" class="rounded-full p-2 text-neutral-500 hover:bg-white/60" aria-label="Close" @click="emit('close')">
        <span class="text-xl leading-none">×</span>
      </button>
    </div>
    <div class="space-y-4 px-6 py-5">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div v-if="error" class="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </div>

        <div class="space-y-2">
          <Label for="exp-desc-emb">Description</Label>
          <Input id="exp-desc-emb" v-model="description" placeholder="e.g. Dinner" required class="rounded-xl border-white/60 bg-white/50" />
        </div>

        <div class="space-y-2">
          <Label for="exp-amount-emb">Amount</Label>
          <input
            id="exp-amount-emb"
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-4 text-3xl font-bold tracking-tight text-neutral-900 shadow-inner outline-none transition focus:ring-2 focus:ring-pink-300/50"
            :placeholder="currency"
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="exp-date-emb">Date</Label>
            <Input id="exp-date-emb" v-model="date" type="date" required class="rounded-xl border-white/60 bg-white/50" />
          </div>
          <div class="space-y-2">
            <Label for="exp-paid-emb">Paid by</Label>
            <select
              id="exp-paid-emb"
              v-model="paidBy"
              class="flex h-10 w-full rounded-xl border border-white/60 bg-white/50 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-300/50"
            >
              <option v-for="m in activeMembers" :key="m.user_id" :value="m.user_id">
                {{ m.user?.name || m.user?.email || m.user_id }}
              </option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="exp-category-emb">Category (optional)</Label>
          <Input id="exp-category-emb" v-model="category" placeholder="Food, Transport…" class="rounded-xl border-white/60 bg-white/50" />
        </div>

        <div class="space-y-2">
          <Label for="exp-notes-emb">Notes (optional)</Label>
          <Input id="exp-notes-emb" v-model="notes" placeholder="Notes" class="rounded-xl border-white/60 bg-white/50" />
        </div>

        <div v-if="mode === 'edit' && initialExpense" class="space-y-2">
          <Label>Receipt</Label>
          <ReceiptUploader
            :group-id="groupId"
            :expense-id="initialExpense.id"
            :model-value="receiptUrl"
            :disabled="loading"
            @update:model-value="onReceiptUpdate"
            @error="(msg) => { error = msg }"
          />
        </div>

        <div class="space-y-2">
          <span class="text-sm font-medium text-neutral-800">Split type</span>
          <div class="flex flex-wrap gap-2 rounded-2xl border border-white/50 bg-white/30 p-1">
            <button
              v-for="t in EXPENSE_SPLIT_TYPES"
              :key="t"
              type="button"
              class="rounded-xl px-3 py-2 text-xs font-semibold capitalize transition duration-200 md:text-sm"
              :class="splitType === t ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-white/50'"
              @click="splitType = t"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <span class="text-sm font-medium text-neutral-800">Participants</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="m in activeMembers"
              :key="m.user_id"
              type="button"
              class="rounded-full border px-3 py-1.5 text-sm font-medium transition duration-200"
              :class="
                selectedUserIds.includes(m.user_id)
                  ? 'border-pink-300 bg-pink-100/80 text-neutral-900'
                  : 'border-white/60 bg-white/40 text-neutral-600 hover:border-pink-200'
              "
              @click="toggleParticipant(m.user_id)"
            >
              {{ m.user?.name || m.user?.email || 'Member' }}
            </button>
          </div>
        </div>

        <template v-if="splitType === 'unequal' && selectedUserIds.length">
          <Label>Amount per person ({{ currency }})</Label>
          <div class="space-y-2">
            <div v-for="userId in selectedUserIds" :key="userId" class="flex items-center gap-2">
              <span class="w-32 truncate text-sm">{{
                activeMembers.find((m) => m.user_id === userId)?.user?.name || activeMembers.find((m) => m.user_id === userId)?.user?.email || 'User'
              }}</span>
              <Input v-model.number="customAmounts[userId]" type="number" step="0.01" min="0" class="flex-1 rounded-xl border-white/60 bg-white/50" />
            </div>
          </div>
        </template>
        <template v-if="splitType === 'percentage' && selectedUserIds.length">
          <Label>Percentage per person (%)</Label>
          <div class="space-y-2">
            <div v-for="userId in selectedUserIds" :key="userId" class="flex items-center gap-2">
              <span class="w-32 truncate text-sm">{{
                activeMembers.find((m) => m.user_id === userId)?.user?.name || activeMembers.find((m) => m.user_id === userId)?.user?.email || 'User'
              }}</span>
              <Input v-model.number="customPercentages[userId]" type="number" step="0.01" min="0" max="100" class="flex-1 rounded-xl border-white/60 bg-white/50" />
            </div>
          </div>
        </template>
        <template v-if="splitType === 'shares' && selectedUserIds.length">
          <Label>Shares per person</Label>
          <div class="space-y-2">
            <div v-for="userId in selectedUserIds" :key="userId" class="flex items-center gap-2">
              <span class="w-32 truncate text-sm">{{
                activeMembers.find((m) => m.user_id === userId)?.user?.name || activeMembers.find((m) => m.user_id === userId)?.user?.email || 'User'
              }}</span>
              <Input v-model.number="customShares[userId]" type="number" min="0" step="1" class="flex-1 rounded-xl border-white/60 bg-white/50" />
            </div>
          </div>
        </template>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-white/60 bg-white/40 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-white/70 disabled:opacity-50"
            :disabled="loading"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:brightness-105 disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Saving…' : (mode === 'edit' ? 'Update' : 'Add expense') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
