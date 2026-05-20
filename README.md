# KRISHNA-3

GAME CHANGER — storefront static site (Bootstrap).

## Atlas wallet demo (payments direction)

A **demo-only** consumer wallet shell lives in `wallet/`. It is not connected to processors, banks, or real balances.

- **Docs**: `docs/atlas-payouts-vertical-slice.md` (goal, blast radius, threat notes, shortcuts).
- **Run money unit tests** (Node 18+): `node --test wallet/money.test.mjs`
- **Open locally**: `wallet/index.html` in a browser (ES modules require `http` server for some environments; `npx serve .` works).

This repo currently mixes the Krishna Mobiles marketing site with an early **Atlas** payouts UX experiment. Splitting into separate deployables is a follow-up when the payments program graduates from static demo.
