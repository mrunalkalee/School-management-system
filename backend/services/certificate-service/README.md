# BrightBoard Certificate Service

The Certificate Service manages certificate applications for students and teachers. Applicants request a type, an administrator approves or rejects it, and approved requests become issued certificates. It runs on port `3012` and exposes Swagger UI at `http://localhost:3012/api`.

It validates each student through student-service before issuing a certificate or listing their certificates. `fileUrl` is a placeholder URL only; PDF generation and cloud storage are deliberately out of scope for this phase.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3012/certificates/requests -H "x-user-role: student" -H "x-linked-profile-id: <student-id>" -H "Content-Type: application/json" -d "{\"type\":\"bonafide\"}"
curl -X PATCH http://localhost:3012/certificates/requests/<request-id>/review -H "x-user-role: admin" -H "Content-Type: application/json" -d "{\"status\":\"approved\"}"
curl -H "x-user-role: admin" http://localhost:3012/certificates/requests
curl http://localhost:3012/health/certificate
```

Certificate types are `id-card`, `bonafide`, and `transfer`. Run `npm run seed` to add a placeholder approved certificate after replacing its IDs and URL.
