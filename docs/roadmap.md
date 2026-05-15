Roadmap para reformulação do CTFlow

Phase 0 — Governance
- Create and refine AI governance, rules, skills and operational prompts (completed).

Phase 1 — Documentation and Stabilization
- Consolidate confirmed current-state and architecture documentation. Diagnose unhealthy containers and configuration issues without changing runtime.

Phase 2 — Target Architecture
- Produce a target architecture document and a detailed reformulation plan.

Phase 3 — Test Quality Gate
- Implement CI checks: lint, type-check, unit and integration tests, smoke tests, and pre-deploy gates.

Phase 4 — Backend Refactor (incremental)
- Modularize backend by domain, consolidate API under `/api`, add OpenAPI where appropriate.

Phase 5 — Frontend Refactor
- Unify API client baseURL, migrate to typed contracts (zod), improve test coverage, and stabilize builds.

Phase 6 — Database and Migrations
- Adopt controlled migration tooling, backups, dry-run and rollback procedures before any production schema change.

Phase 7 — Docker/Nginx Hardening
- Standardize compose profiles, centralize Nginx configs, automate TLS renewal, and validate staging deployments.

Phase 8 — UI/UX Refresh
- Improve user flows and accessibility with iterative releases and tests.

Phase 9 — Release Candidate
- Full validation in staging, controlled rollout, monitoring and rollback readiness.

