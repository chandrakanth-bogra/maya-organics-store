-- The Next.js version of the store never went live; its tables are empty.
-- Drop them (children first) so the new schema can be created cleanly.
DROP TABLE IF EXISTS reviews;--> statement-breakpoint
DROP TABLE IF EXISTS cart_items;--> statement-breakpoint
DROP TABLE IF EXISTS order_items;--> statement-breakpoint
DROP TABLE IF EXISTS orders;--> statement-breakpoint
DROP TABLE IF EXISTS addresses;--> statement-breakpoint
DROP TABLE IF EXISTS coupons;--> statement-breakpoint
DROP TABLE IF EXISTS volume_discounts;--> statement-breakpoint
DROP TABLE IF EXISTS product_variants;--> statement-breakpoint
DROP TABLE IF EXISTS products;--> statement-breakpoint
DROP TABLE IF EXISTS session;--> statement-breakpoint
DROP TABLE IF EXISTS account;--> statement-breakpoint
DROP TABLE IF EXISTS verification;--> statement-breakpoint
DROP TABLE IF EXISTS user;
