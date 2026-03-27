<script setup lang="ts">
import type { ParsedInvoice } from '~/utils/smartInvoiceParser'

const emit = defineEmits<{
  close: []
  confirm: [data: ParsedInvoice]
}>()

const step = ref<'capture' | 'parsing' | 'confirm'>('capture')
const error = ref<string | null>(null)
const progress = ref(0)
const parsed = ref<ParsedInvoice | null>(null)
const imagePreview = ref<string | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const galleryInputRef = ref<HTMLInputElement | null>(null)

const description = ref('')
const amount = ref<number>(0)
const date = ref('')

function openCamera() {
  cameraInputRef.value?.click()
}

function openGallery() {
  galleryInputRef.value?.click()
}

function formatDateForInput(iso: string) {
  return iso.slice(0, 10)
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !file.type.startsWith('image/')) {
    error.value = 'Please choose an image (JPEG, PNG, or WebP).'
    return
  }

  error.value = null
  imagePreview.value = URL.createObjectURL(file)
  step.value = 'parsing'
  progress.value = 0

  try {
    const Tesseract = (await import('tesseract.js')).default
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') progress.value = Math.round(m.progress * 100)
      },
    })
    const { parseInvoiceSmart } = await import('~/utils/smartInvoiceParser')
    const result = parseInvoiceSmart(data.text)
    parsed.value = result
    description.value = result.description
    amount.value = result.amount
    date.value = formatDateForInput(result.date)
    step.value = 'confirm'
  } catch (e: any) {
    error.value = e?.message ?? 'Could not read the invoice. Try a clearer image.'
    step.value = 'capture'
  } finally {
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
}

function onConfirm() {
  emit('confirm', {
    description: description.value.trim() || 'Invoice',
    amount: amount.value,
    date: date.value || formatDateForInput(new Date().toISOString()),
  })
  emit('close')
}

function onBack() {
  step.value = 'capture'
  parsed.value = null
  error.value = null
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-lg rounded-2xl bg-card shadow-card"
      @click.stop
    >
      <div class="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 class="text-lg font-bold text-foreground">Add via invoice</h2>
        <button
          type="button"
          class="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="p-4">
        <!-- Step 1: Capture / upload -->
        <template v-if="step === 'capture'">
          <p class="text-sm text-muted-foreground">
            Scan or upload a photo of your invoice. We'll try to fill the amount, date, and description.
          </p>
          <div v-if="error" class="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ error }}
          </div>
          <input
            ref="cameraInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            capture="environment"
            @change="onFileChange"
          >
          <input
            ref="galleryInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="onFileChange"
          >
          <div class="mt-4 flex flex-col gap-3">
            <button
              type="button"
              class="w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow"
              @click="openCamera"
            >
              Take photo
            </button>
            <button
              type="button"
              class="w-full rounded-xl border border-input bg-card py-3 text-base font-medium hover:bg-muted"
              @click="openGallery"
            >
              Choose from gallery
            </button>
            <button
              type="button"
              class="w-full rounded-xl border border-input py-2.5 text-sm font-medium hover:bg-muted"
              @click="emit('close')"
            >
              Cancel
            </button>
          </div>
        </template>

        <!-- Step 2: Parsing -->
        <template v-else-if="step === 'parsing'">
          <div class="flex flex-col items-center justify-center py-8">
            <p class="text-sm text-muted-foreground">Reading invoice...</p>
            <div class="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                class="h-full bg-primary transition-all duration-300"
                :style="{ width: `${progress}%` }"
              />
            </div>
          </div>
        </template>

        <!-- Step 3: Confirm & edit -->
        <template v-else-if="step === 'confirm'">
          <p class="text-sm text-muted-foreground">Review and edit the details, then choose participants.</p>
          <div v-if="error" class="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ error }}
          </div>
          <div class="mt-4 space-y-4">
            <div class="space-y-2">
              <Label for="inv-desc">Description</Label>
              <Input id="inv-desc" v-model="description" placeholder="e.g. Restaurant bill" class="rounded-xl" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="inv-amount">Amount</Label>
                <Input
                  id="inv-amount"
                  v-model.number="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="rounded-xl"
                />
              </div>
              <div class="space-y-2">
                <Label for="inv-date">Date</Label>
                <Input id="inv-date" v-model="date" type="date" class="rounded-xl" />
              </div>
            </div>
          </div>
          <div class="mt-6 flex flex-col gap-3">
            <button
              type="button"
              class="w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow disabled:opacity-50"
              :disabled="amount <= 0"
              @click="onConfirm"
            >
              Continue to choose participants
            </button>
            <button
              type="button"
              class="w-full rounded-xl border border-input py-2.5 text-sm font-medium hover:bg-muted"
              @click="onBack"
            >
              Scan another
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
