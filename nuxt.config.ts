// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  plugins: [
    '~/plugins/supabase.ts',
    '~/plugins/auth-init.client.ts',
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'shadcn-nuxt',
  ],

  pinia: {
    storesDirs: ['./stores/**'],
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  runtimeConfig: {
    /** Server-only: Stripe subscription billing */
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    stripePriceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    stripePriceProYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
    stripePriceTeamMonthly: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? '',
    stripePriceTeamYearly: process.env.STRIPE_PRICE_TEAM_YEARLY ?? '',
    /** Server-only: Razorpay subscription billing */
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
    razorpayPlanProMonthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY ?? '',
    razorpayPlanProYearly: process.env.RAZORPAY_PLAN_PRO_YEARLY ?? '',
    razorpayPlanTeamMonthly: process.env.RAZORPAY_PLAN_TEAM_MONTHLY ?? '',
    razorpayPlanTeamYearly: process.env.RAZORPAY_PLAN_TEAM_YEARLY ?? '',
    /** Server-only: update `subscriptions` from payment webhooks (never expose to client) */
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
      /** Canonical site URL for Stripe/Razorpay return URLs (e.g. https://app.splitflow.com) */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? '',
    },
  },

  app: {
    head: {
      title: 'SplitFlow.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: 'Split expenses with friends and groups' },
        { name: 'theme-color', content: '#F7F2E7' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
})
