<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const success = ref(false)

const onSubmit = async () => {
  error.value = null
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
    const result = await authStore.signUp(email.value.trim(), password.value)
    if (result.error) {
      error.value = result.error.message ?? 'Sign up failed. Please try again.'
      return
    }
    if (result.data?.needsEmailConfirmation) {
      success.value = true
      error.value = null
      return
    }
    success.value = true
    await router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.message ?? 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

const passwordsMatch = computed(() =>
  !confirmPassword.value || password.value === confirmPassword.value
)
</script>

<template>
  <div class="mx-auto max-w-full py-6">
    <Card class="w-full rounded-2xl shadow-card">
      <CardHeader class="space-y-1">
        <CardTitle class="text-xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your email and a password to get started with SplitFlow.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form v-if="!success" class="space-y-4" @submit.prevent="onSubmit">
          <div v-if="error" class="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ error }}
          </div>

          <div class="space-y-2">
            <Label for="signup-email">Email</Label>
            <Input
              id="signup-email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              :disabled="loading"
              class="h-11 w-full rounded-xl"
            />
          </div>

          <div class="space-y-2">
            <Label for="signup-password">Password</Label>
            <Input
              id="signup-password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              required
              :disabled="loading"
              class="h-11 w-full rounded-xl"
            />
            <p class="text-xs text-muted-foreground">At least 6 characters.</p>
          </div>

          <div class="space-y-2">
            <Label for="signup-confirm">Confirm password</Label>
            <Input
              id="signup-confirm"
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              required
              :disabled="loading"
              :class="{ 'border-destructive': confirmPassword && !passwordsMatch }"
              class="h-11 w-full rounded-xl"
            />
            <p v-if="confirmPassword && !passwordsMatch" class="text-xs text-destructive">
              Passwords do not match.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            :disabled="loading"
            @click="onSubmit"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account...
            </span>
            <span v-else>Sign up</span>
          </button>

          <p class="text-center text-sm text-muted-foreground">
            Already have an account?
            <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </NuxtLink>
          </p>
        </form>

        <div v-else class="space-y-4">
          <div class="rounded-xl bg-primary/10 px-3 py-3 text-sm text-foreground">
            <p class="font-medium">Check your email</p>
            <p class="mt-1 text-muted-foreground">
              We sent a confirmation link to <strong>{{ email }}</strong>. Click the link to activate your account, then sign in.
            </p>
          </div>
          <NuxtLink
            to="/login"
            class="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow hover:bg-primary/90"
          >
            Go to Sign in
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
