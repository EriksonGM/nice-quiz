CREATE TABLE `game_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`start_time` text,
	`end_time` text,
	`duration` integer DEFAULT 600 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `player_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`answer_id` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`points_earned` integer DEFAULT 0 NOT NULL,
	`answered_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`session_id` integer,
	`total_score` integer DEFAULT 0 NOT NULL,
	`questions_answered` integer DEFAULT 0 NOT NULL,
	`correct_answers` integer DEFAULT 0 NOT NULL,
	`joined_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`answer` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_answers`("id", "question_id", "answer", "is_correct") SELECT "id", "question_id", "answer", "is_correct" FROM `answers`;--> statement-breakpoint
DROP TABLE `answers`;--> statement-breakpoint
ALTER TABLE `__new_answers` RENAME TO `answers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `questions` ADD `difficulty` text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `category` text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `points` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;