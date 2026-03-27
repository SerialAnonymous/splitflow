<script setup lang="ts">
import type { GroupMember } from '~/types/group'
import type { ExpenseWithParticipants } from '~/types/expense'
import type { ExpensePrefill } from '~/components/ExpenseForm.vue'

defineProps<{
  groupId: string
  members: GroupMember[]
  currency: string
  mode?: 'add' | 'edit'
  initialExpense?: ExpenseWithParticipants | null
  prefill?: ExpensePrefill | null
}>()

defineEmits<{
  close: []
  saved: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/35 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <GlassCard
        class="max-h-[min(92vh,860px)] w-full max-w-lg overflow-y-auto shadow-[0_32px_80px_-24px_rgba(124,58,237,0.2)]"
        @click.stop
      >
        <ExpenseForm
          embedded
          :group-id="groupId"
          :members="members"
          :currency="currency"
          :mode="mode ?? 'add'"
          :initial-expense="initialExpense"
          :prefill="prefill"
          @close="$emit('close')"
          @saved="$emit('saved')"
        />
      </GlassCard>
    </div>
  </Teleport>
</template>
