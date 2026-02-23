# AutoCase AI: Structured RWE & Monetization

## Tech Stack
Next.js 15, TypeScript, Prisma (PostgreSQL), SMART on FHIR API, Claude SDK, Stripe API, Solana Web3.js.

## Prioritized Tasks
- [x] TASK-1: Initialize Next.js project with Tailwind and Prisma ORM.
- [x] TASK-2: Create OMOP-compliant database schema (Models: `Patient`, `ClinicalEvent`, `Consent`, `Physician`).
- [x] TASK-3: Build the SMART on FHIR webhook listener to flag rare oncology cases.
- [x] TASK-4: Develop patient e-consent portal with cryptographic hash logging via Solana.
- [x] TASK-5: Build LLM service to de-identify EMR text and map it to structured OMOP formats.
- [x] TASK-6: Build the Physician Kanban Dashboard for human-in-the-loop review.
- [x] TASK-7: Develop Stripe-integrated API gateway for B2B pharmaceutical RWE queries.
- [x] TASK-8: Create smart contract module for instant micro-royalty token distribution.

## Schema Notes
- Use the hybrid OMOP Next.js Prisma Schema provided in schema.prisma.
- OMOP v5.4 core + Oncology Module (ConditionOccurrence, DrugExposure, Measurement).
- Physician and Consent models extended with Solana wallet fields.

## Solana Notes
- Use `@solana/web3.js` and `@solana/spl-token` for USDC batch SPL token transfers.
- Do NOT write a custom Rust program; rely on standard SPL transfers + Memo program for consent attestation.
- Split: 20% Platform / 30% Physician / 50% Patients (equal per-capita).
