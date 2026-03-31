<script setup lang="ts">
import { Loader2, Mail } from 'lucide-vue-next'

definePageMeta({
  layout: 'marketing',
})

useHead({
  title: 'Sign up — SplitFlow.',
  meta: [
    {
      name: 'description',
      content: 'Create a free SplitFlow account and start splitting expenses with your group.',
    },
  ],
})

const authStore = useAuthStore()
const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const companyName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const success = ref(false)

const inputClass =
  'h-12 rounded-2xl border-white/80 bg-white/75 px-4 text-base text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:border-violet-300 focus-visible:ring-2 focus-visible:ring-violet-400/35 md:text-sm'

const onSubmit = async () => {
  error.value = null
  if (!firstName.value.trim() || !lastName.value.trim()) {
    error.value = 'Please enter your first and last name.'
    return
  }
  if (!email.value.trim() || !password.value) {
    error.value = 'Please enter email and password.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    const result = await authStore.signUp(email.value.trim(), password.value, {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      companyName: companyName.value.trim() || undefined,
    })
    if (result.error) {
      error.value = result.error.message ?? 'Sign up failed. Please try again.'
      return
    }
    if (result.data?.needsEmailConfirmation) {
      success.value = true
      error.value = null
      return
    }
    await router.push('/dashboard')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

const passwordsMatch = computed(
  () => !confirmPassword.value || password.value === confirmPassword.value
)
</script>

<template>
  <div class="mx-auto w-full max-w-[90rem]">
    <LayoutNavbar />

    <section class="relative px-4 pb-20 pt-6 md:pb-28 md:pt-10" aria-labelledby="signup-heading">
      <div
        class="pointer-events-none absolute left-1/2 top-0 h-[22rem] w-[min(92vw,36rem)] -translate-x-1/2 rounded-full bg-[#FFAAB4]/18 blur-[100px]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -left-20 top-32 h-56 w-56 rounded-full bg-violet-200/25 blur-[88px] md:left-[8%]"
        aria-hidden="true"
      />

      <div class="relative mx-auto max-w-md">
        <nav
          class="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500"
          aria-label="Breadcrumb"
        >
          <NuxtLink to="/" class="transition hover:text-violet-700">Home</NuxtLink>
          <span class="text-neutral-300">/</span>
          <span class="text-neutral-700">Sign up</span>
        </nav>

        <div v-if="!success" class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Get started
          </p>
          <h1
            id="signup-heading"
            class="mt-3 text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl"
          >
            Create your account
          </h1>
          <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
            Free to start—track shared spending and settle up without the spreadsheet drama.
          </p>
        </div>

        <GlassCard
          v-if="!success"
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

              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label
                    for="signup-first-name"
                    class="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                  >
                    First name<span class="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="signup-first-name"
                    v-model="firstName"
                    type="text"
                    placeholder="Jane"
                    autocomplete="given-name"
                    required
                    :disabled="loading"
                    :class="inputClass"
                  />
                </div>
                <div class="space-y-2">
                  <Label
                    for="signup-last-name"
                    class="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                  >
                    Last name<span class="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="signup-last-name"
                    v-model="lastName"
                    type="text"
                    placeholder="Doe"
                    autocomplete="family-name"
                    required
                    :disabled="loading"
                    :class="inputClass"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label
                  for="signup-company"
                  class="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Company name
                </Label>
                <Input
                  id="signup-company"
                  v-model="companyName"
                  type="text"
                  placeholder="Acme Inc. (optional)"
                  autocomplete="organization"
                  :disabled="loading"
                  :class="inputClass"
                />
              </div>

              <div class="space-y-2">
                <Label for="signup-email" class="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Email<span class="text-rose-600">*</span>
                </Label>
                <Input
                  id="signup-email"
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
                <Label
                  for="signup-password"
                  class="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Password
                </Label>
                <Input
                  id="signup-password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  required
                  :disabled="loading"
                  :class="inputClass"
                />
                <p class="text-xs text-neutral-500">At least 6 characters.</p>
              </div>

              <div class="space-y-2">
                <Label
                  for="signup-confirm"
                  class="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Confirm password
                </Label>
                <Input
                  id="signup-confirm"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  required
                  :disabled="loading"
                  :class="[
                    inputClass,
                    confirmPassword && !passwordsMatch ? 'border-rose-300 focus-visible:ring-rose-300/40' : '',
                  ]"
                />
                <p v-if="confirmPassword && !passwordsMatch" class="text-xs font-medium text-rose-700">
                  Passwords do not match.
                </p>
              </div>

              <GlowCtaButton
                type="submit"
                size="lg"
                class="mt-2 w-full justify-center shadow-lg shadow-violet-500/20"
                :disabled="loading"
              >
                <Loader2 v-if="loading" class="size-5 shrink-0 animate-spin" aria-hidden="true" />
                <span v-if="loading">Creating account…</span>
                <span v-else>Create account</span>
              </GlowCtaButton>

              <p class="text-center text-sm text-neutral-600">
                Already have an account?
                <NuxtLink
                  to="/login"
                  class="font-semibold text-violet-700 underline-offset-4 transition hover:text-violet-900 hover:underline"
                >
                  Sign in
                </NuxtLink>
              </p>
            </form>
          </div>
        </GlassCard>

        <!-- Success: email confirmation or redirect -->
        <div v-else class="space-y-8">
          <div class="text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              You’re in
            </p>
            <h1 class="mt-3 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
              Check your inbox
            </h1>
          </div>

          <GlassCard class="border-emerald-100/60 shadow-[0_24px_64px_-28px_rgba(16,185,129,0.12)]">
            <div
              class="rounded-[1.35rem] bg-gradient-to-br from-emerald-50/50 via-white/80 to-violet-50/30 p-8 text-center ring-1 ring-white/80 md:rounded-[1.5rem] md:p-10"
            >
              <div
                class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg"
              >
                <Mail class="size-8" stroke-width="2" />
              </div>
              <p class="mt-6 text-lg font-semibold text-neutral-900">Confirm your email</p>
              <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
                We sent a confirmation link to
                <strong class="text-neutral-800">{{ email }}</strong
                >. Open it to activate your account, then sign in.
              </p>
              <GlowCtaButton to="/login" size="lg" class="mt-8 w-full max-w-xs justify-center shadow-md">
                Go to sign in
              </GlowCtaButton>
            </div>
          </GlassCard>
        </div>

        <p v-if="!success" class="mt-8 text-center text-xs text-neutral-500">
          No credit card · Up and running in a minute
        </p>
      </div>
    </section>

    <LayoutFooter />
  </div>
</template>
