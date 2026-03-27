<script setup lang="ts">
import type { BillingDetails } from '~/stores/subscription'

const billing = defineModel<BillingDetails>({ required: true })

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
]

const inputClass =
  'mt-1.5 w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm font-medium text-neutral-900 shadow-inner outline-none backdrop-blur-sm transition duration-200 placeholder:text-neutral-400 focus:border-violet-300/80 focus:bg-white/70 focus:ring-2 focus:ring-violet-200/60'
const labelClass = 'text-xs font-semibold uppercase tracking-wide text-neutral-500'
</script>

<template>
  <GlassCard class="p-6 md:p-8">
    <h3 class="text-lg font-bold text-neutral-900">Billing details</h3>
    <p class="mt-1 text-sm text-neutral-600">Used for receipts and tax localization.</p>

    <div class="mt-6 space-y-5">
      <div>
        <label :class="labelClass" for="checkout-full-name">Full name</label>
        <input
          id="checkout-full-name"
          v-model="billing.fullName"
          type="text"
          autocomplete="name"
          :class="inputClass"
          placeholder="Jordan Lee"
        />
      </div>
      <div>
        <label :class="labelClass" for="checkout-email">Email</label>
        <input
          id="checkout-email"
          v-model="billing.email"
          type="email"
          autocomplete="email"
          :class="inputClass"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label :class="labelClass" for="checkout-country">Country</label>
        <select id="checkout-country" v-model="billing.country" :class="inputClass">
          <option v-for="c in countries" :key="c.code" :value="c.code">
            {{ c.name }}
          </option>
        </select>
      </div>
      <div>
        <label :class="labelClass" for="checkout-promo">Promo code (optional)</label>
        <input
          id="checkout-promo"
          v-model="billing.promoCode"
          type="text"
          :class="inputClass"
          placeholder="Enter a code"
        />
      </div>
    </div>
  </GlassCard>
</template>
