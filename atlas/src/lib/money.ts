const ISO4217_ALPHA = /^[A-Z]{3}$/;

/** Minor-units amount as bigint; currency is tracked separately. */
export type MinorAmount = bigint;

export function assertIso4217Alpha(currency: string): string {
  const upper = currency.trim().toUpperCase();
  if (!ISO4217_ALPHA.test(upper)) {
    throw new MoneyValidationError(
      "Currency must be a 3-letter ISO 4217 code, like USD or EUR.",
    );
  }
  return upper;
}

export function parsePositiveMinorAmount(raw: string): MinorAmount {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new MoneyValidationError(
      "Amount must be a whole number of the smallest currency unit (for example, cents).",
    );
  }
  const value = BigInt(trimmed);
  if (value <= 0n) {
    throw new MoneyValidationError("Amount must be greater than zero.");
  }
  return value;
}

export class MoneyValidationError extends Error {
  readonly code = "MONEY_VALIDATION";

  constructor(message: string) {
    super(message);
    this.name = "MoneyValidationError";
  }
}
