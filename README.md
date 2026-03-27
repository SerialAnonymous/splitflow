# SplitFlow

Splitwise-style expense sharing app. Nuxt 3 + Supabase.

## Setup

1. **Install dependencies**

   ```bash
   cd /Users/nayanjariwala/SplitFlow
   npm install
   ```

2. **Environment variables**

   Copy the example env and set your Supabase keys:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

   Get these from: **Supabase Dashboard → Project Settings → API**.

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- **Nuxt 3** – Vue 3 framework
- **TailwindCSS** – styling
- **shadcn-nuxt** – UI components (shadcn/vue)
- **Pinia** – state (e.g. `stores/auth.ts`)
- **Supabase** – auth, database, storage (`plugins/supabase.ts`)
- **VueUse** – utilities
- **Zod** – validation

## Project structure

```
/components     # Vue components (including shadcn ui/)
/composables    # Composables (e.g. useSupabase)
/stores         # Pinia stores (e.g. auth)
/utils          # Helpers
/pages          # Routes
/middleware     # Route middleware
/plugins        # supabase.ts, auth-init.client.ts
```

## Adding shadcn-vue components

After install, add UI components with the shadcn-vue CLI (from project root):

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
# etc.
```

Components are placed under `components/ui/` (see `components.json`).
