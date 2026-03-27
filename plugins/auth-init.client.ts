/**
 * Initialize auth store and listen to session changes (client-only).
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.init()
})
