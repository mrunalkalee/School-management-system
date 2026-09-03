# BrightBoard Certificate Service

The Certificate Service owns records of issued student certificates. It runs on port `3012`, uses the `brightboard-certificate` MongoDB database, and exposes Swagger UI at `http://localhost:3012/api`.

It validates each student through student-service before issuing a certificate or listing their certificates. `fileUrl` is a placeholder URL only; PDF generation and cloud storage are deliberately out of scope for this phase.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3012/certificates -H "Content-Type: application/json" -d "{\"studentId\":\"<student-id>\",\"type\":\"bonafide\",\"fileUrl\":\"https://files.example.com/bonafide.pdf\",\"issuedBy\":\"<issuer-id>\"}"
curl http://localhost:3012/certificates/student/<student-id>
curl http://localhost:3012/certificates/<certificate-id>
curl http://localhost:3012/health/certificate
```

Certificate types are `id-card`, `bonafide`, and `transfer`. Run `npm run seed` to add a placeholder sample certificate after replacing its IDs and URL.
