import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public
  const url = config.supabaseUrl ?? ''
  const key = config.supabaseAnonKey ?? ''

  let supabase
  try {
    supabase = url && key
      ? createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        })
      : null
  } catch {
    supabase = null
  }

  return {
    provide: {
      supabase,
    },
  }
})

declare module '#app' {
  interface NuxtApp {
    $supabase: ReturnType<typeof createClient> | null
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: ReturnType<typeof createClient> | null
  }
}
