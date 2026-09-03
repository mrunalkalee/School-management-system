# BrightBoard Class & Subject Service

The Class & Subject Service owns classes, class-to-student membership, and subjects for BrightBoard. It runs independently on port `3003`, stores data in its own MongoDB Atlas database, and exposes Swagger UI at `http://localhost:3003/api`. It validates teachers through Teacher Service and students through Student Service over HTTP; both services must be running for those operations.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

Create a class:

```bash
curl -X POST http://localhost:3003/classes -H "Content-Type: application/json" -d "{\"name\":\"Grade 10\",\"section\":\"A\",\"academicYear\":\"2026-2027\",\"classTeacherId\":\"<teacher-id>\"}"
```

List or get classes:

```bash
curl http://localhost:3003/classes
curl http://localhost:3003/classes/<class-id>
```

Update or delete a class:

```bash
curl -X PATCH http://localhost:3003/classes/<class-id> -H "Content-Type: application/json" -d "{\"section\":\"B\"}"
curl -X DELETE http://localhost:3003/classes/<class-id>
```

Assign students to a class:

```bash
curl -X POST http://localhost:3003/classes/<class-id>/assign-students -H "Content-Type: application/json" -d "{\"studentIds\":[\"<student-id>\"]}"
```

Create, list, get, update, or delete subjects:

```bash
curl -X POST http://localhost:3003/subjects -H "Content-Type: application/json" -d "{\"name\":\"Mathematics\",\"code\":\"MATH-10-A\",\"classId\":\"<class-id>\"}"
curl "http://localhost:3003/subjects?classId=<class-id>"
curl http://localhost:3003/subjects/<subject-id>
curl -X PATCH http://localhost:3003/subjects/<subject-id> -H "Content-Type: application/json" -d "{\"name\":\"Advanced Mathematics\"}"
curl -X DELETE http://localhost:3003/subjects/<subject-id>
```

Check service health:

```bash
curl http://localhost:3003/health/class-subject
```
