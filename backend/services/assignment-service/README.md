# BrightBoard Assignment Service

The Assignment Service owns assignments, student submissions, and grading. It runs independently on port `3008`, uses the `brightboard-assignment` MongoDB database, and exposes Swagger UI at `http://localhost:3008/api`.

It validates classes through class-subject-service when assignments are created, and students through student-service when submissions are made or dashboard assignments are requested.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3008/assignments -H "Content-Type: application/json" -d "{\"title\":\"Algebra problem set 3\",\"description\":\"Complete questions 1 through 20.\",\"classId\":\"<class-id>\",\"subjectId\":\"<subject-id>\",\"teacherId\":\"<teacher-id>\",\"dueDate\":\"2026-10-20T23:59:00.000Z\"}"
curl "http://localhost:3008/assignments?classId=<class-id>&subjectId=<subject-id>"
curl -X POST http://localhost:3008/assignments/<assignment-id>/submit -H "Content-Type: application/json" -d "{\"studentId\":\"<student-id>\",\"submissionText\":\"My completed work\"}"
curl -X PATCH http://localhost:3008/submissions/<submission-id>/grade -H "Content-Type: application/json" -d "{\"grade\":\"A\",\"feedback\":\"Excellent work\"}"
curl http://localhost:3008/assignments/student/<student-id>
curl http://localhost:3008/health/assignment
```

`GET /assignments/student/:studentId` returns the stable dashboard contract `{ studentId, classId, assignments }`. Each item includes `assignment`, `submission` (or `null`), and `submissionStatus`, which is `pending` when the student has not submitted work.

Run `npm run seed` to insert placeholder sample documents after replacing their IDs.
