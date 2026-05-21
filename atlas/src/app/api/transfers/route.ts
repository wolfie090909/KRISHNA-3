import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db/client";
import { LedgerError, postTransferSync } from "@/lib/ledger";
import { MoneyValidationError, assertIso4217Alpha, parsePositiveMinorAmount } from "@/lib/money";

const bodySchema = z.object({
  fromHolderKey: z.string().min(1).max(128),
  toHolderKey: z.string().min(1).max(128),
  currency: z.string().min(3).max(3),
  amountMinor: z.string().regex(/^\d+$/),
});

function jsonError(
  status: number,
  code: string,
  message: string,
  extras?: Record<string, unknown>,
) {
  return NextResponse.json({ error: { code, message, ...extras } }, { status });
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey) {
    return jsonError(
      400,
      "missing_idempotency_key",
      "Add an Idempotency-Key header so we never move money twice by accident.",
    );
  }

  let parsedBody: z.infer<typeof bodySchema>;
  try {
    const json: unknown = await request.json();
    parsedBody = bodySchema.parse(json);
  } catch {
    return jsonError(
      400,
      "invalid_body",
      "Send JSON with fromHolderKey, toHolderKey, currency (3 letters), and amountMinor (digits only).",
    );
  }

  let currency: string;
  let amountMinor: bigint;
  try {
    currency = assertIso4217Alpha(parsedBody.currency);
    amountMinor = parsePositiveMinorAmount(parsedBody.amountMinor);
  } catch (err) {
    if (err instanceof MoneyValidationError) {
      return jsonError(400, err.code, err.message);
    }
    throw err;
  }

  try {
    const db = getDb();
    const result = postTransferSync(db, {
      fromHolderKey: parsedBody.fromHolderKey.trim(),
      toHolderKey: parsedBody.toHolderKey.trim(),
      currency,
      amountMinor,
      idempotencyKey,
    });

    return NextResponse.json({
      status: result.status,
      transferId: result.transferId,
      fromAccountId: result.fromAccountId,
      toAccountId: result.toAccountId,
      fromBalanceAfter: result.fromBalanceAfter.toString(),
      toBalanceAfter: result.toBalanceAfter.toString(),
    });
  } catch (err) {
    if (err instanceof LedgerError) {
      const status =
        err.code === "INSUFFICIENT_FUNDS"
          ? 409
          : err.code === "SAME_ACCOUNT"
            ? 400
            : 400;
      return jsonError(status, err.code, err.message);
    }
    throw err;
  }
}
