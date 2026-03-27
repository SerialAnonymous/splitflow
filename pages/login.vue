<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

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
  } catch (e: any) {
    error.value = e?.message ?? 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-full py-6">
    <Card class="w-full rounded-2xl shadow-card">
      <CardHeader class="space-y-1">
        <CardTitle class="text-xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access SplitFlow.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div v-if="error" class="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ error }}
          </div>

          <div class="space-y-2">
            <Label for="login-email">Email</Label>
            <Input
              id="login-email"
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
            <div class="flex items-center justify-between">
              <Label for="login-password">Password</Label>
              <NuxtLink
                to="/signup"
                class="text-sm text-muted-foreground hover:text-primary underline-offset-4"
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
              class="h-11 w-full rounded-xl"
            />
          </div>

          <button
            type="button"
            class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            :disabled="loading"
            @click="onSubmit"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
