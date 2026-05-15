# Refactor Backlog — CTFlow (prioritized)

This backlog lists prioritized refactor and stabilization items. Each item includes objective, risk, files likely affected, validation required, and whether approval is required.

P0 — Risks and Stabilization
- Objective: Diagnose and stabilize the unhealthy frontend container and any misconfigurations that impact availability.
- Risk: Medium (availability impact). 
- Files likely affected: `frontend/nginx.conf`, `frontend/Dockerfile`, `docker-compose*.yml` (diagnosis only — changes require approval).
- Validation: read-only logs, `nginx -t` (if allowed), container logs review.
- Approval required: Yes (for changes).

P1 — Docs and Tests
- Objective: Expand docs (`current-state`, `architecture`, `target-architecture`) and add missing unit/integration tests for critical modules.
- Risk: Low.
- Files likely affected: `docs/*`, `backend/tests/*`, `frontend/__tests__/*`.
- Validation: test runs in CI, local unit/integration runs in isolated test env.
- Approval required: No (documentation); Yes (test infra changes that affect CI).

P2 — Backend modular refactor
- Objective: Reorganize backend into clearer domain modules, add OpenAPI where useful, and consolidate routing under `/api`.
- Risk: High (can break contracts).
- Files likely affected: `backend/src/modules/*`, `backend/src/app.js`, `backend/src/index.js`.
- Validation: full test-quality-gate, integration tests, staging deployment.
- Approval required: Yes.

P3 — Frontend API/service refactor
- Objective: Migrate frontend API clients to a unified typed client, rely on `VITE_API_URL` and remove legacy root calls.
- Risk: Medium.
- Files likely affected: `frontend/src/services/api/*`, `frontend/src/hooks/*`, `frontend/src/pages/*`.
- Validation: unit tests, integration smoke tests, frontend build.
- Approval required: Yes.

P4 — DB migration control
- Objective: Introduce migration tooling, backup procedures, and dry-run validations before any schema change.
- Risk: Very High (data loss potential).
- Files likely affected: `mysql-init/*`, migration configs, deployment scripts.
- Validation: backup/restore tests on snapshot; dry-run migrations in staging.
- Approval required: Yes (explicit human approval mandatory).

P5 — Docker/Nginx cleanup
- Objective: Standardize compose files, centralize Nginx includes, document deployment profiles.
- Risk: High (infrastructure impact).
- Files likely affected: `docker-compose*.yml`, `frontend/nginx.conf`, production Nginx includes.
- Validation: `docker compose config`, staging deploy, health checks.
- Approval required: Yes.

P6 — UI/UX refresh
- Objective: Iterative UX improvements, accessibility and performance optimizations.
- Risk: Low to Medium.
- Files likely affected: `frontend/src/*`.
- Validation: UI smoke tests, visual regression where feasible.
- Approval required: Yes for production releases.
