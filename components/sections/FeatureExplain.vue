<script setup lang="ts">
import { Activity, Receipt, Wallet, Zap } from 'lucide-vue-next'
</script>

<template>
  <section id="about" class="relative px-4 py-20 md:py-28">
    <div class="mx-auto max-w-7xl">
      <SaasCard class="border-white/60 bg-white/50 p-6 md:p-12 lg:p-14">
        <div class="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div class="space-y-8">
            <div class="rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-neutral-50/90 to-pink-50/50 p-6 shadow-inner md:p-8">
              <p class="text-sm font-semibold text-neutral-900">Recent activity</p>
              <ul class="mt-5 space-y-3">
                <li
                  v-for="(row, i) in [
                    { title: 'Dinner · North Loop', sub: 'Split 4 ways · just now', amt: 96 },
                    { title: 'Groceries', sub: 'You and Alex · 1h ago', amt: 54 },
                    { title: 'Ride share', sub: 'Whole group · today', amt: 28 },
                  ]"
                  :key="i"
                  class="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm"
                >
                  <div class="size-12 shrink-0 rounded-xl bg-gradient-to-br from-pink-200 to-violet-200" />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-neutral-900">{{ row.title }}</p>
                    <p class="text-xs text-neutral-500">{{ row.sub }}</p>
                  </div>
                  <span class="shrink-0 text-sm font-semibold text-violet-600">${{ row.amt }}</span>
                </li>
              </ul>
            </div>

            <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 md:p-8">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-neutral-900">Active groups</p>
                <span class="text-xs font-medium text-violet-600">All synced</span>
              </div>
              <div class="mt-5 flex gap-3">
                <div
                  class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-md"
                  aria-hidden="true"
                >
                  <span class="text-2xl">🧥</span>
                </div>
                <div
                  class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 shadow-md"
                  aria-hidden="true"
                >
                  <span class="text-2xl">👟</span>
                </div>
                <div
                  class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-300 shadow-md"
                  aria-hidden="true"
                >
                  <span class="text-2xl">🎧</span>
                </div>
                <div class="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 text-xs font-medium text-neutral-400">
                  +4 more
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-3xl font-bold leading-tight tracking-tight text-neutral-900 md:text-4xl lg:text-[2.75rem]">
              Split smarter. Settle faster.
            </h2>
            <div class="mt-10 space-y-9">
              <div class="flex gap-5">
                <div
                  class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 shadow-sm"
                >
                  <Wallet class="size-7" stroke-width="2" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900">Smart expense splitting</h3>
                  <p class="mt-2 text-sm leading-relaxed text-neutral-600">
                    Split equally, by percentage, or custom shares—so everyone pays what they agreed, every time.
                  </p>
                </div>
              </div>
              <div class="flex gap-5">
                <div
                  class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm"
                >
                  <Activity class="size-7" stroke-width="2" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900">Real-time balance updates</h3>
                  <p class="mt-2 text-sm leading-relaxed text-neutral-600">
                    Balances refresh as expenses land—no more “wait, who owes who?” in the group chat.
                  </p>
                </div>
              </div>
              <div class="flex gap-5">
                <div
                  class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-sm"
                >
                  <Zap class="size-7" stroke-width="2" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900">Instant settlements</h3>
                  <p class="mt-2 text-sm leading-relaxed text-neutral-600">
                    Record a payment, mark it settled, and move on—clean books without the awkward follow-ups.
                  </p>
                </div>
              </div>
              <div class="flex gap-5">
                <div
                  class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-600 shadow-sm"
                >
                  <Receipt class="size-7" stroke-width="2" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900">Expense history &amp; receipts</h3>
                  <p class="mt-2 text-sm leading-relaxed text-neutral-600">
                    Every line item stays searchable with notes and receipts—disputes end before they start.
                  </p>
                </div>
              </div>
            </div>
            <GlowCtaButton to="/signup" size="md" class="mt-10 shadow-md">
              Start free
            </GlowCtaButton>
          </div>
        </div>
      </SaasCard>
    </div>
  </section>
</template>
