import { defineStore } from 'pinia'
import type { Group, GroupMember, GroupWithMemberCount } from '~/types/group'

export const useGroupStore = defineStore('group', {
  state: () => ({
    groups: [] as GroupWithMemberCount[],
    currentGroup: null as Group | null,
    members: [] as GroupMember[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    userGroups: (state) => state.groups,
    currentGroupMembers: (state) => state.members,
  },

  actions: {
    setError(message: string | null) {
      this.error = message
    },

    async createGroup(payload: { name: string; description?: string; currency?: string }) {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      const userId = authStore.userId
      if (!$supabase || !userId) {
        this.setError('Not authenticated')
        return { data: null, error: { message: 'Not authenticated' } }
      }

      this.loading = true
      this.setError(null)
      const { data, error } = await $supabase
        .from('groups')
        .insert({
          name: payload.name,
          description: payload.description ?? null,
          currency: payload.currency ?? 'USD',
          created_by: userId,
        })
        .select('*')
        .single()

      this.loading = false
      if (error) {
        this.setError(error.message)
        return { data: null, error }
      }
      if (data) {
        // Trigger add_creator_as_group_owner already adds creator to group_members; don't insert again (avoids 409)
        this.groups = [{ ...data, member_count: 1 }, ...this.groups]
      }
      return { data, error: null }
    },

    async getUserGroups() {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      const userId = authStore.userId
      if (!$supabase || !userId) {
        this.groups = []
        return { data: [], error: { message: 'Not authenticated' } }
      }

      this.loading = true
      this.setError(null)
      const { data: memberRows, error: memberError } = await $supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId)

      if (memberError) {
        this.loading = false
        this.setError(memberError.message)
        return { data: [], error: memberError }
      }

      const groupIds = (memberRows ?? []).map((r) => r.group_id)
      if (groupIds.length === 0) {
        this.groups = []
        this.loading = false
        return { data: [], error: null }
      }

      const { data: groupsData, error: groupsError } = await $supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false })

      this.loading = false
      if (groupsError) {
        this.setError(groupsError.message)
        return { data: [], error: groupsError }
      }

      const withCount: GroupWithMemberCount[] = await Promise.all(
        (groupsData ?? []).map(async (g) => {
          const { count } = await $supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', g.id)
          return { ...g, member_count: count ?? 0 }
        })
      )
      this.groups = withCount
      return { data: this.groups, error: null }
    },

    async getGroupById(id: string) {
      const { $supabase } = useNuxtApp()
      if (!$supabase) return { data: null, error: { message: 'Supabase not configured' } }

      this.loading = true
      this.setError(null)
      const { data, error } = await $supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single()

      this.loading = false
      if (error) {
        this.setError(error.message)
        return { data: null, error }
      }
      this.currentGroup = data
      return { data, error: null }
    },

    async getGroupMembers(groupId: string) {
      const { $supabase } = useNuxtApp()
      if (!$supabase) {
        this.members = []
        return { data: [], error: { message: 'Supabase not configured' } }
      }

      this.loading = true
      this.setError(null)
      const { data: rows, error } = await $supabase
        .from('group_members')
        .select('id, group_id, user_id, role, joined_at')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

      this.loading = false
      if (error) {
        this.setError(error.message)
        this.members = []
        return { data: [], error }
      }

      const memberList = rows ?? []
      const userIds = [...new Set(memberList.map((r) => r.user_id))]
      let userMap: Record<string, { id: string; name: string | null; email: string; avatar: string | null }> = {}
      if (userIds.length > 0) {
        const { data: usersData } = await $supabase
          .from('users')
          .select('id, name, email, avatar')
          .in('id', userIds)
        userMap = (usersData ?? []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {})
      }

      const members: GroupMember[] = memberList.map((row) => ({
        ...row,
        status: 'active' as const,
        user: userMap[row.user_id],
      }))
      this.members = members
      return { data: members, error: null }
    },

    async inviteUser(groupId: string, email: string) {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      if (!$supabase) return { data: null, error: { message: 'Supabase not configured' } }

      this.setError(null)
      const { data: userRow, error: userError } = await $supabase
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (userError || !userRow) {
        this.setError('User not found with that email.')
        return { data: null, error: { message: 'User not found with that email.' } }
      }

      const { data: existing } = await $supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userRow.id)
        .maybeSingle()

      if (existing) {
        this.setError('User is already in this group.')
        return { data: null, error: { message: 'User is already in this group.' } }
      }

      const { data, error } = await $supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userRow.id,
          role: 'member',
        })
        .select()
        .single()

      if (error) {
        this.setError(error.message)
        return { data: null, error }
      }
      this.members = [...this.members, data]
      return { data, error: null }
    },

    async leaveGroup(groupId: string) {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      const userId = authStore.userId
      if (!$supabase || !userId) {
        return { error: { message: 'Not authenticated' } }
      }

      this.setError(null)
      const { error } = await $supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (error) {
        this.setError(error.message)
        return { error }
      }
      this.groups = this.groups.filter((g) => g.id !== groupId)
      this.members = this.members.filter((m) => m.user_id !== userId)
      if (this.currentGroup?.id === groupId) {
        this.currentGroup = null
        this.members = []
      }
      return { error: null }
    },

    async joinGroup(groupId: string) {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      const userId = authStore.userId
      if (!$supabase || !userId) {
        return { data: null, error: { message: 'Not authenticated' } }
      }

      const { data: existing } = await $supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single()

      if (existing) {
        this.setError('You are already in this group.')
        return { data: null, error: { message: 'Already a member.' } }
      }

      const { data, error } = await $supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
        })
        .select()
        .single()

      if (!error && data) this.members = [...this.members, data]
      return { data, error }
    },

    clearCurrentGroup() {
      this.currentGroup = null
      this.members = []
    },
  },
})
