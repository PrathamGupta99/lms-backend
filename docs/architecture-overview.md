# Architecture Overview

## Tech Stack
- Backend: NestJS (TypeScript), MongoDB Atlas, Mongoose, JWT auth, bcrypt, class-validator, Swagger.
- Frontend: Next.js (TypeScript), React Context API + hooks, client-side routing, modern LMS-grade UI.
- DevOps: Dockerized backend and frontend services; optional docker-compose for local full-stack.

## Responsibilities by Layer
- Backend API
  - Auth: register/login with JWT; public registration always creates admins.
  - Authorization: role-based guards for admin-only management vs user-only test-taking.
  - Domain: user management, question CRUD, adaptive test engine, sessions/results, admin previews, seeding.
  - Config & quality: validation pipes, exception filters, Swagger docs, linting, testing.
- Frontend
  - Auth flows (admin registration, login), role-aware navigation/guards.
  - Normal-user adaptive testing via unique URLs, question answering, result pages.
  - Admin dashboard for users, questions, tests, results, and previews.
  - Context-based state (Auth/Test/Admin contexts), shared UI shell, loading/error UX.
- DevOps
  - Dockerfiles per service with env-driven config.
  - Optional docker-compose wiring API URL and ports for local dev.

## Role Model & Business Rules
- Public registration -> admin user (role: `admin`).
- Admins:
  - Can create admins or normal users.
  - Can manage users, questions, tests, and view results.
  - Cannot take real tests; only preview flows with no score/session recorded.
- Normal users:
  - Created by admins only.
  - Can start adaptive tests, submit answers, and receive scores/results.
- Enforcement: backend guards block admins from test-taking endpoints and block normal users from admin endpoints; frontend mirrors with UI guards/messages.

## Key Flows (Sequence Sketches)

### Admin Registration & Login
```
Actor(Admin) -> Frontend: submit /auth/register (email, password, name)
Frontend -> Backend Auth: POST /auth/register
Backend Auth -> DB: create user role=admin (hash password)
Backend Auth -> Frontend: 201 + JWT {userId, role=admin}
Frontend: store token, redirect to /admin
```

### Admin Creates Normal User
```
Actor(Admin) -> Frontend: login (JWT)
Admin -> Frontend: open /admin/users/new
Frontend -> Backend Users: POST /admin/users (role=user)
Backend -> DB: persist new normal user
Backend -> Frontend: 201 + user data
Frontend: refresh user list
```

### Normal User Starts & Completes Adaptive Test
```
Actor(User) -> Frontend: login (JWT, role=user)
User -> Frontend: open /test/{uniqueURL}
Frontend -> Backend Tests: GET /tests/public/{uniqueURL} (test metadata)
User -> Frontend: click Start
Frontend -> Backend Tests: POST /tests/{testId}/start
Backend: create TestSession (role must be user, difficulty=5), return session + question
loop answer flow up to end condition (20 Qs, wrong@1, or 3 correct @10)
  User -> Frontend: submit answer
  Frontend -> Backend Tests: POST /tests/{testId}/sessions/{sessionId}/questions/{questionId}/answer
  Backend: evaluate, update session, decide next question or completion
end
Backend -> Frontend: final summary (score, questionsAsked)
Frontend: redirect to /results/{sessionId}
```

### Admin Views Results
```
Actor(Admin) -> Frontend: login (JWT, role=admin)
Admin -> Frontend: open /admin/tests
Frontend -> Backend Tests: GET /tests
Admin -> Frontend: select test, open results
Frontend -> Backend Tests: GET /tests/{testId}/results
Backend -> Frontend: sessions summary (user, score, completedAt, counts)
```

## Adaptive Engine Highlights
- Starts at difficulty 5.
- Difficulty +1 on correct (cap 10); -1 on incorrect (floor 1).
- End when: 20 questions asked, first incorrect at difficulty 1, or 3 consecutive correct answers at difficulty 10.
- Score: sum of weights for correct answers (refine per implementation notes).
