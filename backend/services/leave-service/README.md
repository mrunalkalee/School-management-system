# BrightBoard Leave Service

The Leave Service owns student and teacher leave requests. It runs independently on port `3010`, uses the `brightboard-leave` MongoDB database, and exposes Swagger UI at `http://localhost:3010/api`.

On creation, it validates a student requester through student-service or a teacher requester through teacher-service. Review access is currently open and is explicitly marked for Admin-only authorization when auth-service is available.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3010/leave-requests -H "Content-Type: application/json" -d "{\"requesterId\":\"<student-id>\",\"requesterType\":\"student\",\"fromDate\":\"2026-10-10T00:00:00.000Z\",\"toDate\":\"2026-10-12T00:00:00.000Z\",\"reason\":\"Medical leave\"}"
curl "http://localhost:3010/leave-requests?requesterId=<student-id>&status=pending"
curl http://localhost:3010/leave-requests/<leave-request-id>
curl -X PATCH http://localhost:3010/leave-requests/<leave-request-id>/review -H "Content-Type: application/json" -d "{\"status\":\"approved\",\"reviewedBy\":\"<admin-id>\"}"
curl http://localhost:3010/health/leave
```

Run `npm run seed` to insert a placeholder sample request after replacing its requester ID.
