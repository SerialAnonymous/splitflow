import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

export async function getSupabaseUserFromBearer(event: H3Event): Promise<User | null> {
  const auth = getHeader(event, 'authorization')
  if (!auth?.toLowerCase().startsWith('bearer ')) return null
  const token = auth.slice(7).trim()
  if (!token) return null

  const config = useRuntimeConfig(event)
  const url = config.public.supabaseUrl as string
  const anonKey = config.public.supabaseAnonKey as string
  if (!url || !anonKey) return null

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
