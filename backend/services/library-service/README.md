# BrightBoard Library Service

The Library Service owns the book catalog and borrower issue history. It runs independently on port `3014`, uses the `brightboard-library` MongoDB database, and provides Swagger UI at `http://localhost:3014/api`.

Book issuing validates the borrower through student-service or teacher-service. It atomically decrements availability so no issue is created when all copies are checked out. Returns restore availability and calculate a fine of ₹5 for each late day.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3014/library/books -H "Content-Type: application/json" -d "{\"title\":\"The Alchemist\",\"author\":\"Paulo Coelho\",\"isbn\":\"9780061122415\",\"category\":\"Fiction\",\"totalCopies\":5}"
curl "http://localhost:3014/library/books?search=alchemist"
curl -X POST http://localhost:3014/library/issue -H "Content-Type: application/json" -d "{\"bookId\":\"<book-id>\",\"borrowerId\":\"<student-id>\",\"borrowerType\":\"student\",\"dueDate\":\"2026-10-20T00:00:00.000Z\"}"
curl -X PATCH http://localhost:3014/library/return/<issue-id>
curl http://localhost:3014/library/student/<student-id>
curl http://localhost:3014/health/library
```

Run `npm run seed` to add placeholder sample data after replacing the borrower ID.
