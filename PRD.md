# AutoCase AI: Structured RWE & Monetization

## Tech Stack
Next.js 15, TypeScript, Prisma (PostgreSQL), SMART on FHIR API, Claude SDK, Stripe API, Solana Web3.js, React Inline Styles (for resilient rendering).

## Prioritized Tasks
- [x] TASK-1: Initialize Next.js project with Tailwind and Prisma ORM.
- [x] TASK-2: Create OMOP-compliant database schema (Models: `Patient`, `ClinicalEvent`, `Consent`, `Physician`).
- [x] TASK-3: Build the SMART on FHIR webhook listener to flag rare oncology cases.
- [x] TASK-4: Develop patient e-consent portal with cryptographic hash logging via Solana.
- [x] TASK-5: Build LLM service to de-identify EMR text and map it to structured OMOP formats.
- [x] TASK-6: Build the Physician Kanban Dashboard for human-in-the-loop review.
- [x] TASK-7: Develop Stripe-integrated API gateway for B2B pharmaceutical RWE queries.
- [x] TASK-8: Create smart contract module for instant micro-royalty token distribution.
- [x] TASK-9: Migrate all UI pages to React Inline Styles to prevent CSS purging/deployment styling issues.

## Schema Notes
- Use the hybrid OMOP Next.js Prisma Schema provided in schema.prisma.
- OMOP v5.4 core + Oncology Module (ConditionOccurrence, DrugExposure, Measurement).
- Physician and Consent models extended with Solana wallet fields.

## Deployment & Lessons Learned
- **CSS Purging**: Tailwind CSS utilities often failed to generate in Vercel production environments due to strict purging. **Lesson**: Use React Inline Styles (CSSProperties) for core platform UI to guarantee 100% rendering fidelity regardless of build pipeline.
- **Client/Server Balance**: Dashboard data fetched via Server Components for speed; Consent portal uses Client Components for interactive Web3 flows.
- **Micro-Royalties**: Revenue split (20% Platform / 30% Physician / 50% Patient) is calculated at the query layer and queued for Solana SPL transfers.
