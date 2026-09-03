# BrightBoard Admission Service

The Admission Service owns admission applications and review statuses. It runs on port `3011`, uses the `brightboard-admission` MongoDB database, and provides Swagger UI at `http://localhost:3011/api`.

It validates `appliedClassId` through class-subject-service before persisting an application. Approval currently updates only the admission record; automatic Student creation is intentionally deferred to a future cross-service integration.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3011/admissions -H "Content-Type: application/json" -d "{\"applicantFirstName\":\"Aarav\",\"applicantLastName\":\"Sharma\",\"dateOfBirth\":\"2015-04-20T00:00:00.000Z\",\"gender\":\"male\",\"guardianName\":\"Priya Sharma\",\"guardianContact\":\"+919876543210\",\"guardianEmail\":\"priya@example.com\",\"appliedClassId\":\"<class-id>\",\"documents\":[\"https://files.example.com/birth-certificate.pdf\"]}"
curl "http://localhost:3011/admissions?status=pending"
curl http://localhost:3011/admissions/<admission-id>
curl -X PATCH http://localhost:3011/admissions/<admission-id>/status -H "Content-Type: application/json" -d "{\"status\":\"approved\",\"reviewedBy\":\"<admin-id>\"}"
curl http://localhost:3011/health/admission
```

Run `npm run seed` to insert a placeholder sample admission after replacing its class ID and document URL.
