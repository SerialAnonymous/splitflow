<script setup lang="ts">
import AppNavbar from '~/components/navigation/AppNavbar.vue'
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-clip font-sans text-neutral-900 antialiased">
    <LayoutMarketingBackdrop />

    <div class="relative z-10 flex min-h-screen flex-col">
      <AppNavbar />

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
        <slot />
      </main>
    </div>
  </div>
</template>
