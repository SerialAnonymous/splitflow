<script setup lang="ts">
import type { ExpenseWithParticipants } from '~/types/expense'

const props = withDefaults(
  defineProps<{
    expense: ExpenseWithParticipants
    currency: string
    currentUserId: string | null
    canEdit: boolean
    /** Timeline / glass style for app shell */
    variant?: 'default' | 'glass'
  }>(),
  { variant: 'default' }
)

const emit = defineEmits<{
  edit: [expense: ExpenseWithParticipants]
  delete: [expense: ExpenseWithParticipants]
}>()

const { openReceipt } = useReceiptUrl()
</script>

<template>
  <Card v-if="props.variant === 'default'" class="transition-colors hover:bg-muted/30">
    <CardContent class="p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 flex-1">
          <p class="font-medium">{{ expense.description }}</p>
          <p class="text-sm text-muted-foreground">
            {{ expense.amount.toFixed(2) }} {{ currency }}
            <span v-if="expense.paid_by_user">
              · paid by {{ expense.paid_by_user.name || expense.paid_by_user.email }}
              <span v-if="expense.paid_by === currentUserId">(you)</span>
            </span>
          </p>
          <p class="text-xs text-muted-foreground">
            {{ new Date(expense.date).toLocaleDateString() }}
            <span v-if="expense.category"> · {{ expense.category }}</span>
          </p>
          <p v-if="expense.notes" class="mt-1 text-xs text-muted-foreground">{{ expense.notes }}</p>
          <button
            v-if="expense.receipt_url"
            type="button"
            class="mt-1 text-xs text-primary hover:underline"
            @click="openReceipt(expense.receipt_url!)"
          >
            View receipt
          </button>
          <p v-if="expense.participants?.length" class="mt-1 text-xs text-muted-foreground">
            Split: {{ expense.participants.map((p) => p.user?.name || p.user?.email || p.user_id).join(', ') }}
          </p>
        </div>
        <div v-if="canEdit" class="flex items-center gap-1">
          <button
            type="button"
            class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Edit"
            @click="emit('edit', expense)"
          >
            <span class="text-sm">Edit</span>
          </button>
          <button
            type="button"
            class="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete"
            @click="emit('delete', expense)"
          >
            <span class="text-sm">Delete</span>
          </button>
        </div>
      </div>
    </CardContent>
  </Card>
  <div
    v-else
    class="rounded-2xl border border-white/55 bg-white/55 p-4 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/70 hover:shadow-[0_16px_40px_-16px_rgba(124,58,237,0.12)] md:rounded-[1.35rem]"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-neutral-900">{{ expense.description }}</p>
        <p class="text-sm text-neutral-600">
          {{ expense.amount.toFixed(2) }} {{ currency }}
          <span v-if="expense.paid_by_user">
            · paid by {{ expense.paid_by_user.name || expense.paid_by_user.email }}
            <span v-if="expense.paid_by === currentUserId">(you)</span>
          </span>
        </p>
        <p class="text-xs text-neutral-500">
          {{ new Date(expense.date).toLocaleDateString() }}
          <span v-if="expense.category"> · {{ expense.category }}</span>
        </p>
        <p v-if="expense.notes" class="mt-1 text-xs text-neutral-500">{{ expense.notes }}</p>
        <button
          v-if="expense.receipt_url"
          type="button"
          class="mt-1 text-xs font-medium text-violet-700 hover:underline"
          @click="openReceipt(expense.receipt_url!)"
        >
          View receipt
        </button>
        <p v-if="expense.participants?.length" class="mt-1 text-xs text-neutral-500">
          Split: {{ expense.participants.map((p) => p.user?.name || p.user?.email || p.user_id).join(', ') }}
        </p>
      </div>
      <div v-if="canEdit" class="flex items-center gap-1">
        <button
          type="button"
          class="rounded-lg px-2 py-1.5 text-sm text-neutral-600 transition hover:bg-white/80 hover:text-neutral-900"
          aria-label="Edit"
          @click="emit('edit', expense)"
        >
          Edit
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-1.5 text-sm text-rose-600 transition hover:bg-rose-50"
          aria-label="Delete"
          @click="emit('delete', expense)"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
