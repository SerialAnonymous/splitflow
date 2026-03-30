<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'marketing',
})

useHead({
  title: 'Sign in — SplitFlow.',
  meta: [
    {
      name: 'description',
      content: 'Sign in to SplitFlow to track shared expenses, balances, and settlements.',
    },
  ],
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const inputClass =
  'h-12 rounded-2xl border-white/80 bg-white/75 px-4 text-base text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:border-violet-300 focus-visible:ring-2 focus-visible:ring-violet-400/35 md:text-sm'

const onSubmit = async () => {
  error.value = null
  if (!email.value.trim() || !password.value) {
    error.value = 'Please enter email and password.'
    return
  }
  loading.value = true
  try {
    const result = await authStore.login(email.value.trim(), password.value)
    if (result.error) {
      error.value = result.error.message ?? 'Login failed. Please try again.'
      return
    }
    const raw = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const safe =
      raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('://') ? raw : '/dashboard'
    await router.push(safe)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[90rem]">
    <LayoutNavbar />

    <section class="relative px-4 pb-20 pt-6 md:pb-28 md:pt-10" aria-labelledby="login-heading">
      <div
        class="pointer-events-none absolute left-1/2 top-0 h-[22rem] w-[min(92vw,36rem)] -translate-x-1/2 rounded-full bg-[#FFAAB4]/18 blur-[100px]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-[#FFD2BE]/30 blur-[90px] md:right-[12%]"
        aria-hidden="true"
      />

      <div class="relative mx-auto max-w-md">
        <nav
          class="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500"
          aria-label="Breadcrumb"
        >
          <NuxtLink to="/" class="transition hover:text-violet-700">Home</NuxtLink>
          <span class="text-neutral-300">/</span>
          <span class="text-neutral-700">Sign in</span>
        </nav>

        <div class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Welcome back
          </p>
          <h1
            id="login-heading"
            class="mt-3 text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl"
          >
            Sign in to SplitFlow
          </h1>
          <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
            Pick up where you left off—shared balances, groups, and settlements in one calm place.
          </p>
        </div>

        <GlassCard
          class="border-white/70 shadow-[0_24px_64px_-28px_rgba(124,58,237,0.12),0_16px_48px_-20px_rgba(0,0,0,0.08)]"
        >
          <div
            class="rounded-[1.35rem] bg-gradient-to-br from-white/85 via-pink-50/25 to-violet-50/35 p-6 ring-1 ring-white/80 md:rounded-[1.5rem] md:p-8"
          >
            <form class="space-y-5" @submit.prevent="onSubmit">
              <div
                v-if="error"
                role="alert"
                class="rounded-2xl border border-rose-200/70 bg-rose-50/60 px-4 py-3 text-sm text-rose-900"
              >
                {{ error }}
              </div>

              <div class="space-y-2">
                <Label for="login-email" class="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Email
                </Label>
                <Input
                  id="login-email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                  :disabled="loading"
                  :class="inputClass"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <Label
                    for="login-password"
                    class="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                  >
                    Password
                  </Label>
                  <NuxtLink
                    to="/signup"
                    class="text-xs font-semibold text-violet-700 transition hover:text-violet-900"
                  >
                    Create account
                  </NuxtLink>
                </div>
                <Input
                  id="login-password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                  :disabled="loading"
                  :class="inputClass"
                />
              </div>

              <GlowCtaButton
                type="submit"
                size="lg"
                class="mt-2 w-full justify-center shadow-lg shadow-violet-500/20"
                :disabled="loading"
              >
                <Loader2 v-if="loading" class="size-5 shrink-0 animate-spin" aria-hidden="true" />
                <span v-if="loading">Signing in…</span>
                <span v-else>Sign in</span>
              </GlowCtaButton>
            </form>

            <p class="mt-6 text-center text-sm text-neutral-600">
              New to SplitFlow?
              <NuxtLink
                to="/signup"
                class="font-semibold text-violet-700 underline-offset-4 transition hover:text-violet-900 hover:underline"
              >
                Start free
              </NuxtLink>
            </p>
          </div>
        </GlassCard>

        <p class="mt-8 text-center text-xs text-neutral-500">
          No credit card required to explore—upgrade when your crew outgrows the basics.
        </p>
      </div>
    </section>

    <LayoutFooter />
  </div>
</template>
