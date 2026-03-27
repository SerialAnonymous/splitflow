<template>
  <section id="hero" class="relative px-4 pb-24 pt-8 md:pb-32 md:pt-12">
    <div class="mx-auto max-w-5xl text-center">
      <h1
        class="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 md:text-6xl lg:text-[4.25rem]"
      >
        Shared money,<br class="hidden sm:block" />
        zero guesswork
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg">
        Track group spending, split fairly, settle fast—friends, couples, roommates, and teams without awkward
        math.
      </p>
      <GlowCtaButton to="/signup" size="lg" class="mt-10 shadow-xl shadow-neutral-900/15">
        Start free
      </GlowCtaButton>
      <p class="mt-4 text-center text-sm text-neutral-500">
        No credit card · Up and running in a minute
      </p>
    </div>

    <!-- Floating dashboard mockup -->
    <div class="mx-auto mt-14 max-w-6xl md:mt-20">
      <div>
        <SaasCard
          class="overflow-hidden border-white/70 bg-white/75 p-2 shadow-[0_24px_80px_-24px_rgba(124,58,237,0.18),0_20px_50px_-20px_rgba(0,0,0,0.12)] md:-translate-y-1 md:p-4 md:shadow-[0_32px_90px_-28px_rgba(124,58,237,0.22),0_24px_60px_-24px_rgba(0,0,0,0.14)]"
        >
          <div
            class="flex min-h-[300px] flex-col gap-4 rounded-[1.75rem] bg-gradient-to-br from-white via-pink-50/40 to-violet-50/50 p-4 ring-1 ring-white/80 md:min-h-[380px] md:flex-row md:p-6"
          >
            <div class="hidden w-[3.25rem] shrink-0 flex-col gap-2 rounded-2xl bg-white/70 p-2 shadow-sm md:flex">
              <div v-for="i in 5" :key="i" class="h-8 rounded-xl bg-gradient-to-br from-pink-200/70 to-violet-200/50" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-sm font-semibold text-neutral-800">Group balance</span>
                <div class="flex gap-2">
                  <span class="hidden h-8 w-20 rounded-full bg-white/80 shadow-sm sm:block" />
                  <span class="h-8 rounded-full bg-violet-600/90 px-4 text-xs font-semibold leading-8 text-white">
                    Settle up
                  </span>
                </div>
              </div>
              <div class="grid flex-1 gap-4 md:grid-cols-12">
                <!-- Donut 86% -->
                <div class="flex items-center justify-center rounded-2xl bg-white/65 p-5 shadow-sm md:col-span-4">
                  <div class="relative size-[7.5rem] md:size-36">
                    <div class="absolute inset-0 rounded-full border-[11px] border-pink-100" />
                    <div
                      class="absolute inset-0 rounded-full border-[11px] border-transparent border-t-violet-500 border-r-pink-400"
                      style="transform: rotate(-35deg)"
                    />
                    <span class="absolute inset-0 flex items-center justify-center text-3xl font-bold text-neutral-900">86%</span>
                  </div>
                </div>
                <!-- Line + bars -->
                <div class="flex flex-col justify-between gap-3 rounded-2xl bg-white/65 p-4 shadow-sm md:col-span-5">
                  <p class="text-xs font-medium text-neutral-500">Shared spend trend</p>
                  <div class="h-24 w-full">
                    <svg class="h-full w-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                      <defs>
                        <linearGradient id="heroLine" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.35" />
                          <stop offset="100%" stop-color="#a78bfa" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 45 Q 25 50, 40 38 T 80 42 T 120 22 T 160 28 T 200 12 L 200 60 L 0 60 Z"
                        fill="url(#heroLine)"
                      />
                      <path
                        d="M0 45 Q 25 50, 40 38 T 80 42 T 120 22 T 160 28 T 200 12"
                        fill="none"
                        stroke="#7c3aed"
                        stroke-width="2.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <div class="flex h-24 items-end justify-around gap-1.5 border-t border-neutral-100/80 pt-3">
                    <div class="w-5 rounded-t-md bg-gradient-to-t from-pink-400 to-pink-300" style="height: 42%" />
                    <div class="w-5 rounded-t-md bg-gradient-to-t from-violet-500 to-violet-400" style="height: 68%" />
                    <div class="w-5 rounded-t-md bg-gradient-to-t from-amber-400 to-amber-300" style="height: 52%" />
                    <div class="w-5 rounded-t-md bg-gradient-to-t from-blue-400 to-blue-300" style="height: 82%" />
                    <div class="w-5 rounded-t-md bg-gradient-to-t from-pink-400 to-pink-300" style="height: 36%" />
                  </div>
                </div>
                <div
                  class="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-300 to-amber-400 p-5 shadow-lg md:col-span-3"
                >
                  <span class="text-xs font-medium text-amber-950/70">You’re owed</span>
                  <span class="text-2xl font-bold tracking-tight text-amber-950 md:text-3xl">$186</span>
                  <span class="text-xs text-amber-950/60">Updated moments ago</span>
                </div>
              </div>
            </div>
          </div>
        </SaasCard>
      </div>

      <p class="mt-10 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Trusted by groups everywhere
      </p>
      <div
        class="mt-4 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50 grayscale contrast-125 md:gap-x-16"
      >
        <span class="text-base font-bold tracking-tight text-neutral-700">Boltshift</span>
        <span class="text-base font-bold tracking-tight text-neutral-700">Lightbox</span>
        <span class="text-base font-bold tracking-tight text-neutral-700">Sphere</span>
        <span class="text-base font-bold tracking-tight text-neutral-700">GlobalBank</span>
        <span class="text-base font-bold tracking-tight text-neutral-700">Nietzsche</span>
      </div>
    </div>
  </section>
</template>
