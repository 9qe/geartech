# GearTech — Free Deployment & Operations Guide

## Cost Audit (runtime)
- Next.js, React, TypeScript, Tailwind: MIT/Apache — free.
- Prisma ORM + SQLite: Apache 2.0 / free — no DB subscription.
- bcryptjs (MIT), jose (MIT), zod (MIT): free.
- framer-motion (MIT), lucide-react (ISC), zustand (MIT): free.
- AI concierge: deterministic engine by default; OpenAI/Anthropic only if you add keys (optional, not required).
- Storage: local filesystem (`public/uploads`). No S3/Cloudinary.
- Payments: COD + manual CliQ. No gateway fees.
- Analytics: computed from local DB. No GA.
- Email: not required (WhatsApp click-to-chat).
- Hosting: self-hosted. No paid host required.

## Local Development
```
npm install
cp .env.example .env
# edit .env: set SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate
npm run db:seed
npm run admin:bootstrap
npm run dev
```
Open http://localhost:3000

## Local Production Build
```
npm run build
npm start
```

## Database
- Path: prisma/dev.db (SQLite, persistent file)
- Migrations: prisma/migrations/
- Seed: npm run db:seed (idempotent)
- Backup: copy prisma/dev.db + public/uploads to a safe location.

## Admin Bootstrap
```
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='strong-password' npm run admin:bootstrap
```
Then open http://localhost:3000/admin/login

## Persistent Uploads
- Directory: public/uploads (gitignored)
- Created automatically on first upload.

## Optional Public Demo (GitHub Pages)
The published demo at https://9qe.github.io/geartech/ is a static export of the storefront (DB baked at build time). Admin/checkout server features require the Node app (`npm start`).

## Free Hosting Notes
- Render/Railway/Fly free tiers exist but require accounts and have sleep limits.
- For 24/7 free hosting, self-host on your own machine or a free VPS (Oracle Cloud Free Tier — requires account, not mandatory).
- Never use ephemeral serverless filesystem for the database.
