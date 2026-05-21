import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db/client";
import { postDemoFundSync } from "@/lib/demoFund";
import { MoneyValidationError, assertIso4217Alpha, parsePositiveMinorAmount } from "@/lib/money";

const bodySchema = z.object({
  holderKey: z.string().min(1).max(128),
  currency: z.string().min(3).max(3),
  amountMinor: z.string().regex(/^\d+$/).optional(),
});

function allowDemoFunding(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ATLAS_ALLOW_DEMO_FUND === "true"
  );
}

export async function POST(request: Request) {
  if (!allowDemoFunding()) {
    return NextResponse.json(
      {
        error: {
          code: "demo_funding_disabled",
          message: "Demo funding is turned off in this environment.",
        },
      },
      { status: 403 },
    );
  }

  let parsedBody: z.infer<typeof bodySchema>;
  try {
    const json: unknown = await request.json();
    parsedBody = bodySchema.parse(json);
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_body",
          message: "Send JSON with holderKey, currency, and optional amountMinor (digits only).",
        },
      },
      { status: 400 },
    );
  }

  let currency: string;
  let amountMinor: bigint;
  try {
    currency = assertIso4217Alpha(parsedBody.currency);
    amountMinor = parsePositiveMinorAmount(
      parsedBody.amountMinor ?? "100000",
    );
  } catch (err) {
    if (err instanceof MoneyValidationError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 400 },
      );
    }
    throw err;
  }

  const db = getDb();
  const result = postDemoFundSync(db, {
    holderKey: parsedBody.holderKey.trim(),
    currency,
    amountMinor,
  });

  return NextResponse.json({
    status: result.status,
    transferId: result.transferId,
    balanceAfter: result.balanceAfter.toString(),
  });
}
