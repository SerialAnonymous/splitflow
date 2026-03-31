/**
 * Initialize auth store and listen to session changes (client-only).
 * Keeps billing plan in sync for feature gating.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const userPlanStore = useUserPlanStore()
  await authStore.init()

  watch(
    () => authStore.userId,
    (id) => {
      if (id) void userPlanStore.fetchPlan()
      else {
        userPlanStore.plan = 'free'
        userPlanStore.status = null
        userPlanStore.trialEnd = null
      }
    },
    { immediate: true }
  )
})
