# BookShelf — Book Review Platform

Next.js frontend, NestJS REST API, Prisma migrations, and SQLite are packaged to
run together with Docker Compose. Book data and uploaded cover images persist in
named Docker volumes.

## Download the BookShelf project

The BookShelf frontend and backend are in the
[MANAPHAT56/web GitHub repository](https://github.com/MANAPHAT56/web). Clone the
repository or download its ZIP, then run Docker Compose from the repository root
where `docker-compose.yml` is located:

```powershell
git clone https://github.com/MANAPHAT56/web.git
Set-Location web
```

The API source is under `book-review-backend/book-review-api/`; the Next.js
frontend is under `book-review-frontend/book-review-frontend (Unzipped Files)/`.
The HTML walkthrough is `index.html`.

## Requirements

- Docker Desktop with Docker Compose
- Ports `3000` (API) and `3001` (web) available

## Start the full stack (Windows PowerShell)

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Open the frontend at <http://localhost:3001>. The API is at
<http://localhost:3000>; check <http://localhost:3000/health> for readiness.
The API container applies committed Prisma migrations before it starts serving
requests.

To stop the app while preserving data:

```powershell
docker compose down
```

To remove the database and uploaded covers as well, run
`docker compose down --volumes`. This permanently deletes the persisted data.

View logs with `docker compose logs -f api frontend`.

## Verify the CRUD API and database

The web UI supports create, read, update, and delete for both books and reviews.
The API endpoints are:

| Method | Path | Operation |
|---|---|---|
| POST / GET | `/books` | Create / list books |
| GET / PATCH / DELETE | `/books/:id` | Read / update / delete a book |
| POST / GET | `/books/:bookId/reviews` | Create / list reviews |
| PATCH / DELETE | `/books/:bookId/reviews/:reviewId` | Update / delete a review |
| POST | `/books/upload` | Upload a JPG, PNG, or WebP cover (max 5 MB) |
| GET | `/uploads/:filename` | Retrieve an uploaded cover |

Example PowerShell session:

```powershell
$book = Invoke-RestMethod -Method Post http://localhost:3000/books `
  -ContentType 'application/json' `
  -Body '{"title":"Docker Test","author":"API Check"}'

$review = Invoke-RestMethod -Method Post "http://localhost:3000/books/$($book.id)/reviews" `
  -ContentType 'application/json' `
  -Body '{"rating":5,"content":"Created through the API"}'

Invoke-RestMethod -Method Patch "http://localhost:3000/books/$($book.id)" `
  -ContentType 'application/json' -Body '{"title":"Updated Docker Test"}'
Invoke-RestMethod -Method Patch "http://localhost:3000/books/$($book.id)/reviews/$($review.id)" `
  -ContentType 'application/json' -Body '{"rating":4}'

# Read the actual SQLite rows from inside the API container.
docker compose exec api node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.book.findUnique({where:{id:$($book.id)},include:{reviews:true}}).then(x=>console.log(JSON.stringify(x))).finally(()=>p.\$disconnect())"

Invoke-RestMethod -Method Delete "http://localhost:3000/books/$($book.id)/reviews/$($review.id)"
Invoke-RestMethod -Method Delete "http://localhost:3000/books/$($book.id)"
```

The Prisma read in the example checks the row in SQLite itself, not just the
HTTP response. `docker compose down` followed by `docker compose up -d` keeps
the database volume and its records.

## Project layout

```text
book-review-backend/book-review-api/
  prisma/schema.prisma
  prisma/migrations/             SQLite schema migration
  src/books/                     Book CRUD endpoints
  src/reviews/                   Review CRUD endpoints
  src/uploads.controller.ts      Cover upload and retrieval
  Dockerfile
book-review-frontend/book-review-frontend (Unzipped Files)/
  src/app/                       Next.js pages
  src/components/                Book and review forms
  src/lib/api.ts                 Frontend API client
  Dockerfile
docker-compose.yml
```

## Run without Docker (optional)

Use Node.js 20 or newer. In one terminal:

```powershell
Set-Location 'book-review-backend\book-review-api'
npm ci
$env:DATABASE_URL = 'file:./dev.db'
$env:FRONTEND_ORIGIN = 'http://localhost:3001'
$env:API_PUBLIC_URL = 'http://localhost:3000'
$env:UPLOAD_DIR = 'uploads'
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

In another terminal:

```powershell
Set-Location 'book-review-frontend\book-review-frontend (Unzipped Files)'
npm ci
npm run dev
```

The frontend's `.env.local` points to `http://localhost:3000` by default.
