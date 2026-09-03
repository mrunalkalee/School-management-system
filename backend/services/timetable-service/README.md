# BrightBoard Timetable Service

The Timetable Service owns class day schedules for BrightBoard. It runs independently on port `3004`, stores its data in the `brightboard-timetable` MongoDB database, and exposes Swagger UI at `http://localhost:3004/api`.

It validates class IDs through Class & Subject Service and teacher IDs through Teacher Service over HTTP. Those services must be running for timetable create operations and for updates that change a class or periods.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

Create a timetable:

```bash
curl -X POST http://localhost:3004/timetables -H "Content-Type: application/json" -d "{\"classId\":\"<class-id>\",\"dayOfWeek\":\"Monday\",\"periods\":[{\"periodNumber\":1,\"subjectId\":\"<subject-id>\",\"teacherId\":\"<teacher-id>\",\"startTime\":\"09:00\",\"endTime\":\"09:45\"}]}"
```

List, get, update, or delete timetables:

```bash
curl "http://localhost:3004/timetables?classId=<class-id>&day=Monday"
curl http://localhost:3004/timetables/<timetable-id>
curl -X PATCH http://localhost:3004/timetables/<timetable-id> -H "Content-Type: application/json" -d "{\"periods\":[{\"periodNumber\":1,\"subjectId\":\"<subject-id>\",\"teacherId\":\"<teacher-id>\",\"startTime\":\"10:00\",\"endTime\":\"10:45\"}]}"
curl -X DELETE http://localhost:3004/timetables/<timetable-id>
```

Check service health:

```bash
curl http://localhost:3004/health/timetable
```

To insert the placeholder sample document after replacing its IDs, run `npm run seed`.
