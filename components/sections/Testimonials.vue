<template>
  <section id="reviews" class="relative px-4 py-20 md:py-28">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col items-center justify-center gap-6 text-center md:flex-row md:flex-wrap md:gap-8">
        <h2 class="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl lg:text-[2.75rem]">
          Loved by people who split everything
        </h2>
        <GlowCtaButton to="/signup" size="md" class="shadow-md">
          More stories
        </GlowCtaButton>
      </div>

      <div class="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-8">
        <SaasCard class="overflow-hidden p-0">
          <div class="grid gap-0 md:grid-cols-[minmax(0,7.5rem)_1fr] md:items-start">
            <div
              class="flex flex-col justify-center border-b border-neutral-200/60 bg-gradient-to-br from-pink-50/80 to-violet-50/50 px-8 py-10 md:border-b-0 md:border-r"
            >
              <p class="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">52K+</p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">People splitting smarter</p>
            </div>
            <div class="flex flex-col justify-between p-8 md:min-h-[220px] md:p-10">
              <p class="text-base leading-relaxed text-neutral-600 md:text-lg">
                “We stopped screenshotting Venmo. One balance everyone trusts—game changer for our trips.”
              </p>
              <div class="mt-8 flex items-center gap-4 border-t border-neutral-100 pt-6">
                <div class="size-12 shrink-0 rounded-full bg-gradient-to-br from-pink-300 to-violet-500 ring-2 ring-white shadow-md" />
                <div>
                  <p class="font-semibold text-neutral-900">Maya Okonkwo</p>
                  <p class="text-sm text-neutral-500">Product designer · frequent traveler</p>
                </div>
              </div>
            </div>
          </div>
        </SaasCard>

        <SaasCard class="overflow-hidden p-0">
          <div class="grid gap-0 md:grid-cols-[minmax(0,7.5rem)_1fr] md:items-start">
            <div
              class="flex flex-col justify-center border-b border-neutral-200/60 bg-gradient-to-br from-orange-50/90 to-amber-50/50 px-8 py-10 md:border-b-0 md:border-r"
            >
              <p class="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">$18M+</p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Expenses tracked</p>
            </div>
            <div class="flex flex-col justify-between p-8 md:min-h-[220px] md:p-10">
              <p class="text-base leading-relaxed text-neutral-600 md:text-lg">
                “Roommate math used to ruin Sundays. Now rent, utilities, and groceries just… make sense.”
              </p>
              <div class="mt-8 flex items-center gap-4 border-t border-neutral-100 pt-6">
                <div class="size-12 shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 ring-2 ring-white shadow-md" />
                <div>
                  <p class="font-semibold text-neutral-900">Jordan Reeves</p>
                  <p class="text-sm text-neutral-500">Engineer · roommates of four</p>
                </div>
              </div>
            </div>
          </div>
        </SaasCard>

        <SaasCard class="overflow-hidden p-0">
          <div class="grid gap-0 md:grid-cols-[minmax(0,7.5rem)_1fr] md:items-start">
            <div
              class="flex flex-col justify-center border-b border-neutral-200/60 bg-gradient-to-br from-sky-50/90 to-cyan-50/50 px-8 py-10 md:border-b-0 md:border-r"
            >
              <p class="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">$6.2M</p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Balances settled</p>
            </div>
            <div class="flex flex-col justify-between p-8 md:min-h-[220px] md:p-10">
              <p class="text-base leading-relaxed text-neutral-600 md:text-lg">
                “Our team offsites finally have a paper trail. Finance is happy; the squad is still friends.”
              </p>
              <div class="mt-8 flex items-center gap-4 border-t border-neutral-100 pt-6">
                <div class="size-12 shrink-0 rounded-full bg-gradient-to-br from-sky-300 to-cyan-500 ring-2 ring-white shadow-md" />
                <div>
                  <p class="font-semibold text-neutral-900">Samira Patel</p>
                  <p class="text-sm text-neutral-500">Startup founder · 12-person team</p>
                </div>
              </div>
            </div>
          </div>
        </SaasCard>
      </div>
    </div>
  </section>
</template>
