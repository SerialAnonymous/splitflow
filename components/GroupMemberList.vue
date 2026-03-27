<script setup lang="ts">
import type { GroupMember } from '~/types/group'

defineProps<{
  members: GroupMember[]
  currentUserId: string | null
  canManage?: boolean
}>()
</script>

<template>
  <ul class="divide-y">
    <li
      v-for="member in members"
      :key="member.id"
      class="flex items-center justify-between py-3 first:pt-0"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
        >
          {{ member.user?.name?.[0] ?? member.user?.email?.[0] ?? '?' }}
        </div>
        <div>
          <p class="font-medium">
            {{ member.user?.name ?? member.user?.email ?? 'Unknown' }}
            <span v-if="member.user_id === currentUserId" class="ml-1 text-xs text-muted-foreground">(you)</span>
          </p>
          <p v-if="member.user?.email && member.user?.name" class="text-xs text-muted-foreground">
            {{ member.user.email }}
          </p>
          <span
            class="inline-block mt-0.5 rounded bg-muted px-1.5 py-0.5 text-xs capitalize"
          >
            {{ member.role }}
          </span>
          <span
            v-if="member.status === 'pending'"
            class="ml-1 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-700 dark:text-amber-400"
          >
            Pending
          </span>
        </div>
      </div>
    </li>
  </ul>
</template>
