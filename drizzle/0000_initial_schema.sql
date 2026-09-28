CREATE TABLE `activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`matter_id` integer,
	`action` text NOT NULL,
	`detail` text,
	`actor` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `activity_matter_idx` ON `activity_log` (`matter_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `checklist_template_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stage_id` integer NOT NULL,
	`label` text NOT NULL,
	`guidance` text,
	`sort_order` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `checklist_template_stages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `template_items_stage_idx` ON `checklist_template_items` (`stage_id`);--> statement-breakpoint
CREATE TABLE `checklist_template_stages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`preferred_name` text,
	`date_of_birth` text,
	`address` text,
	`phone` text,
	`email` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matter_checklist_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`matter_id` integer NOT NULL,
	`template_item_id` integer,
	`stage_number` integer NOT NULL,
	`stage_name` text NOT NULL,
	`label` text NOT NULL,
	`guidance` text,
	`sort_order` integer NOT NULL,
	`is_custom` integer DEFAULT false NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`completed_by` text,
	`notes` text,
	`updated_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `matter_checklist_matter_idx` ON `matter_checklist_items` (`matter_id`,`stage_number`,`sort_order`);--> statement-breakpoint
CREATE TABLE `matters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` integer NOT NULL,
	`matter_number` text NOT NULL,
	`matter_type` text DEFAULT 'Will' NOT NULL,
	`description` text,
	`responsible_lawyer` text,
	`date_opened` text,
	`status` text DEFAULT 'New Instructions' NOT NULL,
	`urgency` text DEFAULT 'Normal' NOT NULL,
	`next_action` text,
	`next_action_due` text,
	`will_type` text,
	`existing_will_date` text,
	`previous_solicitor` text,
	`proposed_execution_date` text,
	`spouse_partner` text,
	`children` text,
	`other_beneficiaries` text,
	`family_notes` text,
	`is_sample` integer DEFAULT false NOT NULL,
	`updated_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `matters_matter_number_uq` ON `matters` (`matter_number`);--> statement-breakpoint
CREATE INDEX `matters_status_idx` ON `matters` (`status`);--> statement-breakpoint
CREATE INDEX `matters_client_idx` ON `matters` (`client_id`);