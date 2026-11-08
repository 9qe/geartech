# GearTech Architecture

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript 5.7
- Tailwind CSS v4 (design tokens in globals.css / tailwind theme)
- Prisma ORM + SQLite (dev) / Postgres (prod)
- Zod validation
- bcryptjs password hashing
- jose signed HttpOnly session cookies
- Zustand (client cart state, hydrated from server-validated data)

## Data Flow
- Server Components read from Prisma directly (no internal fetch).
- Mutations via Server Actions + Route Handlers (uploads, exports, chat).
- Every privileged action re-checks the session server-side.
- Prices/discounts/shipping computed server-side in `lib/pricing`; client displays only.

## Money
- Stored as integer `fils` (1 JOD = 1000 fils) in DB.
- Helper `lib/money.ts`: toFils / fromFils / formatJOD.
- All totals computed in fils, serialized as JOD decimals at boundary.

## Auth
- Session: signed JWT in HttpOnly, Secure (prod), SameSite=Lax cookie, 7-day TTL.
- Passwords: bcrypt (cost 12).
- Bootstrap: `npm run admin:bootstrap` reads ADMIN_EMAIL/ADMIN_PASSWORD from env.
- Roles: SUPER_ADMIN, MANAGER.

## Storage
- `lib/storage.ts` abstraction: `saveFile(buffer, mime)` → local path in dev; S3 in prod (env-driven).
- Uploads validated for MIME/size/content; stored under `public/uploads/`.

## Caching
- Catalog: `revalidateTag("products")` etc.; invalidated on admin mutations.
- Cart/checkout/admin: dynamic, no shared cache.
