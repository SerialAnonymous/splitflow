export type GroupMemberRole = 'owner' | 'admin' | 'member'
export type GroupMemberStatus = 'pending' | 'active'

export interface Group {
  id: string
  name: string
  description: string | null
  currency: string
  created_by: string
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: GroupMemberRole
  status: GroupMemberStatus
  joined_at: string
  user?: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

export interface GroupWithMemberCount extends Group {
  member_count?: number
}
