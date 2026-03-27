<script setup lang="ts">
import type { Component } from 'vue'
import { BookOpen, CircleDollarSign, Home, Info, Menu, Package, Star, X } from 'lucide-vue-next'

const route = useRoute()

type NavLink = { label: string; href: string; icon: Component }

const links: NavLink[] = [
  { label: 'Home', href: '/#hero', icon: Home },
  { label: 'About Us', href: '/#about', icon: Info },
  { label: 'Reviews', href: '/#reviews', icon: Star },
  { label: 'Products', href: '/#products', icon: Package },
  { label: 'Pricing', href: '/pricing', icon: CircleDollarSign },
  { label: 'Blog', href: '/#blog', icon: BookOpen },
]

function isNavActive(href: string) {
  if (href === '/pricing') return route.path === '/pricing'
  if (href.startsWith('/#')) {
    if (route.path !== '/') return false
    const wanted = href.slice(1)
    const current = route.hash && route.hash !== '#' ? route.hash : '#hero'
    return current === wanted
  }
  if (href.startsWith('/')) return route.path === href
  return false
}

const mobileMenuOpen = ref(false)

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

const linkClass = (href: string) => {
  const base =
    'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4'
  const state = isNavActive(href) ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
  return [base, state]
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-white/15 bg-transparent backdrop-blur-xl"
  >
    <div class="relative mx-auto max-w-7xl px-4 py-3 md:px-8 md:py-4">
      <div
        class="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="shrink-0 justify-self-start text-lg font-bold tracking-tight text-zinc-900"
          @click="closeMobileMenu"
        >
          SplitFlow.
        </NuxtLink>

        <!-- Desktop: full pill (header is sticky top-0; overflow-x-clip on layout/body lets it work) -->
        <nav class="hidden justify-self-center md:block" aria-label="Main">
          <div
            class="flex flex-wrap items-center justify-center gap-0.5 rounded-full bg-zinc-900 px-1.5 py-1.5 shadow-sm sm:gap-1 lg:flex-nowrap"
          >
            <template v-for="l in links" :key="l.href">
              <NuxtLink
                :to="l.href"
                :class="linkClass(l.href)"
              >
                <component
                  v-if="isNavActive(l.href)"
                  :is="l.icon"
                  class="size-4 shrink-0"
                  stroke-width="2"
                />
                {{ l.label }}
              </NuxtLink>
            </template>
          </div>
        </nav>

        <!-- Auth (desktop) -->
        <div class="hidden items-center justify-end gap-5 justify-self-end md:flex">
          <NuxtLink
            to="/login"
            class="text-sm font-medium text-zinc-900 transition hover:text-zinc-600"
          >
            Sign In
          </NuxtLink>
          <GlowCtaButton
            to="/signup"
            variant="glass"
            size="md"
            class="h-10 min-h-10 px-6 font-medium"
          >
            Sign up Free
          </GlowCtaButton>
        </div>

        <!-- Mobile: Sign up + hamburger -->
        <div class="flex shrink-0 items-center gap-2 md:hidden">
          <GlowCtaButton
            to="/signup"
            variant="glass"
            size="md"
            class="h-10 min-h-10 shrink-0 px-4 text-xs font-semibold sm:text-sm"
            @click="closeMobileMenu"
          >
            Sign up Free
          </GlowCtaButton>
          <button
            type="button"
            class="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full border border-zinc-900 bg-white/15 text-zinc-800 backdrop-blur-md"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-nav-menu"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu v-if="!mobileMenuOpen" class="size-5" />
            <X v-else class="size-5" />
          </button>
        </div>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileMenuOpen"
          id="mobile-nav-menu"
          class="absolute left-0 right-0 top-full z-[60] mt-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl md:hidden"
        >
          <NuxtLink
            to="/login"
            class="block rounded-xl px-3 py-3 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            @click="closeMobileMenu"
          >
            Sign In
          </NuxtLink>
          <ul class="mt-2 flex flex-col gap-0.5 border-t border-zinc-100 pt-3">
            <li v-for="l in links" :key="`menu-${l.href}`">
              <NuxtLink
                :to="l.href"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                @click="closeMobileMenu"
              >
                <component :is="l.icon" class="size-4 shrink-0 text-zinc-500" stroke-width="2" />
                {{ l.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </header>
</template>
