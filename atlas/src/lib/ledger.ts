import { and, eq, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { randomUUID } from "node:crypto";

import * as schema from "@/db/schema";
import { accounts, ledgerLines, transfers } from "@/db/schema";
import type { MinorAmount } from "@/lib/money";

type Db = BetterSQLite3Database<typeof schema>;

export type PostTransferInput = {
  fromHolderKey: string;
  toHolderKey: string;
  currency: string;
  amountMinor: MinorAmount;
  idempotencyKey: string;
};

export type PostTransferResult =
  | {
      status: "completed";
      transferId: string;
      fromAccountId: string;
      toAccountId: string;
      fromBalanceAfter: MinorAmount;
      toBalanceAfter: MinorAmount;
    }
  | {
      status: "replayed";
      transferId: string;
      fromAccountId: string;
      toAccountId: string;
      fromBalanceAfter: MinorAmount;
      toBalanceAfter: MinorAmount;
    };

export class LedgerError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INSUFFICIENT_FUNDS"
      | "SAME_ACCOUNT"
      | "INVALID_IDEMPOTENCY_KEY",
  ) {
    super(message);
    this.name = "LedgerError";
  }
}

function nowMs(): number {
  return Date.now();
}

function getOrCreateAccount(
  tx: Db,
  holderKey: string,
  currency: string,
): { id: string; created: boolean } {
  const existing = tx
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(eq(accounts.holderKey, holderKey), eq(accounts.currency, currency)),
    )
    .limit(1)
    .all();

  if (existing.length > 0) {
    return { id: existing[0].id, created: false };
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
  return { id, created: true };
}

export function computeSignedBalance(tx: Db, accountId: string): MinorAmount {
  const row = tx
    .select({
      b: sql<string>`coalesce(
        sum(case when ${ledgerLines.side} = 'CREDIT' then cast(${ledgerLines.amountMinor} as integer) else -cast(${ledgerLines.amountMinor} as integer) end),
        0
      )`,
    })
    .from(ledgerLines)
    .where(eq(ledgerLines.accountId, accountId))
    .get();
  return BigInt(row?.b ?? "0");
}

export function postTransferSync(db: Db, input: PostTransferInput): PostTransferResult {
  const trimmedKey = input.idempotencyKey.trim();
  if (trimmedKey.length < 8 || trimmedKey.length > 128) {
    throw new LedgerError(
      "Use a unique idempotency key between 8 and 128 characters for every payment attempt.",
      "INVALID_IDEMPOTENCY_KEY",
    );
  }

  return db.transaction((tx) => {
    const existing = tx
      .select()
      .from(transfers)
      .where(eq(transfers.idempotencyKey, trimmedKey))
      .limit(1)
      .all();

    if (existing.length > 0) {
      const t = existing[0];
      return {
        status: "replayed",
        transferId: t.id,
        fromAccountId: t.fromAccountId,
        toAccountId: t.toAccountId,
        fromBalanceAfter: computeSignedBalance(tx, t.fromAccountId),
        toBalanceAfter: computeSignedBalance(tx, t.toAccountId),
      };
    }

    const fromAcc = getOrCreateAccount(tx, input.fromHolderKey, input.currency);
    const toAcc = getOrCreateAccount(tx, input.toHolderKey, input.currency);

    if (fromAcc.id === toAcc.id) {
      throw new LedgerError(
        "You cannot send money to the same wallet you are sending from.",
        "SAME_ACCOUNT",
      );
    }

    const fromBefore = computeSignedBalance(tx, fromAcc.id);
    if (fromBefore < input.amountMinor) {
      throw new LedgerError(
        "That amount is more than the available balance in this wallet.",
        "INSUFFICIENT_FUNDS",
      );
    }

    const transferId = randomUUID();
    const createdAt = nowMs();

    tx.insert(transfers)
      .values({
        id: transferId,
        idempotencyKey: trimmedKey,
        fromAccountId: fromAcc.id,
        toAccountId: toAcc.id,
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
          accountId: fromAcc.id,
          side: "DEBIT",
          amountMinor: input.amountMinor.toString(),
          currency: input.currency,
        },
        {
          id: randomUUID(),
          transferId,
          accountId: toAcc.id,
          side: "CREDIT",
          amountMinor: input.amountMinor.toString(),
          currency: input.currency,
        },
      ])
      .run();

    return {
      status: "completed",
      transferId,
      fromAccountId: fromAcc.id,
      toAccountId: toAcc.id,
      fromBalanceAfter: computeSignedBalance(tx, fromAcc.id),
      toBalanceAfter: computeSignedBalance(tx, toAcc.id),
    };
  });
}
