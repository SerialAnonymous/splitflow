<script setup lang="ts">
import type { PaymentProviderChoice } from '~/stores/subscription'
import { Smartphone } from 'lucide-vue-next'

const provider = defineModel<PaymentProviderChoice>({ required: true })

onMounted(() => {
  provider.value = 'razorpay'
})
</script>

<template>
  <GlassCard class="p-6 md:p-8">
    <h3 class="text-lg font-bold text-neutral-900">Payment method</h3>
    <p class="mt-1 text-sm text-neutral-600">Razorpay checkout (UPI, wallets, netbanking, and cards).</p>

    <div
      class="mt-6 rounded-2xl border border-violet-400/70 bg-gradient-to-br from-violet-50/80 to-pink-50/50 p-4 shadow-[0_8px_28px_-12px_rgba(124,58,237,0.2)] md:p-5"
    >
      <div class="flex items-start gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-white/80 text-violet-700 shadow-sm">
          <Smartphone class="size-5" stroke-width="2" />
        </div>
        <div>
          <p class="font-semibold text-neutral-900">Razorpay</p>
          <p class="mt-1 text-xs leading-relaxed text-neutral-600">
            UPI, wallets, netbanking, and cards via hosted secure payment page.
          </p>
        </div>
      </div>
    </div>

    <p class="mt-5 flex items-center gap-2 text-xs text-neutral-500">
      <span class="size-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
      Secure payments powered by Razorpay.
    </p>
  </GlassCard>
</template>
