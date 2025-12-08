# Manual QA Checklist

## Roles & Access
- Public registration → creates admin; verify login shows role=admin.
- Admin cannot start/answer tests (API 403 on `/tests/:id/start`, `/tests/.../answer`).
- Admin can create normal users via `/admin/users`.
- Normal user can login and start test; admin cannot.

## Adaptive Flow
- Condition A: Answer 20 questions → session completes.
- Condition B: Wrong answer at difficulty 1 → session ends immediately.
- Condition C: 3 consecutive correct at difficulty 10 → session ends.
- Verify score sums weights for correct answers only.

## Admin Dashboard
- Users: list/create/edit/delete; role assignment works; normal users can login.
- Questions: CRUD with validation (>=2 options, correctAnswerIndex valid, difficulty 1–10).
- Tests: create test (unique URL shown), list tests, results view, preview mode.
- Admin-only guards enforced in UI and API.
