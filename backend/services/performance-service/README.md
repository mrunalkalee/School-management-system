# BrightBoard Performance Service

The Performance Service is a database-free HTTP aggregation service. It runs on port `3007`, has no MongoDB dependency or collection, and exposes Swagger UI at `http://localhost:3007/api`.

It requires attendance-service and examination-service to be running. Any failure from either upstream is returned as HTTP `503 Service Unavailable`.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API

```bash
curl http://localhost:3007/performance/student/<student-id>
curl http://localhost:3007/health/performance
```

`GET /performance/student/:studentId` calls both upstream services and returns:

```json
{
  "studentId": "<student-id>",
  "subjectWisePerformance": [
    {
      "subjectId": "<subject-id>",
      "subjectName": "<subject-id>",
      "averagePercentage": 82.5,
      "trend": "up"
    }
  ],
  "attendancePercentage": 92.31,
  "overallAveragePercentage": 81.25
}
```

`averagePercentage` is the average of the student's exam percentages for the subject. `trend` compares the most recent exam score with the previous one; it is `stable` when there is only one exam. The current examination-service response contains `subjectId` but no subject display name, so `subjectName` intentionally uses that stable ID as its fallback.
