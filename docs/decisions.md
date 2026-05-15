Decisões iniciais de governança (ADR-style)

## ADR-001: Add AI governance before code changes

**Status:** Accepted

**Context:** The project requires safer AI-assisted workflows for legacy maintenance.

**Decision:** Add a governance layer (`AGENTS.md`, `skills/`, `rules/`, `prompts/`) that enforces read-only inspection and human approval before changes.

**Consequences:** Agents must present plans and obtain approval before modifying code or infra.

## ADR-002: Treat CTFlow as legacy-sensitive

**Status:** Accepted

**Decision:** Operate with conservative defaults (minimal privilege, small reversible changes).

## ADR-003: Consolidate API under `/api` (target)

**Status:** Proposed

**Decision:** Target consolidation of all API endpoints under `/api` and provide compatibility adapters during migration.

## ADR-004: Require approval for Docker/Nginx/DB changes

**Status:** Accepted

**Decision:** Any change to Dockerfiles, `docker-compose*.yml`, production Nginx configs, or database migrations requires documented approval and rollback plan.

## ADR-005: Documentation before implementation

**Status:** Accepted

**Decision:** Significant refactors or infra changes must be preceded by updated documentation (`docs/target-architecture.md`, `docs/reformulation-plan.md`) and an approved backlog.

