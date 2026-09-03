# BrightBoard Fee Service

The Fee Service owns fee structures and student payment records. It runs independently on port `3009`, uses the `brightboard-fee` MongoDB database, and exposes Swagger UI at `http://localhost:3009/api`.

Fee-structure creation validates the class through class-subject-service. Payment recording and student balance views validate students through student-service.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API examples

```bash
curl -X POST http://localhost:3009/fees/structures -H "Content-Type: application/json" -d "{\"classId\":\"<class-id>\",\"academicYear\":\"2026-2027\",\"feeType\":\"Tuition\",\"amount\":25000,\"dueDate\":\"2026-06-15T00:00:00.000Z\"}"
curl "http://localhost:3009/fees/structures?classId=<class-id>"
curl -X POST http://localhost:3009/fees/payments -H "Content-Type: application/json" -d "{\"studentId\":\"<student-id>\",\"feeStructureId\":\"<fee-structure-id>\",\"amountPaid\":10000,\"paymentMode\":\"online\",\"transactionRef\":\"pay_123\"}"
curl http://localhost:3009/fees/student/<student-id>
curl http://localhost:3009/health/fee
```

`GET /fees/student/:studentId` returns the stable dashboard contract `{ studentId, classId, fees }`. Each fee item contains `feeStructure`, `totalPaid`, `balance`, and the current `status` (`pending`, `partial`, or `paid`). Payment status uses the student’s cumulative payment total against the structure amount.

Run `npm run seed` to insert placeholder sample documents after replacing their IDs.
