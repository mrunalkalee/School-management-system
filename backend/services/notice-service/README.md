# BrightBoard Notice Service

The Notice Service owns school notices and events. It runs on port `3013`, uses the `brightboard-notice` MongoDB database, and serves Swagger UI at `http://localhost:3013/api`.

Class-subject-service is required only when creating a notice with `targetClassId`; general notices do not make an upstream call.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3013/notices -H "Content-Type: application/json" -d "{\"title\":\"School closed\",\"message\":\"Closed Friday.\",\"targetRole\":\"all\"}"
curl "http://localhost:3013/notices?targetRole=student&classId=<class-id>"
curl -X POST http://localhost:3013/events -H "Content-Type: application/json" -d "{\"title\":\"Annual Science Fair\",\"description\":\"Project showcase\",\"date\":\"2026-11-05T09:00:00.000Z\",\"location\":\"Main Auditorium\"}"
curl http://localhost:3013/events
curl http://localhost:3013/health/notice
```

Notice queries return only active notices: notices must target the requested role or `all`, target the requested class or no class, and have no expiry date (or one in the future). Events are sorted by date. Run `npm run seed` to add sample data.
