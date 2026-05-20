CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(180) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`line1` text NOT NULL,
	`line2` text,
	`city` varchar(120) NOT NULL,
	`region` varchar(120),
	`country` varchar(80) NOT NULL DEFAULT 'Cameroun',
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`shopId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`imageUrl` text,
	`icon` varchar(64),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`shopId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(220) NOT NULL,
	`productImage` text,
	`unitPrice` int NOT NULL,
	`quantity` int NOT NULL,
	`subtotal` int NOT NULL,
	`shopAmount` int NOT NULL,
	`platformFee` int NOT NULL DEFAULT 0,
	`status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`dispatched` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`buyerId` int NOT NULL,
	`totalAmount` int NOT NULL,
	`shippingFee` int NOT NULL DEFAULT 0,
	`platformFee` int NOT NULL DEFAULT 0,
	`status` enum('pending','paid','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentProvider` varchar(32),
	`paymentIntentId` varchar(191),
	`shippingAddress` json,
	`billingInfo` json,
	`invoiceUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`categoryId` int,
	`name` varchar(220) NOT NULL,
	`slug` varchar(240) NOT NULL,
	`description` text,
	`kind` enum('product','service') NOT NULL DEFAULT 'product',
	`price` int NOT NULL,
	`comparePrice` int,
	`stock` int NOT NULL DEFAULT 0,
	`images` json NOT NULL DEFAULT ('[]'),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`sold` int NOT NULL DEFAULT 0,
	`views` int NOT NULL DEFAULT 0,
	`isFlashDeal` boolean NOT NULL DEFAULT false,
	`flashEndsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`logoUrl` text,
	`coverUrl` text,
	`city` varchar(120),
	`region` varchar(120),
	`categoryId` int,
	`phone` varchar(32),
	`email` varchar(320),
	`plan` enum('basic','vip') NOT NULL DEFAULT 'basic',
	`vipExpiresAt` timestamp,
	`status` enum('pending','active','suspended') NOT NULL DEFAULT 'active',
	`rating` decimal(3,2) NOT NULL DEFAULT '0.00',
	`reviewsCount` int NOT NULL DEFAULT 0,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shops_id` PRIMARY KEY(`id`),
	CONSTRAINT `shops_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`plan` enum('basic','vip') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','active','expired','cancelled') NOT NULL DEFAULT 'pending',
	`paymentIntentId` varchar(191),
	`startedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`phone` varchar(32),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`shopId` int NOT NULL,
	`orderId` int,
	`type` enum('credit','debit','withdrawal','refund','fee') NOT NULL,
	`amount` int NOT NULL,
	`balanceAfter` int NOT NULL,
	`description` text,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`pending` int NOT NULL DEFAULT 0,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalWithdrawn` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_shopId_unique` UNIQUE(`shopId`)
);
