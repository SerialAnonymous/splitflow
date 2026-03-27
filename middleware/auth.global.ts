/**
 * Global auth middleware.
 * - Redirects unauthenticated users to /login (except public pages).
 * - Redirects authenticated users from /login and /signup to /.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const isGuestPage =
      to.path === '/' ||
      to.path === '/pricing' ||
      to.path === '/checkout' ||
      to.path === '/checkout/success' ||
      to.path === '/login' ||
      to.path === '/signup'

    if (import.meta.server) return

    const authStore = useAuthStore()
    if (!authStore) return

    if (authStore.loading) {
      await new Promise<void>((resolve) => {
        const stop = authStore.$subscribe(() => {
          if (!authStore.loading) {
            stop()
            resolve()
          }
        })
        setTimeout(resolve, 3000)
      })
    }

    const isAuthenticated = authStore.isAuthenticated

    if (isGuestPage) {
      if (isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
        return navigateTo('/dashboard', { replace: true })
      }
      return
    }

    if (!isAuthenticated) {
      return navigateTo('/login', { replace: true })
    }
  } catch {
    // Avoid breaking the app if store/redirect fails
  }
})
