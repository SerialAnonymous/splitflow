<script setup lang="ts">
import { PieChart, ShieldCheck, Smartphone, Users } from 'lucide-vue-next'
</script>

<template>
  <section class="relative px-4 py-20 md:py-28">
    <div class="mx-auto max-w-7xl">
      <div class="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <h2 class="text-3xl font-bold leading-tight tracking-tight text-neutral-900 md:text-4xl lg:text-[2.75rem]">
            Built for trust, speed, and real life
          </h2>
          <ul class="mt-12 space-y-8">
            <li class="flex gap-5">
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 shadow-sm"
              >
                <Users class="size-6" stroke-width="2" />
              </span>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900">Groups that feel intentional</h3>
                <p class="mt-1 text-sm leading-relaxed text-neutral-600">
                  Invite-only spaces, clear roles, and a balance everyone can see—no mystery debt.
                </p>
              </div>
            </li>
            <li class="flex gap-5">
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-100 to-pink-100 text-fuchsia-600 shadow-sm"
              >
                <PieChart class="size-6" stroke-width="2" />
              </span>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900">Spending you can actually read</h3>
                <p class="mt-1 text-sm leading-relaxed text-neutral-600">
                  Categories and trends surface patterns—so “where did it go?” gets a real answer.
                </p>
              </div>
            </li>
            <li class="flex gap-5">
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm"
              >
                <ShieldCheck class="size-6" stroke-width="2" />
              </span>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900">Security you shouldn’t have to think about</h3>
                <p class="mt-1 text-sm leading-relaxed text-neutral-600">
                  Encryption and careful access controls—your money stories stay private to your people.
                </p>
              </div>
            </li>
            <li class="flex gap-5">
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 shadow-sm"
              >
                <Smartphone class="size-6" stroke-width="2" />
              </span>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900">Phone-first, because expenses don’t wait</h3>
                <p class="mt-1 text-sm leading-relaxed text-neutral-600">
                  Log splits on the spot—before the receipt fades and the details get fuzzy.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <SaasCard class="p-8 md:p-10">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-lg font-bold leading-snug text-neutral-900 md:text-xl">
                Financial clarity, not spreadsheet pain
              </p>
              <p class="mt-2 text-sm leading-relaxed text-neutral-600">
                See who drives spend, where it clusters, and what's still open—before it becomes tension.
              </p>
            </div>
            <span class="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Live</span>
          </div>
          <div class="mt-10 flex h-60 items-end justify-between gap-2 px-1">
            <div
              v-for="(h, i) in [32, 58, 42, 72, 48, 88, 52, 96, 38, 78]"
              :key="i"
              class="flex-1 rounded-t-md bg-gradient-to-t from-violet-600 via-violet-500 to-indigo-400 shadow-sm"
              :style="{ height: `${h}%` }"
            />
          </div>
          <div class="mt-6 flex justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </SaasCard>
      </div>
    </div>
  </section>
</template>
