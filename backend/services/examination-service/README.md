# BrightBoard Examination Service

The Examination Service owns exams, online tests (`examType: online-test`), marks, calculated grades, and stable per-student result summaries. It runs on port `3006`, uses the `brightboard-examination` MongoDB database, and serves Swagger UI at `http://localhost:3006/api`.

It validates classes through class-subject-service and validates every student before marks are saved. Run those services before creating exams or entering marks.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3006/exams -H "Content-Type: application/json" -d "{\"name\":\"Mathematics Midterm\",\"classId\":\"<class-id>\",\"subjectId\":\"<subject-id>\",\"examDate\":\"2026-10-15T09:00:00.000Z\",\"maxMarks\":100,\"examType\":\"midterm\"}"
curl "http://localhost:3006/exams?classId=<class-id>&subjectId=<subject-id>"
curl -X POST http://localhost:3006/exams/<exam-id>/marks -H "Content-Type: application/json" -d "{\"marks\":[{\"studentId\":\"<student-id>\",\"marksObtained\":84,\"remarks\":\"Good progress\"}]}"
curl http://localhost:3006/results/student/<student-id>
curl http://localhost:3006/health/examination
```

`POST /exams/:id/marks` upserts one record per student and computes a grade from the percentage: A+ (90+), A (75+), B (60+), C (40+), or F. `GET /results/student/:studentId` returns `{ studentId, results, overallAveragePercentage }`, a stable HTTP contract intended for performance-service and dashboard-service.

To insert placeholder sample documents, run `npm run seed`.
