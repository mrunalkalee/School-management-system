# BrightBoard Transport Service

The Transport Service owns bus routes and each student's current bus allocation. It runs independently on port `3015`, uses the `brightboard-transport` MongoDB database, and provides Swagger UI at `http://localhost:3015/api`.

Allocations validate students through student-service and upsert a single active allocation per student. The selected pickup stop must belong to the selected route.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3015/transport/routes -H "Content-Type: application/json" -d "{\"routeName\":\"North Campus Route\",\"vehicleNumber\":\"KA-01-AB-1234\",\"driverName\":\"Ramesh Kumar\",\"driverContact\":\"+919876543210\",\"stops\":[{\"stopName\":\"Central Park\",\"pickupTime\":\"07:35\"}]}"
curl http://localhost:3015/transport/routes
curl -X POST http://localhost:3015/transport/allocate -H "Content-Type: application/json" -d "{\"studentId\":\"<student-id>\",\"routeId\":\"<route-id>\",\"stopName\":\"Central Park\"}"
curl http://localhost:3015/transport/student/<student-id>
curl http://localhost:3015/health/transport
```

Run `npm run seed` to add placeholder sample data after replacing the student ID.
