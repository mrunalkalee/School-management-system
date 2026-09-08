# BrightBoard Dashboard Service

The Dashboard Service is a read-only HTTP aggregator. It owns no MongoDB collections and starts on port `3016`; Swagger UI is at `http://localhost:3016/api`.

Each upstream request is isolated. A failed dependency never fails the complete dashboard response: unavailable sections are returned as `null` or empty collections and `warnings` identifies the affected service. Student and parent dashboards require most BrightBoard services for complete data.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## Endpoints

```bash
curl http://localhost:3016/dashboard/student/<student-id>
curl http://localhost:3016/dashboard/parent/<student-id>
curl http://localhost:3016/dashboard/teacher/<teacher-id>
curl http://localhost:3016/dashboard/admin
curl http://localhost:3016/health/dashboard
```

No guards are installed yet. Role and parent/student ownership checks belong at auth-service or API gateway level once authentication is available.
