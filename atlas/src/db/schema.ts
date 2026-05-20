import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Wallet-style liability account: credits increase what the user can spend. */
export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    holderKey: text("holder_key").notNull(),
    /** ISO 4217 alphabetic code, uppercased (e.g. USD). */
    currency: text("currency").notNull(),
    createdAtMs: integer("created_at_ms").notNull(),
  },
  (table) => [
    uniqueIndex("accounts_holder_currency_uidx").on(
      table.holderKey,
      table.currency,
    ),
  ],
);

export const transfers = sqliteTable("transfers", {
  id: text("id").primaryKey(),
  /** Client-supplied idempotency key; UNIQUE enforces at-most-once execution. */
  idempotencyKey: text("idempotency_key").notNull().unique(),
  fromAccountId: text("from_account_id")
    .notNull()
    .references(() => accounts.id),
  toAccountId: text("to_account_id")
    .notNull()
    .references(() => accounts.id),
  /** Amount moved between the two accounts, as a decimal string of minor units (e.g. "2500"). */
  amountMinor: text("amount_minor").notNull(),
  currency: text("currency").notNull(),
  createdAtMs: integer("created_at_ms").notNull(),
});

export const ledgerLines = sqliteTable("ledger_lines", {
  id: text("id").primaryKey(),
  transferId: text("transfer_id")
    .notNull()
    .references(() => transfers.id),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  side: text("side", { enum: ["DEBIT", "CREDIT"] }).notNull(),
  /** Minor units as a decimal string of digits (e.g. "2500"). */
  amountMinor: text("amount_minor").notNull(),
  currency: text("currency").notNull(),
});

export type LedgerSide = "DEBIT" | "CREDIT";
