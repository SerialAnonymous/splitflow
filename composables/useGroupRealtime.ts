import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe to Realtime changes for a single group: expenses, settlements, group_members.
 * When any change is received, refetches the corresponding data so the UI updates instantly.
 * Unsubscribes on unmount or when groupId changes.
 */
export function useGroupRealtime(groupId: Ref<string> | string) {
  const { $supabase } = useNuxtApp()
  const groupStore = useGroupStore()
  const expenseStore = useExpenseStore()
  const settlementStore = useSettlementStore()

  let channel: RealtimeChannel | null = null

  const id = computed(() => (typeof groupId === 'string' ? groupId : groupId.value))

  function refetchExpenses() {
    expenseStore.getGroupExpenses(id.value)
  }

  function refetchSettlements() {
    settlementStore.getGroupSettlements(id.value)
  }

  function refetchMembers() {
    groupStore.getGroupMembers(id.value)
  }

  function handleExpenseChange(payload: { eventType: string; old?: { group_id?: string }; new?: { group_id?: string } }) {
    const gid = id.value
    const groupIdMatch =
      payload.new?.group_id === gid ||
      payload.old?.group_id === gid
    if (groupIdMatch || (!payload.new?.group_id && !payload.old?.group_id)) {
      refetchExpenses()
    }
  }

  function handleSettlementChange(payload: { eventType: string; old?: { group_id?: string }; new?: { group_id?: string } }) {
    const gid = id.value
    const groupIdMatch =
      payload.new?.group_id === gid ||
      payload.old?.group_id === gid
    if (groupIdMatch || (!payload.new?.group_id && !payload.old?.group_id)) {
      refetchSettlements()
    }
  }

  function handleMemberChange(payload: { eventType: string; old?: { group_id?: string }; new?: { group_id?: string } }) {
    const gid = id.value
    const groupIdMatch =
      payload.new?.group_id === gid ||
      payload.old?.group_id === gid
    if (groupIdMatch || (!payload.new?.group_id && !payload.old?.group_id)) {
      refetchMembers()
    }
  }

  function subscribe() {
    const gid = id.value
    if (!$supabase || !gid) return

    channel = $supabase
      .channel(`group:${gid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `group_id=eq.${gid}`,
        },
        (payload) => handleExpenseChange(payload as any)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settlements',
          filter: `group_id=eq.${gid}`,
        },
        (payload) => handleSettlementChange(payload as any)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${gid}`,
        },
        (payload) => handleMemberChange(payload as any)
      )
      .subscribe()
  }

  function unsubscribe() {
    if ($supabase && channel) {
      $supabase.removeChannel(channel)
      channel = null
    }
  }

  function setupChannel() {
    unsubscribe()
    subscribe()
  }

  onMounted(setupChannel)
  watch(id, () => {
    setupChannel()
  })
  onUnmounted(unsubscribe)

  return { subscribe, unsubscribe }
}
