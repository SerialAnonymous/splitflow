<!-- Shared full-viewport gradient + visible film grain for marketing pages. -->
<script setup lang="ts">
/** SVG noise tiles; higher rect opacity + repeat = visible grain */
function grainDataUrl(noiseOpacity: string, baseFreq = '0.75') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <filter id="n" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="4" stitchTiles="stitch" result="t"/>
      <feColorMatrix type="saturate" values="0" in="t"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)" opacity="${noiseOpacity}"/>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const grainFine = grainDataUrl('0.22', '0.52')
const grainCoarse = grainDataUrl('0.14', '0.28')
</script>

<template>
  <div
    class="marketing-backdrop pointer-events-none fixed inset-0 z-0"
    aria-hidden="true"
  >
    <!-- Base: Warm Soft Cream → Light Peach → Primary Peach (lifted ~half step) -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-[#FFFBFA] via-[#FFF3EF] to-[#FFEADF]"
    />
    <!-- Softer Pink + Soft Glow variants (radial mesh, eased) -->
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_105%_68%_at_50%_100%,rgba(255,170,180,0.3),transparent_56%),radial-gradient(ellipse_95%_58%_at_12%_22%,rgba(255,210,190,0.3),transparent_52%),radial-gradient(ellipse_75%_52%_at_88%_18%,rgba(255,170,180,0.3),transparent_48%),radial-gradient(ellipse_60%_45%_at_50%_42%,rgba(255,210,190,0.18),transparent_55%)]"
    />
    <!-- Subtle grain under veils (still reads through) -->
    <div
      class="grain-tile absolute inset-0 opacity-50"
      :style="{
        backgroundImage: `url('${grainFine}')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '320px 320px',
      }"
    />
    <!-- Top lift: cream tint (not flat white) -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-[#FFFBFA]/45 via-transparent to-transparent"
    />
    <!-- Soft blobs: Primary Pink Glow + Primary Peach -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -left-32 -top-28 h-[34rem] w-[34rem] rounded-full bg-[#FFAAB4]/28 blur-[100px]" />
      <div class="absolute -right-28 top-[12%] h-[36rem] w-[36rem] rounded-full bg-[#FFD2BE]/36 blur-[100px]" />
      <div class="absolute bottom-[-12%] left-[18%] h-[30rem] w-[30rem] rounded-full bg-[#FFAAB4]/22 blur-[95px]" />
    </div>
    <!-- Top grain: fine (readable texture on light areas) -->
    <div
      class="grain-tile absolute inset-0 opacity-[0.65]"
      :style="{
        backgroundImage: `url('${grainFine}')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }"
    />
    <!-- Top grain: coarser pass + blend for paper / photo feel -->
    <div
      class="grain-tile absolute inset-0 opacity-45 mix-blend-soft-light"
      :style="{
        backgroundImage: `url('${grainCoarse}')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '440px 440px',
      }"
    />
    <div
      class="grain-tile absolute inset-0 opacity-35 mix-blend-multiply"
      :style="{
        backgroundImage: `url('${grainFine}')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '192px 192px',
      }"
    />
  </div>
</template>

<style scoped>
.marketing-backdrop * {
  pointer-events: none;
}
</style>
