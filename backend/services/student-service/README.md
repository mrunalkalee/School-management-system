# BrightBoard Student Service

The Student Service owns student profiles and lifecycle data for BrightBoard. It runs independently on port `3001`, stores its data in its own MongoDB Atlas database, and exposes Swagger UI at `http://localhost:3001/api`.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

Create a student:

```bash
curl -X POST http://localhost:3001/students -H "Content-Type: application/json" -d "{\"firstName\":\"Aarav\",\"lastName\":\"Sharma\",\"email\":\"aarav.sharma@example.com\",\"rollNumber\":\"STU-001\"}"
```

List students, optionally filtered by `classId` and `search`:

```bash
curl "http://localhost:3001/students?classId=sample-class-1&search=Aarav"
```

Get one student:

```bash
curl http://localhost:3001/students/<student-id>
```

Update a student:

```bash
curl -X PATCH http://localhost:3001/students/<student-id> -H "Content-Type: application/json" -d "{\"section\":\"B\"}"
```

Soft-delete a student:

```bash
curl -X DELETE http://localhost:3001/students/<student-id>
```

Check service health:

```bash
curl http://localhost:3001/health/student
```
