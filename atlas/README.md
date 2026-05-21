# Atlas (demo slice)

This folder is a **small vertical slice** of a payouts-style wallet: a mobile-first web UI, JSON APIs, and a **double-entry ledger** stored in SQLite.

It exists to prove a few non-negotiables with code you can run locally:

- **Money is not IEEE floats**: amounts are handled as **minor-unit integers** (`bigint`) at the application boundary and stored as **digit strings** in SQLite to avoid floating point and to stay within Drizzle’s SQLite integer limits.
- **Idempotent transfers**: `POST /api/transfers` requires an `Idempotency-Key` header; duplicates return the same transfer outcome.
- **Ledger lines always balance** for a transfer: one debit and one credit for the same minor-unit amount.

## Run locally

```bash
cd atlas
npm install
npm run dev
```

Then open the site, use **Add demo money once** (development-only funding), and send a payment.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js dev server |
| `npm run build` | Production build (includes typecheck) |
| `npm test` | Ledger + idempotency tests (Vitest) |
| `npm run db:generate` | Regenerate SQL migrations from `src/db/schema.ts` |

## Environment flags

| Variable | Purpose |
| --- | --- |
| `DATABASE_PATH` | SQLite path (defaults to `./data/ledger.sqlite`; tests use `:memory:`) |
| `ATLAS_ALLOW_DEMO_FUND` | Set to `true` to allow `POST /api/demo-fund` in production builds |

## Known shortcuts (explicit)

- **Demo funding**: `POST /api/demo-fund` is a **non-production convenience** (or requires `ATLAS_ALLOW_DEMO_FUND=true`). Real products fund wallets via regulated inbound payments, not a magic endpoint.
- **Balance SQL uses SQLite `integer` casts** for summing digit strings. That is safe for typical wallet sizes, but it is not a substitute for a dedicated ledger database with wider numeric guarantees at extreme scale.
- **No rate limits / no auth** yet: this slice focuses on correctness of the ledger mechanics inside a trusted local demo.

## Evidence (what we verified)

- `npm test`
- `npm run build`
- `npm run lint`
