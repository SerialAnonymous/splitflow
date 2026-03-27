<script setup lang="ts">
import { Bell, CreditCard, LogOut, Sparkles, User } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
})

const authStore = useAuthStore()
const router = useRouter()

const sub = ref<{ plan: string; status: string } | null>(null)
const subLoading = ref(true)
const emailNotifications = ref(true)
const pushNotifications = ref(false)

onMounted(async () => {
  const { $supabase } = useNuxtApp()
  const uid = authStore.userId
  if (!$supabase || !uid) {
    subLoading.value = false
    return
  }
  const { data } = await $supabase.from('subscriptions').select('plan, status').eq('user_id', uid).maybeSingle()
  sub.value = data
  subLoading.value = false
})

async function handleLogout() {
  await authStore.signOut()
  await router.push('/login')
}

function planBadgeClass(plan: string) {
  if (plan === 'pro' || plan === 'team') {
    return 'bg-gradient-to-r from-violet-600 to-pink-500 text-white'
  }
  return 'bg-white/80 text-neutral-800 ring-1 ring-white/60'
}
</script>

<template>
  <div class="space-y-8 md:space-y-10">
    <div
      class="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/80 via-violet-50/30 to-pink-50/25 px-6 py-8 md:rounded-[2rem] md:px-10 md:py-9"
    >
      <h2 class="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">Settings</h2>
      <p class="mt-2 text-sm text-neutral-600 md:text-base">Account, plan, and preferences in one calm place.</p>
    </div>

    <GlassCard class="p-6 md:p-8">
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          class="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 text-2xl font-bold text-neutral-800 shadow-inner"
        >
          {{ (authStore.userEmail ?? '?')[0].toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1 text-center sm:text-left">
          <h3 class="text-lg font-bold text-neutral-900">Profile</h3>
          <p class="mt-1 text-sm text-neutral-600">
            {{ authStore.userEmail }}
          </p>
          <p class="mt-2 text-xs text-neutral-500">Display name editing ships soon—email is your anchor for now.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/50 px-4 py-2.5 text-sm font-semibold text-neutral-800 backdrop-blur-sm transition duration-250 hover:bg-white/80"
        >
          <User class="size-4" />
          Edit profile
        </button>
      </div>
    </GlassCard>

    <GlassCard class="p-6 md:p-8">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <CreditCard class="size-6" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-neutral-900">Subscription</h3>
            <p class="mt-1 text-sm text-neutral-600">Your workspace limits and billing status.</p>
            <div v-if="subLoading" class="mt-4 text-sm text-neutral-500">Loading plan…</div>
            <div v-else class="mt-4 flex flex-wrap items-center gap-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide"
                :class="planBadgeClass(sub?.plan ?? 'free')"
              >
                <Sparkles v-if="sub?.plan === 'pro' || sub?.plan === 'team'" class="size-3.5" />
                {{ (sub?.plan ?? 'free').toUpperCase() }}
              </span>
              <span class="text-xs text-neutral-500">Status: {{ sub?.status ?? '—' }}</span>
            </div>
          </div>
        </div>
        <NuxtLink
          to="/checkout?plan=pro"
          class="inline-flex shrink-0 items-center justify-center rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-250 hover:scale-[1.02] hover:bg-neutral-800"
        >
          Upgrade
        </NuxtLink>
      </div>
    </GlassCard>

    <GlassCard class="p-6 md:p-8">
      <div class="flex items-center gap-3">
        <Bell class="size-5 text-neutral-500" />
        <h3 class="text-lg font-bold text-neutral-900">Notifications</h3>
      </div>
      <p class="mt-2 text-sm text-neutral-600">Choose how SplitFlow nudges you—stored locally until backend prefs land.</p>
      <ul class="mt-6 space-y-4">
        <li class="flex items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/35 px-4 py-3 backdrop-blur-sm">
          <span class="text-sm font-medium text-neutral-800">Email summaries</span>
          <button
            type="button"
            role="switch"
            :aria-checked="emailNotifications"
            class="relative h-7 w-12 shrink-0 rounded-full transition duration-250"
            :class="emailNotifications ? 'bg-violet-600' : 'bg-neutral-300'"
            @click="emailNotifications = !emailNotifications"
          >
            <span
              class="absolute top-0.5 size-6 rounded-full bg-white shadow transition duration-250"
              :class="emailNotifications ? 'left-5' : 'left-0.5'"
            />
          </button>
        </li>
        <li class="flex items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/35 px-4 py-3 backdrop-blur-sm">
          <span class="text-sm font-medium text-neutral-800">Push (coming soon)</span>
          <button
            type="button"
            role="switch"
            :aria-checked="pushNotifications"
            class="relative h-7 w-12 shrink-0 rounded-full bg-neutral-300 transition duration-250"
            @click="pushNotifications = !pushNotifications"
          >
            <span
              class="absolute top-0.5 size-6 rounded-full bg-white shadow transition duration-250"
              :class="pushNotifications ? 'left-5' : 'left-0.5'"
            />
          </button>
        </li>
      </ul>
    </GlassCard>

    <GlassCard class="border-rose-200/40 bg-rose-50/25 p-6 md:p-8">
      <h3 class="text-lg font-bold text-rose-900">Danger zone</h3>
      <p class="mt-2 text-sm text-rose-800/90">Sign out on this device. Account deletion is available through support.</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl border border-rose-300/60 bg-white/60 px-5 py-2.5 text-sm font-semibold text-rose-800 transition duration-250 hover:bg-rose-100/80"
          @click="handleLogout"
        >
          <LogOut class="size-4" />
          Log out
        </button>
      </div>
    </GlassCard>
  </div>
</template>
