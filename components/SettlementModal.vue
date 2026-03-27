<script setup lang="ts">
import type { GroupMember } from '~/types/group'

const props = defineProps<{
  groupId: string
  members: GroupMember[]
  currency: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const settlementStore = useSettlementStore()

const payer = ref('')
const receiver = ref('')
const amount = ref<number>(0)
const date = ref('')
const note = ref('')

const loading = ref(false)
const error = ref<string | null>(null)

const activeMembers = computed(() =>
  props.members.filter((m) => m.user_id && (m.status === 'active' || !m.status))
)

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  date.value = today
  if (activeMembers.value.length >= 2 && !payer.value) payer.value = activeMembers.value[0].user_id
  if (activeMembers.value.length >= 2 && !receiver.value) receiver.value = activeMembers.value[1].user_id
})

function validate(): string | null {
  if (!payer.value) return 'Select who paid.'
  if (!receiver.value) return 'Select who received.'
  if (payer.value === receiver.value) return 'Payer and receiver must be different.'
  if (amount.value <= 0) return 'Amount must be greater than 0.'
  if (!date.value) return 'Date is required.'
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
  const { error: resError } = await settlementStore.recordSettlement(props.groupId, {
    payer: payer.value,
    receiver: receiver.value,
    amount: amount.value,
    date: date.value,
    note: note.value.trim() || null,
  })
  loading.value = false
  if (resError) {
    error.value = resError.message ?? 'Failed to record settlement.'
    return
  }
  emit('saved')
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="emit('close')"
  >
    <Card class="w-full max-w-md" @click.stop>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Record payment</CardTitle>
        <button
          type="button"
          class="rounded-sm opacity-70 hover:opacity-100"
          aria-label="Close"
          @click="emit('close')"
        >
          <span class="text-xl">×</span>
        </button>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div v-if="error" class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ error }}
          </div>

          <div class="space-y-2">
            <Label for="set-payer">Payer</Label>
            <select
              id="set-payer"
              v-model="payer"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              <option v-for="m in activeMembers" :key="m.user_id" :value="m.user_id">
                {{ m.user?.name || m.user?.email || m.user_id }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="set-receiver">Receiver</Label>
            <select
              id="set-receiver"
              v-model="receiver"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              <option v-for="m in activeMembers" :key="m.user_id" :value="m.user_id">
                {{ m.user?.name || m.user?.email || m.user_id }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="set-amount">Amount ({{ currency }})</Label>
              <Input
                id="set-amount"
                v-model.number="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="set-date">Date</Label>
              <Input id="set-date" v-model="date" type="date" required />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="set-note">Note (optional)</Label>
            <Input id="set-note" v-model="note" placeholder="e.g. Cash for dinner" />
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="flex-1 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              :disabled="loading"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              :disabled="loading"
            >
              {{ loading ? 'Saving...' : 'Record payment' }}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
