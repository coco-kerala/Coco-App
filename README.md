# COCO — Coconut Care Platform

Hyperlocal coconut plucking and care. Premium, mobile-first PWA with Customer, Worker, and Admin interfaces.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

On `/login`, pick a role:

| Role | Sample user | Route |
|------|-------------|-------|
| Customer | Ananya Menon | `/customer` |
| Worker | Ravi Kumar | `/worker` |
| Admin | Priya Thomas | `/admin` |

Demo data persists in `localStorage`. Reset from Customer Profile or Admin Settings.

## Core loop

1. Customer requests coconut plucking  
2. Admin assigns a worker  
3. Worker updates status → completes with photos  
4. Customer confirms & rates  

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS 4  
- Supabase-ready (Auth, Postgres, Storage, Realtime, RLS)  
- PWA via service worker + web manifest

## Supabase setup (optional)

The app runs fully in **demo mode** without Supabase.

1. Create a Supabase project  
2. Copy `.env.example` → `.env.local` and fill keys  
3. Run `supabase/schema.sql` then `supabase/rls.sql` in the SQL editor  
4. Create a public Storage bucket `job-photos`  
5. Enable Realtime for `service_requests` and `jobs` (included in schema)

## Pricing

```ts
base_price + (tree_count × per_tree_price)
// default: ₹200 + ₹150/tree
```

Configured in `src/lib/pricing.ts` (admin panel ready to extend).

## Project structure

```
src/app/customer   Customer PWA
src/app/worker     Worker PWA
src/app/admin      Admin dashboard
src/components     Reusable UI
src/lib/data       Sample data + local store
supabase/          Schema + RLS
```

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # serve production
```
