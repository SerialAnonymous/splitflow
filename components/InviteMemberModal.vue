<script setup lang="ts">
const props = defineProps<{
  groupId: string
  groupName: string
}>()

const emit = defineEmits<{
  close: []
  invited: []
}>()

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const groupStore = useGroupStore()

async function onSubmit() {
  if (!email.value.trim()) {
    error.value = 'Enter an email address.'
    return
  }
  error.value = null
  loading.value = true
  const { error: err } = await groupStore.inviteUser(props.groupId, email.value.trim())
  loading.value = false
  if (err) {
    error.value = err.message ?? 'Failed to invite.'
    return
  }
  email.value = ''
  emit('invited')
  emit('close')
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
        <CardTitle>Invite to {{ groupName }}</CardTitle>
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
            <Label for="invite-email">Email address</Label>
            <Input
              id="invite-email"
              v-model="email"
              type="email"
              placeholder="friend@example.com"
              :disabled="loading"
            />
            <p class="text-xs text-muted-foreground">
              They must already have a SplitFlow account.
            </p>
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
              {{ loading ? 'Inviting...' : 'Invite' }}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
