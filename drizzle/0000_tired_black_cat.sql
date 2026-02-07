CREATE TABLE `results` (
	`id` integer PRIMARY KEY NOT NULL,
	`watcher_id` integer,
	`content` text NOT NULL,
	`sources` text,
	`found_at` integer DEFAULT '"2026-02-07T10:49:12.649Z"',
	`is_read` integer DEFAULT false,
	FOREIGN KEY (`watcher_id`) REFERENCES `watchers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `watchers` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_email` text,
	`name` text NOT NULL,
	`query` text NOT NULL,
	`urls` text NOT NULL,
	`prompt` text,
	`schedule` text DEFAULT '0 * * * *',
	`status` text DEFAULT 'active',
	`last_run_at` integer,
	`created_at` integer DEFAULT '"2026-02-07T10:49:12.647Z"'
);
