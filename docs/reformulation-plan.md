# Reformulation Plan — CTFlow (controlled)

## Goal
Provide a controlled, auditable plan to reformulate CTFlow from a legacy codebase into a stabilized, testable, and modular system while preventing accidental production changes.

## Non-goals
- No code changes or deployments without explicit approval.
- No database schema changes without backup and explicit approval.

## High-level strategy
1. Documentation and stabilization (Phase 1): confirm facts and fix configuration issues discoverable by read-only inspection.
2. Target architecture and backlog (Phase 2): design desired modular architecture and list small, testable tasks.
3. Safety gates and tests (Phase 3): require `test-quality-gate` prior to any merge to protected branches.
4. Incremental implementation (Phases 4–8): execute small, reviewed changes with approvals and rollbacks.

## Approval checkpoints
- After documentation updates (Phase 1).
- Before any change that affects Docker, Nginx, or DB.
- Before each major refactor (backend/frontend/module boundary change).

## Validation strategy
- Use the `test-quality-gate` skill: lint, types, unit tests, integration tests, smoke checks, frontend build.
- Require staging deployment and health checks for infra changes.

## Rollback strategy
- Keep image tags and previous artifacts for quick redeploy.
- Database backups before migrations; migration rollback scripts when possible.

## Deliverables (Phase 1)
- Updated `docs/current-state.md` and `docs/architecture.md` (this step).
- Draft `docs/target-architecture.md` and `docs/refactor-backlog.md`.
