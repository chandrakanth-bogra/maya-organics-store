CREATE TABLE `price_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`field` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`changed_by` text NOT NULL,
	`changed_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `price_changes_sku` ON `price_changes` (`sku`,`changed_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`summary` text NOT NULL,
	`image` text NOT NULL,
	`hsn` text,
	`gst_rate` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`sku` text PRIMARY KEY NOT NULL,
	`product_slug` text NOT NULL,
	`grain_size` text,
	`pack_size` text NOT NULL,
	`weight_grams` integer,
	`price` integer NOT NULL,
	`mrp` integer,
	`stock` integer,
	`in_stock` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`amazon_skus` text,
	`catalogue_ids` text,
	`zoho_item_id` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`product_slug`) REFERENCES `products`(`slug`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `variants_product` ON `variants` (`product_slug`,`sort_order`);