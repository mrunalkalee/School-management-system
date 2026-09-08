# BrightBoard Auth Service

The Auth Service owns BrightBoard user accounts and refresh-token sessions. It runs independently on port `3017`, uses the `brightboard-auth` MongoDB database, and exposes Swagger UI at `http://localhost:3017/api`.

Passwords and refresh tokens are hashed with bcrypt. Access tokens expire in 15 minutes by default; refresh tokens expire in seven days and are rotated on every refresh. The API Gateway can call `GET /auth/verify` with the incoming Bearer token to centralize JWT verification.

## Run locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

## Endpoints

```bash
curl -X POST http://localhost:3017/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Aarav Sharma\",\"email\":\"aarav@example.com\",\"password\":\"SecurePassword123!\",\"role\":\"student\"}"
curl -X POST http://localhost:3017/auth/login -H "Content-Type: application/json" -d "{\"email\":\"aarav@example.com\",\"password\":\"SecurePassword123!\"}"
curl http://localhost:3017/auth/verify -H "Authorization: Bearer <access-token>"
```

`JwtAuthGuard`, `RolesGuard`, and `@Roles()` are available for protected endpoints. Role and ownership enforcement in downstream services remains an API Gateway/auth integration task.
