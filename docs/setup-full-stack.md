# Full Stack Setup Guide

## Prerequisites
- Node.js 18+
- npm
- Docker + docker compose (optional for containerized runs)
- MongoDB URI (Atlas or local)

## Backend (lms-backend)
1. Copy `.env.example` to `.env` (or `.env.local`) and set:
   - `PORT=4000`
   - `MONGODB_URI=<your-mongo-uri>`
   - `JWT_SECRET=<secret>`
   - `JWT_EXPIRATION=3600s`
2. Install deps: `npm install`
3. Run dev server: `npm run start:dev`
4. Seed data (optional): `npm run seed:questions` and `npm run seed:sample`
5. Swagger docs at `/api-docs` when running.

Docker:
- `docker compose up --build` (from `lms-backend`) using `docker-compose.yml`
- Or `docker build -t lms-backend . && docker run --env-file .env -p 4000:4000 lms-backend`

## Frontend (lms-frontend)
1. Copy `.env.example` to `.env` (or `.env.local`) and set:
   - `NEXT_PUBLIC_API_URL=http://localhost:4000` (or backend URL)
2. Install deps: `npm install`
3. Run dev server: `npm run dev` (http://localhost:3000)
4. Build/start: `npm run build` then `npm run start`

Docker:
- `docker compose up --build` (from `lms-frontend`) using `docker-compose.yml`
- Or `docker build -t lms-frontend . && docker run --env-file .env -p 3000:3000 lms-frontend`

## First admin
- Use `POST /auth/register` (or frontend `/register`) to create the initial admin. Admins can create normal users; admins cannot take tests.

## Run full stack locally
1. Start backend (npm or docker).
2. Start frontend (npm or docker) with `NEXT_PUBLIC_API_URL` pointing to the backend.
3. Register admin → create users → manage questions/tests → normal user takes test via unique URL.
