<script setup lang="ts">
import type { GroupWithMemberCount } from '~/types/group'

defineProps<{
  group: GroupWithMemberCount
}>()
</script>

<template>
  <NuxtLink v-if="group.id" :to="`/groups/${group.id}`" class="block">
    <Card class="rounded-2xl shadow-card transition-shadow hover:shadow-card-hover cursor-pointer">
      <CardHeader class="pb-2">
        <CardTitle class="text-base font-bold">{{ group.name }}</CardTitle>
        <CardDescription v-if="group.description" class="line-clamp-2 text-sm">
          {{ group.description }}
        </CardDescription>
      </CardHeader>
      <CardContent class="pt-0">
        <p class="text-xs text-muted-foreground">
          {{ group.currency }} · {{ group.member_count ?? 0 }} {{ (group.member_count ?? 0) === 1 ? 'member' : 'members' }}
        </p>
      </CardContent>
    </Card>
  </NuxtLink>
  <Card v-else class="rounded-2xl opacity-75 shadow-card">
    <CardHeader class="pb-2">
      <CardTitle class="text-base font-bold">{{ group.name }}</CardTitle>
    </CardHeader>
    <CardContent class="pt-0">
      <p class="text-xs text-muted-foreground">Invalid group</p>
    </CardContent>
  </Card>
</template>
