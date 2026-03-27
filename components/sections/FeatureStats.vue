<template>
  <section id="products" class="relative px-4 py-20 md:py-28">
    <div class="mx-auto max-w-7xl">
      <div class="mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between md:gap-12">
        <h2 class="max-w-xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 md:text-5xl lg:text-[3.25rem]">
          Every shared expense, live
        </h2>
        <div class="max-w-md shrink-0 space-y-5 md:text-right">
          <p class="text-neutral-600 md:ml-auto md:max-w-sm md:text-left">
            Log splits as they happen so balances stay accurate—no screenshots, no chasing people in group chat.
          </p>
          <GlowCtaButton to="/signup" size="md" class="shadow-md">
            See how it works
          </GlowCtaButton>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-12 md:gap-8">
        <SaasCard class="flex flex-col p-8 md:col-span-5 md:p-10">
          <p class="text-sm font-medium text-neutral-500">Active group</p>
          <h3 class="mt-1 text-2xl font-bold text-neutral-900">Trip · Lisbon</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-neutral-600">
            <li><span class="font-medium text-neutral-800">Travelers</span> — Split trips without receipt chaos.</li>
            <li><span class="font-medium text-neutral-800">Couples</span> — One clear picture of shared spend.</li>
            <li><span class="font-medium text-neutral-800">Roommates</span> — Rent and utilities, fairly tracked.</li>
            <li><span class="font-medium text-neutral-800">Teams</span> — Team outings reconciled in minutes.</li>
          </ul>
          <div class="mt-8">
            <div class="h-3 w-full overflow-hidden rounded-full bg-violet-100">
              <div class="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-500 to-pink-400" />
            </div>
            <div class="mt-3 flex justify-between text-xs font-medium text-neutral-500">
              <span>Trip budget on track</span>
              <span>72%</span>
            </div>
          </div>
          <p class="mt-10 text-3xl font-bold text-neutral-900">
            $840 <span class="text-base font-normal text-neutral-500">split this trip</span>
          </p>
        </SaasCard>

        <SaasCard class="p-8 md:col-span-7 md:p-10">
          <p class="text-sm font-medium text-neutral-500">Clarity</p>
          <h3 class="mt-1 text-2xl font-bold text-neutral-900">Spending, at a glance</h3>
          <div class="mt-10 flex h-56 items-end justify-between gap-2 px-1">
            <div
              v-for="(h, i) in [38, 62, 48, 92, 58, 78, 52, 88, 44, 70]"
              :key="i"
              class="flex-1 rounded-t-lg bg-gradient-to-t from-fuchsia-500 via-violet-500 to-sky-400 opacity-95 shadow-sm"
              :style="{ height: `${h}%` }"
            />
          </div>
        </SaasCard>
      </div>
    </div>
  </section>
</template>
