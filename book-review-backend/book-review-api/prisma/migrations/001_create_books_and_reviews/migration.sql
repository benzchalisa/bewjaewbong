-- SQLite migration matching prisma/schema.prisma.
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverUrl" TEXT
);

CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    CONSTRAINT "Review_bookId_fkey"
        FOREIGN KEY ("bookId") REFERENCES "Book" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Review_bookId_idx" ON "Review" ("bookId");
