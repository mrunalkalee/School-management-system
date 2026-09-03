# BrightBoard Attendance Service

The Attendance Service owns daily student attendance for BrightBoard. It runs independently on port `3005`, stores data in the `brightboard-attendance` MongoDB database, and exposes Swagger UI at `http://localhost:3005/api`.

Before bulk marking attendance, it validates the class through Class & Subject Service and each student through Student Service over HTTP. Those services must be running for `POST /attendance`.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

Bulk mark attendance (records are upserted by student and date):

```bash
curl -X POST http://localhost:3005/attendance -H "Content-Type: application/json" -d "{\"classId\":\"<class-id>\",\"date\":\"2026-09-03\",\"records\":[{\"studentId\":\"<student-id>\",\"status\":\"present\"}],\"markedBy\":\"<marker-id>\"}"
```

List attendance, get a student's stable history summary, or update one record:

```bash
curl "http://localhost:3005/attendance?classId=<class-id>&date=2026-09-03"
curl http://localhost:3005/attendance/student/<student-id>
curl -X PATCH http://localhost:3005/attendance/<attendance-id> -H "Content-Type: application/json" -d "{\"status\":\"leave\"}"
```

Check service health:

```bash
curl http://localhost:3005/health/attendance
```

To insert the placeholder sample document after replacing its IDs, run `npm run seed`.
