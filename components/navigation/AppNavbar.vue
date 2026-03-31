<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { Bell, ChevronDown, LayoutDashboard, LogOut, Settings, Users } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const groupStore = useGroupStore()
const userPlanStore = useUserPlanStore()

const groupMenuOpen = ref(false)
const avatarMenuOpen = ref(false)

onMounted(() => {
  groupStore.getUserGroups()
})

const groups = computed(() => groupStore.groups)

const currentGroupId = computed(() => {
  const m = route.path.match(/^\/groups\/([^/]+)/)
  return m ? m[1] : null
})

const currentGroupName = computed(() => {
  if (!currentGroupId.value) return null
  const g = groups.value.find((x) => x.id === currentGroupId.value)
  return g?.name ?? groupStore.currentGroup?.name ?? null
})

const pageTitle = computed(() => {
  if (route.path === '/dashboard') return 'Overview'
  if (route.path === '/groups' && route.name !== 'groups-id') return 'Your groups'
  if (route.path.startsWith('/groups/') && currentGroupName.value) return currentGroupName.value
  if (route.path === '/analytics') return 'Analytics'
  if (route.path === '/settings') return 'Settings'
  return 'SplitFlow'
})

function goGroup(id: string) {
  groupMenuOpen.value = false
  router.push(`/groups/${id}`)
}

async function logout() {
  avatarMenuOpen.value = false
  await authStore.signOut()
  await router.push('/login')
}

const groupSwitchRef = ref<HTMLElement | null>(null)
const avatarWrapRef = ref<HTMLElement | null>(null)
onClickOutside(groupSwitchRef, () => {
  groupMenuOpen.value = false
})
onClickOutside(avatarWrapRef, () => {
  avatarMenuOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-50 px-4 pt-4 md:px-8">
    <div
      class="mx-auto flex max-w-6xl items-center gap-3 rounded-[1.75rem] border border-white/70 bg-white/45 px-3 py-2.5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12),0_4px_16px_-8px_rgba(255,170,180,0.15)] backdrop-blur-xl md:gap-4 md:px-5 md:py-3"
    >
      <!-- Left: logo + group switcher -->
      <div class="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <NuxtLink
          to="/dashboard"
          class="shrink-0 text-base font-bold tracking-tight text-neutral-900 md:text-lg"
        >
          SplitFlow.
        </NuxtLink>

        <div ref="groupSwitchRef" class="relative hidden sm:block">
          <button
            type="button"
            class="flex max-w-[200px] items-center gap-1.5 rounded-full border border-white/80 bg-white/50 px-3 py-1.5 text-left text-xs font-medium text-neutral-800 shadow-sm backdrop-blur-sm transition duration-250 hover:bg-white/80 md:max-w-[240px] md:text-sm"
            aria-haspopup="listbox"
            :aria-expanded="groupMenuOpen"
            @click.stop="groupMenuOpen = !groupMenuOpen"
          >
            <Users class="size-3.5 shrink-0 text-neutral-500 md:size-4" />
            <span class="truncate">{{ currentGroupName ?? 'All groups' }}</span>
            <ChevronDown class="size-3.5 shrink-0 text-neutral-400" />
          </button>
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ul
              v-if="groupMenuOpen"
              class="absolute left-0 top-full z-[60] mt-2 max-h-72 min-w-[220px] overflow-auto rounded-2xl border border-white/60 bg-white/90 py-2 shadow-xl backdrop-blur-xl"
              role="listbox"
              @click.stop
            >
              <li>
                <NuxtLink
                  to="/groups"
                  class="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-pink-50/80"
                  @click="groupMenuOpen = false"
                >
                  Browse all groups
                </NuxtLink>
              </li>
              <li v-for="g in groups" :key="g.id">
                <button
                  type="button"
                  class="block w-full px-4 py-2.5 text-left text-sm hover:bg-pink-50/80"
                  :class="g.id === currentGroupId ? 'font-semibold text-neutral-900' : 'text-neutral-600'"
                  @click="goGroup(g.id)"
                >
                  {{ g.name }}
                </button>
              </li>
              <li v-if="!groups.length" class="px-4 py-3 text-sm text-neutral-500">
                No groups yet
              </li>
            </ul>
          </Transition>
        </div>
      </div>

      <!-- Center: title -->
      <div class="hidden min-w-0 flex-[1.2] justify-center text-center md:flex">
        <h1 class="truncate text-sm font-semibold tracking-tight text-neutral-800 md:text-base">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- Right: quick nav + bell + avatar -->
      <div class="flex flex-1 items-center justify-end gap-1 md:gap-2">
        <NuxtLink
          to="/dashboard"
          class="hidden rounded-full p-2 text-neutral-600 transition duration-250 hover:bg-white/60 hover:text-neutral-900 lg:inline-flex"
          aria-label="Dashboard"
        >
          <LayoutDashboard class="size-5" />
        </NuxtLink>
        <NuxtLink
          to="/groups"
          class="hidden rounded-full p-2 text-neutral-600 transition duration-250 hover:bg-white/60 hover:text-neutral-900 lg:inline-flex"
          aria-label="Groups"
        >
          <Users class="size-5" />
        </NuxtLink>
        <NuxtLink
          to="/analytics"
          class="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-600 transition duration-250 hover:bg-white/60 hover:text-neutral-900 xl:inline-flex"
        >
          Analytics
        </NuxtLink>

        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="inline-flex max-w-[6.5rem] shrink-0 truncate rounded-full border border-white/80 bg-white/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-800 shadow-sm backdrop-blur-sm transition duration-250 hover:bg-white/75 sm:max-w-none sm:px-3 sm:text-xs"
          @click="userPlanStore.isFree ? userPlanStore.openUpgradeModal() : navigateTo('/settings')"
        >
          {{ userPlanStore.planLabel }} plan
        </button>

        <button
          type="button"
          class="rounded-full p-2 text-neutral-500 transition duration-250 hover:bg-white/60 hover:text-neutral-800"
          aria-label="Notifications"
        >
          <Bell class="size-5" />
        </button>

        <div ref="avatarWrapRef" class="relative">
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-pink-100 to-violet-100 text-sm font-bold text-neutral-800 shadow-sm transition duration-250 hover:scale-105 md:size-10"
            :aria-expanded="avatarMenuOpen"
            aria-label="Account menu"
            @click.stop="avatarMenuOpen = !avatarMenuOpen"
          >
            {{ (authStore.userEmail ?? '?')[0].toUpperCase() }}
          </button>
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="avatarMenuOpen"
              class="absolute right-0 top-full z-[60] mt-2 w-48 rounded-2xl border border-white/60 bg-white/95 py-2 shadow-xl backdrop-blur-xl"
              @click.stop
            >
              <NuxtLink
                to="/settings"
                class="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-pink-50/80"
                @click="avatarMenuOpen = false"
              >
                <Settings class="size-4" />
                Settings
              </NuxtLink>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80"
                @click="logout"
              >
                <LogOut class="size-4" />
                Log out
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Mobile title under bar -->
    <p class="mx-auto mt-3 max-w-6xl truncate px-1 text-center text-sm font-semibold text-neutral-800 md:hidden">
      {{ pageTitle }}
    </p>
  </header>
</template>
