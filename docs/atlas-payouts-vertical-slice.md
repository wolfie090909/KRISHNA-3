# Atlas payouts — first vertical slice (repo)

## Goal (one sentence)

Ship a deployable, demo-only consumer “send money” surface that treats money as minor-unit integers, exposes a single primary action, and documents how this repo will grow toward a regulated payouts platform.

## Blast radius

- **New paths only**: `wallet/*`, `docs/*`, root `README.md`, optional `script.js` fix for the existing storefront.
- **No** changes to monetary rails, no backend, no PCI scope, no PII persistence.
- **Risk if misunderstood**: someone could confuse the demo for production money movement.

## Definition of done (this slice)

- [x] Amount math uses `BigInt` minor units end-to-end in the wallet module; display formatting avoids float composition where unsafe (fallback path documented in code for huge values).
- [x] Each submit shows a fresh idempotency key (client-generated UUID) to model request semantics.
- [x] Single primary action on the screen: **Send now**.
- [x] Loading, success, and error states for the send path; balance empty state avoided by seeded demo balance.
- [x] Automated tests for parsing/formatting (`node --test`).
- [x] Mobile-first layout; minimum 48px touch targets; visible focus outlines; `prefers-reduced-motion` respected.

## 10-line design note

1. **Data**: `balanceMinor: bigint`, user input as decimal string → `parseDecimalStringToMinor` → `bigint`.
2. **API**: none in this slice; future REST will require `Idempotency-Key` header + unique DB constraint.
3. **Ledger**: future dedicated double-entry service; this demo only adjusts one bigint in memory.
4. **Failure modes**: invalid input, insufficient balance, network (future) — surfaced as plain language.
5. **Migration**: static files only; no DB migrations yet.
6. **Rollout**: static hosting; add link from marketing site when product is real.
7. **Rollback**: delete `wallet/` route or unlink.
8. **Threat model (top 3 for this slice)**: (1) XSS via recipient/name — mitigated by no `innerHTML` and textContent only; (2) user confusion demo vs prod — mitigated by copy and README; (3) weak randomness for idem — mitigated by `crypto.randomUUID` when available.

## SHORTCUT

Full checklist in the product prompt (KYC vendors, OPA, OWASP ASVS L2, multi-region, etc.) is **not** implemented here; this slice is an intentional **UI + money-type + test** foundation. Cleanup = tracked in future issues when backend exists.

## Reflect

Surprise: `Intl.NumberFormat` still wants a Number for formatting — we constrain magnitude for the safe path and fall back to fixed-point string formatting for oversized integers.

Next: introduce a real API boundary with server-enforced idempotency and a double-entry ledger module before adding authentication.
