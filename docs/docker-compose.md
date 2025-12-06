# Docker Compose Usage

This repository keeps compose files inside each project directory.

## Backend only
- Build & run: `docker compose -f docker-compose.yml up --build`
- Run detached: `docker compose -f docker-compose.yml up -d`
- Stop: `docker compose -f docker-compose.yml down`
- Logs: `docker compose -f docker-compose.yml logs -f backend`

Ensure `.env` is present in `lms-backend` with `MONGODB_URI`, `PORT`, `JWT_SECRET`, etc.

## Frontend only
- Build & run: `docker compose -f ../lms-frontend/docker-compose.yml up --build` (from repo root) or run inside `lms-frontend`.
- Run detached: `docker compose -f ../lms-frontend/docker-compose.yml up -d`
- Stop: `docker compose -f ../lms-frontend/docker-compose.yml down`
- Logs: `docker compose -f ../lms-frontend/docker-compose.yml logs -f frontend`

Set `NEXT_PUBLIC_API_URL` in `lms-frontend/.env` (defaults to `http://localhost:4000` when not provided).

## Running both
Start backend compose in one terminal and frontend compose in another (or background with `-d`) so frontend can call the backend API.
