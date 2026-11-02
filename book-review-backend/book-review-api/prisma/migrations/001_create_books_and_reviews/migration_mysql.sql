-- ============================================================
-- Book Review System — MySQL Migration
-- ============================================================
-- Prisma schema → hand-written MySQL DDL
-- Compatible with: MySQL 5.7+ / MariaDB 10.3+
-- ============================================================

-- -----------------------------------------------
-- 1. Books
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `Book` (
    `id`          INT          NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255) NOT NULL,
    `author`      VARCHAR(255) NOT NULL,
    `publishedAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `coverUrl`    TEXT,

    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- 2. Reviews
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `Review` (
    `id`      INT     NOT NULL AUTO_INCREMENT,
    `rating`  INT     NOT NULL,
    `content` TEXT    NOT NULL,
    `bookId`  INT     NOT NULL,

    PRIMARY KEY (`id`),

    CONSTRAINT `Review_bookId_fkey`
        FOREIGN KEY (`bookId`) REFERENCES `Book` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index on bookId for faster lookups
CREATE INDEX `Review_bookId_idx` ON `Review` (`bookId`);
