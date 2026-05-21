import { and, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { randomUUID } from "node:crypto";

import * as schema from "@/db/schema";
import { accounts, ledgerLines, transfers } from "@/db/schema";
import { computeSignedBalance } from "@/lib/ledger";
import type { MinorAmount } from "@/lib/money";

type Db = BetterSQLite3Database<typeof schema>;

const TREASURY_HOLDER = "system:treasury";

function nowMs(): number {
  return Date.now();
}

function getOrCreateAccount(
  tx: Db,
  holderKey: string,
  currency: string,
): string {
  const existing = tx
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(eq(accounts.holderKey, holderKey), eq(accounts.currency, currency)),
    )
    .limit(1)
    .all();

  if (existing.length > 0) {
    return existing[0].id;
  }

  const id = randomUUID();
  tx.insert(accounts)
    .values({
      id,
      holderKey,
      currency,
      createdAtMs: nowMs(),
    })
    .run();
  return id;
}

export type DemoFundResult =
  | { status: "completed"; transferId: string; balanceAfter: MinorAmount }
  | { status: "replayed"; transferId: string; balanceAfter: MinorAmount };

/** One-time demo credit per holder + currency, backed by the internal treasury account. */
export function postDemoFundSync(
  db: Db,
  input: { holderKey: string; currency: string; amountMinor: MinorAmount },
): DemoFundResult {
  const idempotencyKey = `demo_fund:${input.holderKey}:${input.currency}`;

  return db.transaction((tx) => {
    const existing = tx
      .select()
      .from(transfers)
      .where(eq(transfers.idempotencyKey, idempotencyKey))
      .limit(1)
      .all();

    if (existing.length > 0) {
      const t = existing[0];
      return {
        status: "replayed",
        transferId: t.id,
        balanceAfter: computeSignedBalance(tx, t.toAccountId),
      };
    }

    const treasuryId = getOrCreateAccount(tx, TREASURY_HOLDER, input.currency);
    const userId = getOrCreateAccount(tx, input.holderKey, input.currency);

    const transferId = randomUUID();
    const createdAt = nowMs();

    tx.insert(transfers)
      .values({
        id: transferId,
        idempotencyKey,
        fromAccountId: treasuryId,
        toAccountId: userId,
        amountMinor: input.amountMinor.toString(),
        currency: input.currency,
        createdAtMs: createdAt,
      })
      .run();

    tx.insert(ledgerLines)
      .values([
        {
          id: randomUUID(),
          transferId,
          accountId: treasuryId,
          side: "DEBIT",
          amountMinor: input.amountMinor.toString(),
          currency: input.currency,
        },
        {
          id: randomUUID(),
          transferId,
          accountId: userId,
          side: "CREDIT",
          amountMinor: input.amountMinor.toString(),
          currency: input.currency,
        },
      ])
      .run();

    return {
      status: "completed",
      transferId,
      balanceAfter: computeSignedBalance(tx, userId),
    };
  });
}
