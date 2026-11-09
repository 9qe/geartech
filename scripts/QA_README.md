# GearTech — Automated QA Regressions

`npm run qa` runs `scripts/qa-regression.mts` (tsx) against the SQLite DB at `prisma/dev.db`.

## What is covered

1. **Delivery configuration (12 governorates)**
   - Exactly 12 governorates exist; no `Salt` row (Salt is a locality of Balqa).
   - Every shipping rate has `isConfigured: true`.
   - Fees: Amman 2.00 JOD (2000 fils), Zarqa/Balqa/Madaba 2.50 JOD, all others 3.00 JOD.

2. **Transactional order pipeline (server-authoritative money)**
   - Creates a 3 × 10.00 JOD bundle-eligible cart (subtotal 30.00 JOD).
   - Asserts server-side bundle discount 7.50 JOD (3-units 25% rule from `bundleRule`).
   - Asserts delivery 0.00 JOD because discounted subtotal ≥ free-shipping threshold.
   - Asserts final total 22.50 JOD (22500 fils) — matches the masked Phase 3 bug scenario.
   - Asserts the returned receipt (read back from the DB after commit) matches the order:
     same total, itemized items with unit prices, persisted governorate.
   - Re-reads the order row independently and asserts total/items persistence.

3. **Reject paths (fail closed)**
   - Unknown governorate rejected.
   - Unknown product id rejected.
   - Empty cart rejected.

Notes:
- The suite is idempotent; every run creates a uniquely keyed QA order
  (`QA REGRESSION SUITE` notes, `idempotencyKey: "qa-regression-<ts>"`).
- Run it locally only — it mutates `prisma/dev.db` on purpose (creates identified
  test records).
