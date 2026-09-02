# BrightBoard Teacher Service

The Teacher Service owns teacher profiles, qualifications, and handled-subject data for BrightBoard. It runs independently on port `3002`, stores its data in its own MongoDB Atlas database, and exposes Swagger UI at `http://localhost:3002/api`.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

Create a teacher:

```bash
curl -X POST http://localhost:3002/teachers -H "Content-Type: application/json" -d "{\"firstName\":\"Meera\",\"lastName\":\"Iyer\",\"email\":\"meera.iyer@example.com\",\"subjectsHandled\":[\"Mathematics\"]}"
```

List teachers, optionally with a search term:

```bash
curl "http://localhost:3002/teachers?search=Meera"
```

Get one teacher:

```bash
curl http://localhost:3002/teachers/<teacher-id>
```

Update a teacher:

```bash
curl -X PATCH http://localhost:3002/teachers/<teacher-id> -H "Content-Type: application/json" -d "{\"subjectsHandled\":[\"Mathematics\",\"Physics\"]}"
```

Soft-delete a teacher:

```bash
curl -X DELETE http://localhost:3002/teachers/<teacher-id>
```

Check service health:

```bash
curl http://localhost:3002/health/teacher
```
