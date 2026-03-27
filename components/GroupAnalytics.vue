<script setup lang="ts">
import type { ExpenseWithParticipants } from '~/types/expense'
import { Bar, Doughnut, Line } from 'vue-chartjs'

const props = defineProps<{
  expenses: ExpenseWithParticipants[]
  currency: string
  /** Optional: map user_id to display name for "Spending by user" chart */
  userDisplayName?: (userId: string) => string
}>()

const defaultUserLabel = (userId: string) => props.userDisplayName?.(userId) ?? userId.slice(0, 8)

// Spending by category: group by category, sum amount
const byCategory = computed(() => {
  const map = new Map<string, number>()
  for (const e of props.expenses) {
    const cat = (e.category && e.category.trim()) || 'Uncategorized'
    map.set(cat, (map.get(cat) ?? 0) + Number(e.amount))
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1])
  return {
    labels: entries.map(([l]) => l),
    data: entries.map(([, v]) => Math.round(v * 100) / 100),
  }
})

const categoryChartData = computed(() => ({
  labels: byCategory.value.labels,
  datasets: [
    {
      data: byCategory.value.data,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderWidth: 1,
    },
  ],
}))

const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    title: { display: true, text: 'Spending by category' },
  },
}

// Spending by user: group by paid_by, sum amount
const byUser = computed(() => {
  const map = new Map<string, number>()
  for (const e of props.expenses) {
    const uid = e.paid_by
    map.set(uid, (map.get(uid) ?? 0) + Number(e.amount))
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1])
  return {
    labels: entries.map(([uid]) => defaultUserLabel(uid)),
    data: entries.map(([, v]) => Math.round(v * 100) / 100),
  }
})

const userChartData = computed(() => ({
  labels: byUser.value.labels,
  datasets: [
    {
      label: `Amount (${props.currency})`,
      data: byUser.value.data,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
    },
  ],
}))

const userChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Spending by user' },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (value: number) => props.currency + ' ' + value },
    },
  },
}

// Monthly spending: group by year-month, sum amount
const byMonth = computed(() => {
  const map = new Map<string, number>()
  for (const e of props.expenses) {
    const d = e.date || e.created_at || ''
    const monthKey = d ? d.slice(0, 7) : ''
    if (!monthKey) continue
    map.set(monthKey, (map.get(monthKey) ?? 0) + Number(e.amount))
  }
  const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const labels = entries.map(([ym]) => {
    const [y, m] = ym.split('-')
    const date = new Date(Number(y), Number(m) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  })
  return {
    labels,
    data: entries.map(([, v]) => Math.round(v * 100) / 100),
  }
})

const monthlyChartData = computed(() => ({
  labels: byMonth.value.labels,
  datasets: [
    {
      label: `Spending (${props.currency})`,
      data: byMonth.value.data,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.2,
    },
  ],
}))

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Monthly spending' },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (value: number) => props.currency + ' ' + value },
    },
  },
}

const hasData = computed(
  () =>
    byCategory.value.data.length > 0 ||
    byUser.value.data.length > 0 ||
    byMonth.value.data.length > 0
)
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="!hasData"
      class="rounded-[1.75rem] border border-dashed border-white/55 bg-white/25 py-14 text-center text-sm text-neutral-500 backdrop-blur-sm md:rounded-[2rem]"
    >
      No expense data yet. Add expenses to see analytics.
    </div>

    <ClientOnly v-else>
      <div class="grid gap-6 lg:grid-cols-2">
        <GlassCard v-if="byCategory.data.length > 0" class="p-5 md:p-6">
          <div class="h-64">
            <Doughnut
              :data="categoryChartData"
              :options="categoryChartOptions"
            />
          </div>
        </GlassCard>

        <GlassCard v-if="byUser.data.length > 0" class="p-5 md:p-6">
          <div class="h-64">
            <Bar
              :data="userChartData"
              :options="userChartOptions"
            />
          </div>
        </GlassCard>
      </div>

      <GlassCard v-if="byMonth.data.length > 0" class="mt-6 p-5 md:p-6">
        <div class="h-64">
          <Line
            :data="monthlyChartData"
            :options="monthlyChartOptions"
          />
        </div>
      </GlassCard>

      <template #fallback>
        <div class="rounded-[1.75rem] border border-white/50 bg-white/30 py-14 text-center text-sm text-neutral-500">
          Loading charts…
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
