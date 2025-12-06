# LMS Backend

NestJS + MongoDB service for the adaptive testing LMS. This repository is scoped for backend-only work and will be expanded ticket-by-ticket. See root docs for full requirements; this README will be updated as features land.

## Quick start (dev)
1. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `JWT_SECRET`.
2. Install deps: `npm install`
3. Run dev server: `npm run start:dev`

## Scripts
- `npm run start:dev` — start Nest in watch mode
- `npm run build` — compile to `dist`
- `npm run lint` — lint TS
- `npm run seed:questions` — seed 500 random questions (requires MongoDB)
- `npm run seed:sample` — seed default admin + sample test (requires MongoDB)
- `npm run seed:all` — run all seeders
- `npm run test` — run unit tests

## First admin user
- Public registration (`POST /auth/register`) always creates an admin. Use this endpoint to create the initial admin after connecting to MongoDB.

## API docs
- Swagger available at `/api-docs` when the server is running.

## Docker
- Build: `docker build -t lms-backend .`
- Run: `docker run --env-file .env -p 4000:4000 lms-backend`
