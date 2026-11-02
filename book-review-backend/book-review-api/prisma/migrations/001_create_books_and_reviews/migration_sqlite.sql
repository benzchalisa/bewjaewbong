-- ============================================================
-- Book Review System — SQLite Migration
-- ============================================================
-- Prisma schema → hand-written SQLite DDL
-- Compatible with: SQLite 3.x
-- Run with:  sqlite3 dev.db < migration_sqlite.sql
-- ============================================================

-- -----------------------------------------------
-- 1. Books
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS "Book" (
    "id"          INTEGER   NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title"       TEXT      NOT NULL,
    "author"      TEXT      NOT NULL,
    "publishedAt" DATETIME  NOT NULL DEFAULT (datetime('now')),
    "coverUrl"    TEXT
);

-- -----------------------------------------------
-- 2. Reviews
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS "Review" (
    "id"      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating"  INTEGER NOT NULL,
    "content" TEXT    NOT NULL,
    "bookId"  INTEGER NOT NULL,

    CONSTRAINT "Review_bookId_fkey"
        FOREIGN KEY ("bookId") REFERENCES "Book" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Index on bookId for faster lookups
CREATE INDEX IF NOT EXISTS "Review_bookId_idx" ON "Review" ("bookId");
