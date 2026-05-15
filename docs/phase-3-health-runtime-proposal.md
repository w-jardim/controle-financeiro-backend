# CTFlow — Phase 3 Proposal: Healthcheck, Runtime Alignment and Safe Test Plan

**Date**: 2026-05-15  
**Status**: Proposal only. Read-only analysis completed.  
**Scope in this phase**: document findings, define a safe execution sequence, and prepare approval checkpoints.

---

## 1. What was read

- Governance: `AGENTS.md`
- Phase 2 outputs: [quality-gate.md](/opt/apps/projects/ctflow-app/docs/quality-gate.md), [health-diagnosis.md](/opt/apps/projects/ctflow-app/docs/health-diagnosis.md)
- Runtime and architecture docs: [architecture.md](/opt/apps/projects/ctflow-app/docs/architecture.md), [mvp-scope.md](/opt/apps/projects/ctflow-app/docs/mvp-scope.md), [user-roles.md](/opt/apps/projects/ctflow-app/docs/user-roles.md)
- Compose/runtime files: [docker-compose.yml](/opt/apps/projects/ctflow-app/docker-compose.yml), [docker-compose.dev.yml](/opt/apps/projects/ctflow-app/docker-compose.dev.yml), [docker-compose.prod.yml](/opt/apps/projects/ctflow-app/docker-compose.prod.yml), [docker-compose.test.yml](/opt/apps/projects/ctflow-app/docker-compose.test.yml)
- App/runtime declarations: [backend/src/app.js](/opt/apps/projects/ctflow-app/backend/src/app.js), [backend/src/index.js](/opt/apps/projects/ctflow-app/backend/src/index.js), [frontend/vite.config.ts](/opt/apps/projects/ctflow-app/frontend/vite.config.ts), [frontend/nginx.conf](/opt/apps/projects/ctflow-app/frontend/nginx.conf), [frontend/Dockerfile.prod](/opt/apps/projects/ctflow-app/frontend/Dockerfile.prod), [backend/Dockerfile](/opt/apps/projects/ctflow-app/backend/Dockerfile)

---

## 2. Phase 2 findings carried into Phase 3

1. `orchestrator-frontend` is very likely a false-negative unhealthy container.
   Healthcheck behavior points to BusyBox `wget` preferring IPv6 `localhost` while the container is effectively serving over IPv4.
2. Host checks against `127.0.0.1:3000` returned `404` for `/saude`, `/ready`, and `/ping`.
   In the repository, those routes are present in [backend/src/app.js](/opt/apps/projects/ctflow-app/backend/src/app.js).
   This strongly suggests runtime/image divergence.
3. Host checks against `127.0.0.1:3002/saude` returned `200 OK`.
   That service currently behaves closer to the documented health contract.
4. Frontends on `127.0.0.1:8080` and `127.0.0.1:3003` returned SPA `index.html` for `/api/*`.
   In the repository, [frontend/nginx.conf](/opt/apps/projects/ctflow-app/frontend/nginx.conf) includes a `/api/` proxy, so the running containers do not match the repo declaration.
5. Test database startup is blocked because host port `3308` is already occupied by `viraazul-mysql-dev`, while [docker-compose.test.yml](/opt/apps/projects/ctflow-app/docker-compose.test.yml) binds `3308:3306`.

---

## 3. Runtime alignment summary

The repository currently describes a healthier and more internally consistent runtime than the one observed in Phase 2:

- Backend code exposes `/saude`, `/ping`, `/ready`, `/teste-banco`.
- Frontend production nginx config proxies `/api/` to `backend:3000`.
- Test compose assumes exclusive ownership of host port `3308`.

The observed runtime diverges in at least three places:

- Health routes on port `3000` do not match repository behavior.
- Frontend container behavior on `8080` and `3003` does not match the versioned nginx config.
- Existing host port usage prevents the repo's test compose from starting as declared.

Because of that, **Phase 3 should not begin with "fixing code"**. It should begin with **runtime contract alignment** and **safe approval gates**.

---

## 4. Proposed Phase 3 objectives

### Objective A — Stabilize health semantics

Target outcome:
- Distinguish real outages from false-negative healthchecks.
- Standardize which endpoint is authoritative for liveness and readiness in each service.

