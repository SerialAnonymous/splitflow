import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe to Realtime changes for multiple groups (expenses, settlements, group_members).
 * When any change is received for any group, calls onUpdate so the dashboard can refetch.
 * Use on the dashboard page so balances, recent expenses, and group list update live.
 */
export function useDashboardRealtime(
  groupIds: Ref<string[]>,
  onUpdate: () => void | Promise<void>
) {
  const { $supabase } = useNuxtApp()
  const channels: RealtimeChannel[] = []

  function subscribe() {
    if (!$supabase) return
    const ids = groupIds.value
    if (!ids.length) return

    for (const gid of ids) {
      const channel = $supabase
        .channel(`dashboard:${gid}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses',
            filter: `group_id=eq.${gid}`,
          },
          () => onUpdate()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'settlements',
            filter: `group_id=eq.${gid}`,
          },
          () => onUpdate()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_members',
            filter: `group_id=eq.${gid}`,
          },
          () => onUpdate()
        )
        .subscribe()
      channels.push(channel)
    }
  }

  function unsubscribe() {
    if ($supabase) {
      for (const ch of channels) {
        $supabase.removeChannel(ch)
      }
      channels.length = 0
    }
  }

  function setup() {
    unsubscribe()
    subscribe()
  }

  onMounted(setup)
  watch(groupIds, setup, { deep: true })
  onUnmounted(unsubscribe)

  return { subscribe: setup, unsubscribe }
}
