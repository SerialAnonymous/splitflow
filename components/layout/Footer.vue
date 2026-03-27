<script setup lang="ts">
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-vue-next'

const route = useRoute()

const footerNav = [
  { label: 'Home', href: '/#hero' },
  { label: 'About Us', href: '/#about' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'Products', href: '/#products' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/#blog' },
]

function isFooterNavActive(href: string) {
  if (href === '/pricing') return route.path === '/pricing'
  if (href.startsWith('/#')) {
    if (route.path !== '/') return false
    const wanted = href.slice(1)
    const current = route.hash && route.hash !== '#' ? route.hash : '#hero'
    return current === wanted
  }
  return route.path === href
}

const columns = [
  {
    title: 'Company',
    links: [
      { label: 'Security', href: '#' },
      { label: 'Brand Guidelines', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Career',
    links: [
      { label: 'Jobs', href: '#' },
      { label: 'News', href: '#' },
      { label: 'Hiring', href: '#' },
    ],
  },
  {
    title: 'Legal Information',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookies Policy', href: '#' },
    ],
  },
]

const social = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'X (Twitter)', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer id="footer-cta" class="relative mt-6 overflow-hidden bg-transparent px-4 pb-28 pt-20 md:px-8 md:pb-32 md:pt-28">
    <!-- Watermark (gradient + grain come from LayoutMarketingBackdrop on the page) -->
    <p
      class="pointer-events-none absolute bottom-0 left-1/2 z-0 -translate-x-1/2 translate-y-[18%] select-none whitespace-nowrap text-[clamp(4.5rem,20vw,14rem)] font-black uppercase leading-none text-black/5"
      aria-hidden="true"
    >
      SPLITFLOW.
    </p>

    <div class="relative z-10 mx-auto max-w-7xl">
      <!-- Top: CTA left, link columns right -->
      <div
        class="flex flex-col gap-12 border-b border-white/50 pb-14 md:gap-16 md:pb-20 lg:flex-row lg:items-start lg:justify-between"
      >
        <div class="max-w-lg space-y-6">
          <h3 class="text-2xl font-semibold leading-snug tracking-tight text-neutral-900 md:text-3xl md:leading-tight">
            Stop losing sleep over who paid what.
          </h3>
          <p class="text-sm leading-relaxed text-neutral-600 md:text-base">
            Bring your crew, your partner, or your team—SplitFlow makes shared money feel calm again.
          </p>
          <GlowCtaButton to="/signup" size="lg" class="px-6 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)]">
            Get SplitFlow free
          </GlowCtaButton>
        </div>

        <div class="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:gap-14 lg:pl-8">
          <div v-for="col in columns" :key="col.title">
            <p class="text-sm font-bold text-neutral-900">{{ col.title }}</p>
            <ul class="mt-4 space-y-3">
              <li v-for="item in col.links" :key="item.label">
                <a
                  :href="item.href"
                  class="text-sm text-neutral-600 transition hover:text-neutral-900"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Middle: wordmark | nav | social -->
      <div
        class="flex flex-col items-center gap-8 border-b border-white/45 py-10 md:flex-row md:justify-between md:gap-6 md:py-12"
      >
        <div class="shrink-0 text-center md:text-left">
          <NuxtLink
            to="/"
            class="text-lg font-bold tracking-tight text-neutral-900 md:text-xl"
          >
            SplitFlow.
          </NuxtLink>
          <p class="mt-1 max-w-xs text-xs leading-relaxed text-neutral-500 md:text-sm">
            Shared expenses, settled fairly—built for how real groups spend today.
          </p>
        </div>

        <nav
          aria-label="Footer"
          class="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <NuxtLink
            v-for="item in footerNav"
            :key="item.href + item.label"
            :to="item.href"
            :class="[
              'text-sm font-medium transition-colors',
              isFooterNavActive(item.href)
                ? 'rounded-full border border-neutral-900 bg-transparent px-4 py-2 text-neutral-900 hover:border-neutral-700'
                : 'px-2 py-2 text-neutral-600 hover:text-neutral-900',
            ]"
            :aria-current="isFooterNavActive(item.href) ? 'location' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex shrink-0 items-center gap-2.5">
          <a
            v-for="s in social"
            :key="s.label"
            :href="s.href"
            class="flex size-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-neutral-700 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:bg-white hover:text-neutral-900"
            :aria-label="s.label"
          >
            <component :is="s.icon" class="size-[18px]" stroke-width="2" />
          </a>
        </div>
      </div>

      <!-- Bottom bar -->
      <div
        class="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-neutral-500 md:flex-row md:pt-10"
      >
        <p>© {{ year }} SplitFlow. by Sans Brothers</p>
        <div class="flex flex-wrap justify-center gap-6 md:gap-8">
          <a href="#" class="transition hover:text-neutral-800">Terms & Conditions</a>
          <a href="#" class="transition hover:text-neutral-800">Privacy Policy</a>
        </div>
      </div>
    </div>
  </footer>
</template>
