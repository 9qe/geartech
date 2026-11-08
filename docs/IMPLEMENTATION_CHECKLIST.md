# Implementation Checklist

## Phase 1 — Audit [DONE]
- [x] Inspected repo, git status clean, branch main
- [x] Created docs/REFACTOR_AUDIT.md, ARCHITECTURE.md, IMPLEMENTATION_CHECKLIST.md

## Phase 2 — Database [IN PROGRESS]
- [ ] Install Prisma + client
- [ ] Write schema.prisma (all entities)
- [ ] Initial migration
- [ ] Seed script (products, categories, governorates, bundle rules, settings)
- [ ] Money helpers (fils)

## Phase 3 — Auth
- [ ] bcryptjs + jose session
- [ ] Login route + Server Action
- [ ] Bootstrap CLI
- [ ] Middleware/route protection + server-side auth checks

## Phase 4 — Services
- [ ] Pricing/shipping/inventory/order services
- [ ] Zod validation schemas

## Phase 5 — Design system (Carbon & Teal)
- [ ] Refine tokens, remove banned patterns
- [ ] Official logo slot (public/brand/geartech-logo.png documented)

## Phase 6 — Storefront
- [ ] Products from DB (server components)
- [ ] Search (DB)
- [ ] Product detail
- [ ] Cart validated server-side
- [ ] Bundle configurator (DB rules)
- [ ] Checkout → persisted order + inventory
- [ ] WhatsApp receipt (configured number)

## Phase 7 — Admin portal
- [ ] Shell (sidebar/header)
- [ ] Dashboard (real metrics)
- [ ] Products CRUD + media upload
- [ ] Bundles & offers
- [ ] Reels & content CMS (hero)
- [ ] Orders + status + WhatsApp confirm + CSV export
- [ ] Shipping + settings

## Phase 8 — SEO/a11y/perf
- [ ] Metadata, sitemap, robots

## Phase 9 — Tests
- [ ] Unit (pricing, phone, money)
- [ ] Integration (CRUD, order)
- [ ] E2E (Playwright) — if feasible

## Phase 10 — Docs & run instructions
- [ ] .env.example complete
- [ ] README run steps
