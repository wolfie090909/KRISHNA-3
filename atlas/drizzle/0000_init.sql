CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`holder_key` text NOT NULL,
	`currency` text NOT NULL,
	`created_at_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_holder_currency_uidx` ON `accounts` (`holder_key`,`currency`);--> statement-breakpoint
CREATE TABLE `ledger_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`transfer_id` text NOT NULL,
	`account_id` text NOT NULL,
	`side` text NOT NULL,
	`amount_minor` text NOT NULL,
	`currency` text NOT NULL,
	FOREIGN KEY (`transfer_id`) REFERENCES `transfers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`idempotency_key` text NOT NULL,
	`from_account_id` text NOT NULL,
	`to_account_id` text NOT NULL,
	`amount_minor` text NOT NULL,
	`currency` text NOT NULL,
	`created_at_ms` integer NOT NULL,
	FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transfers_idempotency_key_unique` ON `transfers` (`idempotency_key`);