<script setup lang="ts">
const BUCKET = 'receipts'
const SIGNED_URL_EXPIRY_SEC = 3600

const props = withDefaults(
  defineProps<{
    groupId: string
    expenseId: string
    /** Storage path (group_id/expense_id/filename) or null */
    modelValue?: string | null
    disabled?: boolean
    /** Free plan: block upload/replace/remove; opens upgrade instead */
    receiptLocked?: boolean
  }>(),
  { modelValue: null, disabled: false, receiptLocked: false }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  uploaded: [path: string]
  removed: []
  error: [message: string]
}>()

const { $supabase } = useNuxtApp()
const userPlanStore = useUserPlanStore()

const loading = ref(false)
const displayUrl = ref<string | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const accept = 'image/jpeg,image/png,image/webp,image/gif,application/pdf'
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

async function refreshSignedUrl(path: string) {
  if (!$supabase) return
  const { data, error } = await $supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SEC)
  if (error) {
    displayUrl.value = null
    return
  }
  displayUrl.value = data?.signedUrl ?? null
}

watch(
  () => props.modelValue,
  async (path) => {
    if (!path) {
      displayUrl.value = null
      return
    }
    await refreshSignedUrl(path)
  },
  { immediate: true }
)

function sanitizeFilename(name: string): string {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''
  const base = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
  return base + ext
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !$supabase) return

  if (!allowedTypes.includes(file.type)) {
    emit('error', 'Allowed: images (JPEG, PNG, WebP, GIF) and PDF.')
    input.value = ''
    return
  }

  const filename = sanitizeFilename(file.name)
  const path = `${props.groupId}/${props.expenseId}/${filename}`

  loading.value = true
  emit('error', '')

  const { error } = await $supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })

  loading.value = false
  input.value = ''

  if (error) {
    emit('error', error.message ?? 'Upload failed.')
    return
  }

  emit('update:modelValue', path)
  emit('uploaded', path)
  await refreshSignedUrl(path)
}

function triggerInput() {
  if (props.receiptLocked) {
    userPlanStore.openUpgradeModal()
    return
  }
  if (props.disabled || loading.value) return
  inputRef.value?.click()
}

async function remove() {
  if (props.receiptLocked) {
    userPlanStore.openUpgradeModal()
    return
  }
  if (!props.modelValue || !$supabase || props.disabled) return
  loading.value = true
  await $supabase.storage.from(BUCKET).remove([props.modelValue])
  loading.value = false
  displayUrl.value = null
  emit('update:modelValue', null)
  emit('removed')
}

const isPdf = computed(() => {
  const p = props.modelValue ?? ''
  return p.toLowerCase().endsWith('.pdf')
})
</script>

<template>
  <div class="space-y-2">
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="hidden"
      :disabled="disabled"
      @change="onFileChange"
    />

    <div v-if="modelValue" class="flex flex-wrap items-center gap-2">
      <div
        class="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm"
      >
        <template v-if="displayUrl">
          <a
            v-if="!isPdf"
            :href="displayUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
          >
            View receipt
          </a>
          <a
            v-else
            :href="displayUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
          >
            View PDF
          </a>
        </template>
        <span v-else class="text-muted-foreground">Receipt attached</span>
        <button
          type="button"
          class="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          :disabled="disabled || loading"
          aria-label="Remove receipt"
          @click="remove"
        >
          ×
        </button>
      </div>
      <button
        type="button"
        class="text-sm text-muted-foreground underline hover:text-foreground disabled:opacity-50"
        :disabled="disabled || loading"
        @click="triggerInput"
      >
        {{ receiptLocked ? 'Replace (Pro)' : loading ? 'Uploading...' : 'Replace' }}
      </button>
    </div>

    <button
      v-else
      type="button"
      class="inline-flex h-9 items-center gap-2 rounded-md border border-dashed border-input bg-transparent px-3 py-1 text-sm font-medium hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      :disabled="disabled || loading"
      @click="triggerInput"
    >
      {{
        receiptLocked
          ? 'Upload receipt (Pro)'
          : loading
            ? 'Uploading...'
            : 'Upload receipt (image or PDF)'
      }}
    </button>
  </div>
</template>
