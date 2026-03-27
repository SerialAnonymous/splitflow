<script setup lang="ts">
definePageMeta({
  layout: 'app',
})

await navigateTo('/settings', { replace: true })
</script>

<template>
  <p class="py-20 text-center text-sm text-neutral-500">Redirecting to settings…</p>
</template>
