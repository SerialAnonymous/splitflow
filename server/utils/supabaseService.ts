import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

export function getSupabaseServiceClient(event: H3Event): SupabaseClient | null {
  const config = useRuntimeConfig(event)
  const url = config.public.supabaseUrl as string
  const key = config.supabaseServiceRoleKey as string
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
