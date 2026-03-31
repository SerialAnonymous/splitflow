import { defineStore } from 'pinia'

export type BillingPlan = 'free' | 'pro' | 'team'

const PAID_STATUSES = ['trial', 'active', 'cancelled'] as const

export const useUserPlanStore = defineStore('userPlan', {
  state: () => ({
    plan: 'free' as BillingPlan,
    status: null as string | null,
    trialEnd: null as string | null,
    loading: false,
    upgradeModalOpen: false,
  }),

  getters: {
    /** Entitlement from DB only — Pro/Team with a non-expired subscription row (webhook is source of truth). */
    hasFullAccess(s) {
      if (s.plan !== 'pro' && s.plan !== 'team') return false
      if (s.status === 'expired') return false
      return PAID_STATUSES.includes(s.status as (typeof PAID_STATUSES)[number])
    },
    isFree: (s) => s.plan === 'free',
    isProTrial: (s) => s.plan === 'pro' && s.status === 'trial',
    isTeamTrial: (s) => s.plan === 'team' && s.status === 'trial',
    planLabel: (s) => {
      if (s.plan === 'pro') return 'Pro'
      if (s.plan === 'team') return 'Team'
      return 'Free'
    },
  },

  actions: {
    openUpgradeModal() {
      this.upgradeModalOpen = true
    },

    closeUpgradeModal() {
      this.upgradeModalOpen = false
    },

    async fetchPlan() {
      const { $supabase } = useNuxtApp()
      const authStore = useAuthStore()
      const uid = authStore.userId
      if (!$supabase || !uid) {
        this.plan = 'free'
        this.status = null
        this.trialEnd = null
        return
      }
      this.loading = true
      const { data } = await $supabase
        .from('subscriptions')
        .select('plan, status, trial_end')
        .eq('user_id', uid)
        .maybeSingle()
      this.loading = false
      const p = data?.plan
      this.plan = p === 'pro' || p === 'team' ? p : 'free'
      this.status = data?.status ?? null
      this.trialEnd = data?.trial_end ?? null
    },
  },
})
