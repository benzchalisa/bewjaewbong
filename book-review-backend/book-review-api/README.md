# Book Review API

NestJS REST API backed by Prisma and SQLite. The production database and uploaded
covers are stored in Docker volumes; schema changes are applied with Prisma
migrations on container startup.

## Run locally

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

The API listens on `http://localhost:3000`. For a local PowerShell session,
configure the runtime environment before starting NestJS (Nest does not load
`.env` files by itself):

```powershell
$env:DATABASE_URL = 'file:./dev.db'
$env:FRONTEND_ORIGIN = 'http://localhost:3001'
$env:API_PUBLIC_URL = 'http://localhost:3000'
$env:UPLOAD_DIR = 'uploads'
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/books` | Create a book |
| GET | `/books` | List books with nested reviews |
| GET | `/books/:id` | Get a book with reviews |
| PATCH | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book and its reviews |
| POST | `/books/:bookId/reviews` | Create a review |
| GET | `/books/:bookId/reviews` | List reviews |
| PATCH | `/books/:bookId/reviews/:reviewId` | Update a review |
| DELETE | `/books/:bookId/reviews/:reviewId` | Delete a review |
| POST | `/books/upload` | Upload a JPG, PNG, or WebP cover (max 5 MB) |
| GET | `/uploads/:filename` | Retrieve an uploaded cover |
| GET | `/health` | Container health check |

Book titles/authors and review content must not be empty. Review ratings must be
integers from 1 to 5. Updating a review is scoped to its book.
