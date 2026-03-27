/**
 * Access Supabase client (use after Supabase plugin is loaded).
 */
export function useSupabase() {
  const { $supabase } = useNuxtApp()
  return $supabase
}