Proposed work after approval:
- Update frontend container healthchecks that currently use `localhost` with `wget` to use `127.0.0.1`.
- Confirm whether frontend health should probe `/` only, or a dedicated static health path.
- Confirm whether backend health should remain on root paths (`/saude`, `/ready`, `/ping`) or be mirrored under `/api`.

### Objective B — Align repository and deployed runtime

Target outcome:
- Know which runtime is authoritative before any build, test, or deployment action.

Proposed work after approval:
- Identify whether CTFlow should follow the runtime pattern of `ctflow-*`, `virazul-*`, or another parallel deployment tree.
- Compare deployed frontend nginx config versus [frontend/nginx.conf](/opt/apps/projects/ctflow-app/frontend/nginx.conf).
- Compare deployed backend route surface versus [backend/src/app.js](/opt/apps/projects/ctflow-app/backend/src/app.js).
- Decide whether the repo should be updated to match runtime, or runtime should be rebuilt from this repo.

### Objective C — Unblock tests safely

Target outcome:
- Define a reproducible test sequence that avoids port collisions and accidental production impact.

Proposed work after approval:
- Resolve the `3308` collision by either remapping the test DB host port or temporarily freeing the port with human approval.
- Add a Linux-safe test orchestration path later if desired, but only after runtime alignment.
- Run lint/unit/integration commands in a strictly staged order, starting from the least invasive checks.

---

## 5. Safe execution sequence for approved Phase 3 work

1. Confirm the authoritative environment.
   Decide whether the active target is the repo-defined `ctflow-*` runtime or the currently running divergent stack observed in Phase 2.
2. Approve config-only runtime corrections first.
   Prioritize healthcheck target fixes and API proxy verification before any code-level remediation.
3. Approve test-environment isolation.
   Resolve the `3308` conflict before any integration test attempt.
4. Run only low-risk validation first.
   Lint and unit tests precede integration tests and any build/deploy action.
5. Defer rebuild/redeploy until runtime alignment is explicitly accepted.

---

## 6. Files likely involved later, but not changed in this proposal

These are the likely Phase 3 implementation touchpoints once human approval is given:

- [docker-compose.test.yml](/opt/apps/projects/ctflow-app/docker-compose.test.yml)
- [docker-compose.prod.yml](/opt/apps/projects/ctflow-app/docker-compose.prod.yml)
- [docker-compose.yml](/opt/apps/projects/ctflow-app/docker-compose.yml)
- [frontend/nginx.conf](/opt/apps/projects/ctflow-app/frontend/nginx.conf)
- [frontend/Dockerfile.prod](/opt/apps/projects/ctflow-app/frontend/Dockerfile.prod)
- [backend/src/app.js](/opt/apps/projects/ctflow-app/backend/src/app.js)
- Host-level Nginx and external deployment config outside this repo, if that is the real traffic entrypoint

No changes were made to any of them in this phase.

---

## 7. Risks and dependencies

### High risk

- Repo/runtime divergence may cause a "successful" rebuild to change production behavior unexpectedly.
- Host-level reverse proxy rules may be compensating for missing container-level `/api` proxy behavior.
- The port `3308` conflict can invalidate the current backend integration test flow.

### Medium risk

- Healthcheck fixes may require container recreation and therefore operational coordination.
- Existing container names and project labels suggest multiple app trees/environments on the same host.

### Sensitive areas not touched

- `.env` and secrets
- MySQL data and migrations
- Host Nginx live config
- Runtime containers and deployment state

---

## 8. Approval checkpoints

Human approval is required before any of the following:

1. Editing Compose or Docker healthchecks.
2. Editing Nginx proxy config.
3. Changing backend route exposure or health endpoint shape.
4. Changing test DB host port mapping.
5. Running lint, tests, builds, migrations, container recreate, or deployment commands.

---

## 9. Proposed deliverables for the next approved step

- An approved runtime port map: see [runtime-port-map.md](/opt/apps/projects/ctflow-app/docs/runtime-port-map.md)
- An approved safe test sequence: see [safe-test-run-plan.md](/opt/apps/projects/ctflow-app/docs/safe-test-run-plan.md)
- A narrow implementation scope selecting one of these tracks:
  - Track 1: healthcheck-only correction
  - Track 2: runtime proxy alignment
  - Track 3: test-environment port isolation
  - Track 4: full repo/runtime reconciliation plan

---

## 10. Change log for this phase

- Read-only inspection performed.
- No code, infra, env, database, container, or runtime change executed.
- Added proposal documentation only.
