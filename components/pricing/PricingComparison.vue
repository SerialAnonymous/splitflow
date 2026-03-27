<script setup lang="ts">
import { Check, Minus } from 'lucide-vue-next'

type Cell = boolean | 'partial'

const rows: { feature: string; free: Cell; pro: Cell; team: Cell }[] = [
  { feature: 'Active groups', free: 'partial', pro: 'partial', team: 'partial' },
  { feature: 'Members per group', free: 'partial', pro: 'partial', team: 'partial' },
  { feature: 'Expense & balance tracking', free: true, pro: true, team: true },
  { feature: 'Activity history', free: 'partial', pro: true, team: true },
  { feature: 'Receipts & attachments', free: false, pro: true, team: true },
  { feature: 'CSV export', free: false, pro: true, team: true },
  { feature: 'Roles & permissions', free: false, pro: false, team: true },
]

const planCols = ['free', 'pro', 'team'] as const

function partialText(feature: string, col: 'free' | 'pro' | 'team') {
  if (feature === 'Active groups') {
    if (col === 'free') return '1 group'
    return 'Unlimited'
  }
  if (feature === 'Members per group') {
    if (col === 'free') return 'Up to 4'
    if (col === 'pro') return 'Up to 12'
    return 'Up to 50'
  }
  if (feature === 'Activity history') {
    if (col === 'free') return '7 days'
    return 'Unlimited'
  }
  return '—'
}
</script>

<template>
  <section class="relative px-4 py-16 md:py-24" aria-labelledby="compare-heading">
    <div class="mx-auto max-w-5xl text-center">
      <h2
        id="compare-heading"
        class="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl"
      >
        Compare plans
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-neutral-600">
        Same honest product—pick the ceiling that fits your crew.
      </p>
    </div>

    <SaasCard class="mx-auto mt-12 max-w-5xl overflow-hidden border-white/60 bg-white/50 p-0 backdrop-blur-xl">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr
              class="sticky top-0 z-[1] border-b border-white/60 bg-gradient-to-b from-white/90 to-white/75 backdrop-blur-md"
            >
              <th scope="col" class="px-5 py-4 font-semibold text-neutral-900 md:px-8 md:py-5">
                Feature
              </th>
              <th
                scope="col"
                class="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-500 md:px-6 md:py-5"
              >
                Free
              </th>
              <th
                scope="col"
                class="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-violet-700 md:px-6 md:py-5"
              >
                Pro
              </th>
              <th
                scope="col"
                class="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-500 md:px-6 md:py-5"
              >
                Team
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/50">
            <tr
              v-for="row in rows"
              :key="row.feature"
              class="transition-colors duration-300 hover:bg-white/30"
            >
              <th
                scope="row"
                class="whitespace-nowrap px-5 py-4 font-medium text-neutral-800 md:px-8 md:py-4"
              >
                {{ row.feature }}
              </th>
              <td
                v-for="col in planCols"
                :key="String(col)"
                class="px-4 py-4 text-center md:px-6"
              >
                <span v-if="row[col] === true" class="inline-flex justify-center text-emerald-600">
                  <Check class="size-5" stroke-width="2.5" aria-label="Included" />
                </span>
                <span v-else-if="row[col] === false" class="inline-flex justify-center text-neutral-300">
                  <Minus class="size-5" stroke-width="2" aria-label="Not included" />
                </span>
                <span v-else class="text-xs font-medium text-neutral-600 md:text-sm">
                  {{ partialText(row.feature, col) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SaasCard>
  </section>
</template>
