# BrightBoard

BrightBoard is a microservices backend for a School Management System.

## Repository structure

```text
brightboard/
├── frontend/                # Frontend placeholder
├── backend/
│   ├── api-gateway/         # API gateway placeholder
│   └── services/            # NestJS services are added here phase by phase
├── package.json
└── .gitignore
```

Each service in `backend/services/<name>-service` is an independent NestJS application with its own MongoDB Atlas database, its own port, and its own Swagger UI at `http://localhost:<port>/api`.

Services communicate with one another only over HTTP; they never access each other's databases.

## Install dependencies

From the repository root, run:

```bash
npm install
```

npm workspaces installs the dependencies for every workspace service.

## Run one service

```bash
cd backend/services/<name>-service
npm run start:dev
```

## Run all services

Once multiple services and the API gateway exist, run this from the repository root:

```bash
npm run dev:all
```

The `dev:all` script currently starts the API gateway workspace. Add each service workspace command to this script as services are created.
