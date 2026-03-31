<script setup lang="ts">
import { FREE_MAX_GROUPS } from '~/constants/freePlanLimits'

const emit = defineEmits<{
  close: []
  created: []
}>()

const name = ref('')
const description = ref('')
const currency = ref('USD')
const loading = ref(false)
const error = ref<string | null>(null)

const groupStore = useGroupStore()
const userPlanStore = useUserPlanStore()

async function onSubmit() {
  if (!name.value.trim()) {
    error.value = 'Group name is required.'
    return
  }
  if (userPlanStore.isFree && groupStore.groups.length >= FREE_MAX_GROUPS) {
    userPlanStore.openUpgradeModal()
    emit('close')
    return
  }
  error.value = null
  loading.value = true
  const { data, error: err } = await groupStore.createGroup({
    name: name.value.trim(),
    description: description.value.trim() || undefined,
    currency: currency.value,
  })
  loading.value = false
  if (err) {
    error.value = err.message ?? 'Failed to create group.'
    return
  }
  if (data) {
    name.value = ''
    description.value = ''
    currency.value = 'USD'
    emit('created')
    emit('close')
  }
}

function onOverlayClick() {
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="onOverlayClick"
  >
    <Card class="w-full max-w-md" @click.stop>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Create group</CardTitle>
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
            <Label for="group-name">Name</Label>
            <Input
              id="group-name"
              v-model="name"
              placeholder="e.g. Roommates"
              required
              :disabled="loading"
            />
          </div>
          <div class="space-y-2">
            <Label for="group-desc">Description (optional)</Label>
            <Input
              id="group-desc"
              v-model="description"
              placeholder="Short description"
              :disabled="loading"
            />
          </div>
          <div class="space-y-2">
            <Label for="group-currency">Currency</Label>
            <select
              id="group-currency"
              v-model="currency"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              :disabled="loading"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
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
              type="button"
              class="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              :disabled="loading"
              @click="onSubmit"
            >
              {{ loading ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
