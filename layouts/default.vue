<script setup lang="ts">
import { ArrowLeft, LayoutGrid, Home, Users, MessageCircle, Bell, User } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

const backTo = computed(() => {
  const name = route.name?.toString() ?? ''
  if (name?.includes('groups-id')) return '/groups'
  if (name === 'profile' || name === 'groups') return '/dashboard'
  return '/dashboard'
})
const showBack = computed(() => backTo.value !== '/dashboard')

const hideMenu = computed(() => {
  const name = route.name?.toString() ?? ''
  return name !== 'dashboard'
})

const headerTitle = computed(() => {
  const name = route.name?.toString() ?? ''
  if (name === 'dashboard') return 'Billspllit'
  if (name === 'profile') return 'Profile'
  if (name === 'groups') return 'Groups'
  if (name?.includes('groups-id')) return (route.meta?.title as string) ?? 'Split Now'
  return 'Billspllit'
})

const isHome = computed(() => route.path === '/dashboard')
const isGroups = computed(() => route.path === '/groups')
const isProfile = computed(() => route.path === '/profile')
</script>

<template>
  <div
    class="flex min-h-screen w-full max-w-[100vw] flex-col bg-background min-[430px]:mx-auto min-[430px]:max-w-[430px] min-[430px]:shadow-[0_0_0_1px_hsl(var(--border))]"
  >
    <!-- Top bar: optional back + title -->
    <header class="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur">
      <div class="flex w-20 items-center justify-start">
        <NuxtLink
          v-if="showBack"
          :to="backTo"
          class="flex items-center justify-center rounded-full p-2 text-foreground hover:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft class="size-5" />
        </NuxtLink>
        <span v-else />
      </div>
      <h1 class="text-lg font-bold tracking-tight text-foreground">
        {{ headerTitle }}
      </h1>
      <div class="flex w-20 items-center justify-end">
        <button
          v-if="authStore.isAuthenticated && !hideMenu"
          type="button"
          class="flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted"
          aria-label="Menu"
        >
          <LayoutGrid class="size-5" />
        </button>
        <span v-else />
      </div>
    </header>

    <main class="min-h-[calc(100vh-7rem)] flex-1 overflow-x-hidden px-4 pb-24 pt-4">
      <slot />
    </main>

    <!-- Bottom navigation (mobile) -->
    <ClientOnly>
      <nav
        v-if="!authStore.loading && authStore.isAuthenticated"
        class="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-border bg-card shadow-card max-[430px]:left-0 max-[430px]:right-0 mx-auto min-[430px]:max-w-[430px]"
      >
        <NuxtLink
          to="/dashboard"
          class="flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 transition-colors"
          :class="isHome ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'"
        >
          <Home class="size-5" />
          <span class="text-xs font-medium">Home</span>
        </NuxtLink>
        <NuxtLink
          to="/groups"
          class="flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
          :class="isGroups ? 'bg-primary/20 text-primary' : ''"
        >
          <Users class="size-5" />
          <span class="text-xs font-medium">Groups</span>
        </NuxtLink>
        <div class="flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-muted-foreground opacity-70" aria-hidden="true">
          <MessageCircle class="size-5" />
          <span class="text-xs font-medium">Chat</span>
        </div>
        <div class="flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-muted-foreground opacity-70" aria-hidden="true">
          <Bell class="size-5" />
          <span class="text-xs font-medium">Alerts</span>
        </div>
        <NuxtLink
          to="/profile"
          class="flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 transition-colors"
          :class="isProfile ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'"
        >
          <User class="size-5" />
          <span class="text-xs font-medium">Profile</span>
        </NuxtLink>
      </nav>
    </ClientOnly>
  </div>
</template>
