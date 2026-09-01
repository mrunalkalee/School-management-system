# BrightBoard

School Management System monorepo. The API gateway is the sole public backend entry point; domain services own their MongoDB collections and communicate through gateway REST endpoints.

## Start

1. Copy `.env.example` to the relevant package `.env` files and fill values.
2. `npm install`
3. `npm run validate:structure`
4. `npm run dev`

Backend services can be started individually with `npm run start:dev --workspace=<workspace-name>`.
