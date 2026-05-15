# Target Architecture — CTFlow (proposal)

## Objectives
- Modular, testable backend with clear domain boundaries.
- Stable frontend with typed API contracts and predictable builds.
- Controlled, auditable deploys with rollback capabilities.

## Components
- Frontend: React + Vite + TypeScript. Build artifacts served by Nginx in production.
- Backend: Modular Express application, organized by domain modules (agenda-aulas, alunos, auth, etc.). All API endpoints under `/api`.
- Database: MySQL with migration tooling and backup processes.
- Reverse Proxy: Nginx for TLS termination and routing (Certbot-managed certificates).
- CI: Pipeline to run `test-quality-gate` for PRs and builds.

## Contracts and Practices
- Adopt typed API contracts using shared schemas (zod) or OpenAPI; generate client types for frontend where appropriate.
- Standardize environment configuration: use templates (example `.env.example`) and secrets manager for real credentials.
- Health and readiness endpoints for each service; standardized monitoring and log aggregation.

## Deployment model
- Use Docker Compose for development and staging; consider migration to orchestration (Kubernetes) only after stabilization.
- Use compose profiles to separate dev/test/prod configs and avoid manual edits across environments.

## Migration approach
- Introduce compatibility adapters for existing routes while migrating consumers to `/api`.
- Roll out changes incrementally per module with tests and staged deployments.
