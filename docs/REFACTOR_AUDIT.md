# GearTech Refactor Audit

## Initial Condition (pre-refactor)
- Next.js 15.1.6, App Router, React 19, TypeScript, Tailwind v4.
- Products, categories, reels, governorates, bundle rules, settings all hardcoded in `src/data/products.ts`.
- Admin: client-side PIN gate (default `2026`), products stored in `localStorage` via Zustand; pricing calculator in-memory only.
- Checkout: client-side order creation (no persistence); WhatsApp number hardcoded `962790000000`.
- No database, no auth, no real inventory, no real media storage.
- Cart persisted in localStorage; no server validation of prices/stock.
- Design: dark cyberpunk cyan/red, glassmorphism, glow effects (to be refined to Carbon & Teal).
- Published at https://9qe.github.io/geartech/ (static export).

## Main Problems Discovered
1. No persistence — every business entity is hardcoded or localStorage.
2. No authentication — admin is a client-side PIN.
3. No server-side pricing/stock validation — client can manipulate totals.
4. Fake media (Unsplash URLs) shipped as product imagery.
5. Fake view counts, fake reviews, hardcoded WhatsApp number.
6. No real order persistence, no inventory movements, no audit log.
7. No multi-currency, no real shipping-rate management.
8. Design uses banned patterns: neon glows, cyan/red dual labels, glassmorphism everywhere.

## Functionality Preserved
- Bilingual AR/EN with RTL/LTR toggle.
- Cart + bundle configurator UX (reused, re-wired to server).
- GearBot AI concierge (deterministic engine kept as fallback; upstream keys optional).
- Product catalog content (migrated into DB seed, minus fake imagery).
- Jordan governorate list + delivery fee structure.

## Architecture Decisions
- Database: Prisma ORM. SQLite (file) for local dev persistence; Postgres for prod via `DATABASE_URL` (same schema, provider switch documented).
- Money: integer fils (1 JOD = 1000 fils) canonical; serialized to JOD decimals at API boundary.
- Auth: custom secure session (HttpOnly signed cookie via `jose`) + `bcryptjs` password hashing; bootstrap admin via CLI script from env.
- Validation: Zod.
- Storage: local persistent uploads in dev (`public/uploads`), S3-compatible abstraction documented for prod.
- Caching: Next.js cache tags invalidated on admin mutations.

## In Progress
See docs/IMPLEMENTATION_CHECKLIST.md.
