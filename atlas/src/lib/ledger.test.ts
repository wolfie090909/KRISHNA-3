import { describe, expect, it } from "vitest";

import { getDb } from "@/db/client";
import { postDemoFundSync } from "@/lib/demoFund";
import { LedgerError, postTransferSync } from "@/lib/ledger";

describe("ledger", () => {
  it("keeps debits and credits balanced for each transfer", () => {
    const db = getDb();
    postDemoFundSync(db, {
      holderKey: "alice",
      currency: "USD",
      amountMinor: 10_000n,
    });

    const result = postTransferSync(db, {
      fromHolderKey: "alice",
      toHolderKey: "bob",
      currency: "USD",
      amountMinor: 2_500n,
      idempotencyKey: "test-transfer-001",
    });

    expect(result.status).toBe("completed");
    expect(result.fromBalanceAfter).toBe(7_500n);
    expect(result.toBalanceAfter).toBe(2_500n);
  });

  it("replays safely when the idempotency key repeats", () => {
    const db = getDb();
    postDemoFundSync(db, {
      holderKey: "carol",
      currency: "USD",
      amountMinor: 5_000n,
    });

    const first = postTransferSync(db, {
      fromHolderKey: "carol",
      toHolderKey: "dan",
      currency: "USD",
      amountMinor: 1_000n,
      idempotencyKey: "idem-repeat-1",
    });

    const second = postTransferSync(db, {
      fromHolderKey: "carol",
      toHolderKey: "dan",
      currency: "USD",
      amountMinor: 1_000n,
      idempotencyKey: "idem-repeat-1",
    });

    expect(first.transferId).toBe(second.transferId);
    expect(second.status).toBe("replayed");
    expect(second.fromBalanceAfter).toBe(first.fromBalanceAfter);
    expect(second.toBalanceAfter).toBe(first.toBalanceAfter);
  });

  it("refuses sends when funds are too low", () => {
    const db = getDb();
    postDemoFundSync(db, {
      holderKey: "erin",
      currency: "USD",
      amountMinor: 100n,
    });

    expect(() =>
      postTransferSync(db, {
        fromHolderKey: "erin",
        toHolderKey: "frank",
        currency: "USD",
        amountMinor: 500n,
        idempotencyKey: "insufficient-1",
      }),
    ).toThrow(LedgerError);
  });
});
