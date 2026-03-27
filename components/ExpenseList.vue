<script setup lang="ts">
import type { ExpenseWithParticipants } from '~/types/expense'

defineProps<{
  expenses: ExpenseWithParticipants[]
  currency: string
  currentUserId: string | null
  canEdit: boolean
}>()

const emit = defineEmits<{
  edit: [expense: ExpenseWithParticipants]
  delete: [expense: ExpenseWithParticipants]
}>()
</script>

<template>
  <ul class="space-y-3">
    <li v-for="expense in expenses" :key="expense.id">
      <ExpenseItem
        :expense="expense"
        :currency="currency"
        :current-user-id="currentUserId"
        :can-edit="canEdit"
        @edit="emit('edit', expense)"
        @delete="emit('delete', expense)"
      />
    </li>
  </ul>
</template>
