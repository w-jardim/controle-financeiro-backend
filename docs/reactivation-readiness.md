# CTFlow — Reactivation Readiness

**Date**: 2026-05-15  
**Status**: readiness assessment only; no runtime actions executed.

---

## 1. Objective

Assess whether CTFlow is ready for a first controlled reactivation without starting any container.

---

## 2. Readiness verdict

**Verdict: not ready to start as-is.**

CTFlow can be reactivated only after a small set of pre-start blockers is explicitly resolved and approved.

---

## 3. Confirmed readiness blockers

### Blocker 1 — Port collisions

Current CTFlow port declarations collide with active host services:

- `3000` blocked by VirAzul backend
- `3001` blocked by VirAzul dev/API backend
- `3307` blocked by VirAzul MySQL
- `3308` blocked by VirAzul dev MySQL
- `5173` blocked by VirAzul dev frontend
- `8080` blocked by VirAzul frontend

Impact:

- dev/default compose cannot be started safely
- prod compose cannot be started safely as declared
- test DB cannot be started safely as declared

### Blocker 2 — Data-source decision not made

Residual CTFlow volume exists:

- `ctflow-app_ctflow_mysql_data`

But there is no approved decision yet whether first reactivation should use:

- that residual volume
- a fresh empty volume
- or a cloned copy

Impact:

- database boot strategy is unresolved

### Blocker 3 — Production readiness checks are incomplete

Current production compose has:

- no backend healthcheck
- no frontend healthcheck
- `depends_on` ordering only

Impact:

- first boot may be difficult to validate safely
- service startup ordering does not prove application readiness

### Blocker 4 — Compose-resolved output exposes secrets

`docker compose config` currently expands sensitive values.

Additionally, dev/default and test MySQL healthchecks embed password arguments directly in the command line.

Impact:

- operational validation steps need redaction discipline
- future approval for runtime changes should include log-handling caution

---

## 4. Items that are ready

The following are in acceptable shape for the next planning step:

- Compose syntax resolves successfully
- service, volume, and network declarations are valid
- CTFlow resource names are internally consistent
- production compose already uses loopback binding for frontend
- isolated reactivation strategy is documented

---

## 5. Readiness requirements before first start

Before any future `docker compose up`, all of the following should be explicitly approved:

1. CTFlow will be started as an isolated stack, not by reusing VirAzul or Orchestrator resources.
2. A non-conflicting host port plan will be used.
3. A database volume/data strategy will be used.
4. The chosen activation mode will be identified:
   - dev-like
   - prod-like
   - or database-only first boot

Strongly recommended before first start:

5. add or approve service-level health validation strategy for production-like startup
6. define how secret-bearing Compose output will be handled during execution

---

## 6. Suggested next approved scope

The safest next approved execution scope would be:

1. approve port remapping strategy for an isolated CTFlow start
2. approve database strategy
3. approve a future Compose override dedicated to reactivation
4. approve database-only first boot

This is safer than approving full application startup immediately.

---

## 7. Summary table

| Area | Status | Note |
|---|---|---|
| Compose syntax | Ready | `docker compose config` resolves |
| Port availability | Blocked (existing files); Proposal ready (override) | collisions remain in existing files; override file proposes `127.0.0.1:3101 / :3318 / :8187` |
| Data strategy | Blocked | residual CTFlow volume unresolved; override uses fresh dedicated volume pending decision |
| Production readiness checks | Blocked (existing files); Improved in proposal | override adds tentative healthchecks and `service_healthy` dependency |
| Secret-safe operational logging | Needs caution | resolved config still expands env vars; override avoids password in healthcheck command line |
| Safe isolated reactivation plan | Ready | documented and now expressed as a concrete proposal file |

---

## 8. Phase 6B update

A proposal-only Compose override file has been added:
[docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml).
Rationale and reviewer checklist are in
[docs/compose-reactivation-override.md](/opt/apps/projects/ctflow-app/docs/compose-reactivation-override.md).

What this changes about readiness:

- Blocker 1 (port collisions) has a concrete, isolated alternative
  layout on `127.0.0.1:3101 / 3318 / 8187`, but the override does not
  modify any existing Compose file, so the original collisions remain
  in `docker-compose.yml`, `docker-compose.dev.yml`,
  `docker-compose.prod.yml`, and `docker-compose.test.yml`.
- Blocker 2 (data strategy) is partially mitigated: the override avoids
  touching the residual volume by using a dedicated
  `reactivation_mysql_data` volume under project name
  `ctflow-reactivation`. The decision whether to reuse, clone, or
  discard the residual volume is still open and is now explicitly
  documented as a Phase 7 prerequisite.
- Blocker 3 (production readiness checks) is partially mitigated:
  tentative healthchecks for backend and frontend are present in the
  override, with `service_healthy` used in `depends_on`. They must be
  validated against the actual images before approval to start.
- Blocker 4 (secret exposure in compose config) is partially mitigated
  for MySQL: the healthcheck no longer embeds the password in command
  arguments. The broader behavior of `docker compose config` expanding
  env vars is unchanged and still requires log-handling discipline.

What this does NOT change:

- No container was started.
- No existing Compose file, Dockerfile, Nginx config, database script,
  or `.env` file was modified.
- No port reservation was made; the candidate host ports must still be
  re-checked immediately before any Phase 7 start.

Next safe step: review the proposal file, decide the data strategy,
confirm healthcheck tooling exists in the images, and only then move to
a Phase 7 controlled first boot.

---

## 9. Phase 7A update

Database-only startup planning is now ready at the documentation level.

### What is now clarified

- the safest first-start data strategy is to use a fresh isolated volume
- the residual volume `ctflow-app_ctflow_mysql_data` should remain untouched for the first boot
- the reactivation file should be used **standalone**, not layered with `docker-compose.prod.yml`
- the target DB-only startup port `127.0.0.1:3318` was free at inspection time

### Important readiness nuance

When resolved standalone, [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml) produces the intended isolated shape:

- project: `ctflow-reactivation`
- service set: `mysql`, `backend`, `frontend`
- fresh volume: `ctflow-reactivation_reactivation_mysql_data`
- isolated network: `ctflow-reactivation_ctflow-reactivation-net`

When combined with `docker-compose.prod.yml`, Compose merge behavior introduces extra inherited ports and networks. That merged form is **not** the approved first-start shape for database-only startup planning.

### Updated safest next step

The safest next approved runtime action would be:

1. use `docker-compose.reactivation.yml` alone
2. start only `mysql`
3. use the fresh reactivation volume
4. leave the residual CTFlow volume untouched

---

## 10. Phase 7B update

The approved database-only first boot has now been executed successfully.

### What changed

- `ctflow-reactivation-mysql` was started
- the fresh volume `ctflow-reactivation_reactivation_mysql_data` was created
- the isolated network `ctflow-reactivation_ctflow-reactivation-net` was created
- the container reached `healthy`
- port `127.0.0.1:3318` is now actively bound by CTFlow reactivation MySQL

### What did not change

- backend was not started
- frontend was not started
- CloudBeaver was not started
- residual volume `ctflow-app_ctflow_mysql_data` was not mounted or reused
- existing VirAzul and Orchestrator stacks were not modified

### Updated readiness state

| Area | Status | Note |
|---|---|---|
| Database-only isolated startup | Ready and validated | completed successfully |
| Port availability for DB-only start | Consumed as planned | `127.0.0.1:3318` now in use by CTFlow MySQL |
| Data strategy for first boot | Implemented safely | fresh isolated volume used |
| Residual CTFlow volume safety | Preserved | still present and untouched |
| App-layer reactivation | Not yet approved | backend/frontend remain stopped |

### New safest next step

The next step should be a new explicit approval decision, not an automatic continuation.

The likely next options are:

1. inspect database-only state further
2. plan backend-only startup against the healthy isolated MySQL
3. keep the environment paused at database-only state until a later approval

---

## 11. Phase 7C update

MySQL readiness validation has now been completed successfully.

### What is now confirmed

- `ctflow-reactivation-mysql` is not only healthy at the Docker level, but query-ready
- the CTFlow database `gestao_ct_financeiro` exists
- the CTFlow schema contains `16` tables
- read-only SQL access works inside the container
- visible MySQL users include `root@%` and `root@localhost`
- the schema currently shows a small initialized footprint, including `2` rows in `cts`

### Readiness impact

This clears the database gate for a future backend-only startup approval.

It does **not** yet approve:

- backend startup
- frontend startup
- CloudBeaver startup
- any schema-altering or migration activity

### Updated readiness state

| Area | Status | Note |
|---|---|---|
| Database-only isolated startup | Ready and validated | container healthy and running |
| MySQL query readiness | Ready and validated | read-only SQL checks passed |
| CTFlow schema presence | Ready and validated | `gestao_ct_financeiro` exists with `16` tables |
| Residual CTFlow volume safety | Preserved | still untouched |
| Backend startup readiness | Pending explicit approval | DB dependency is now validated |

---

## 12. Phase 8A.1 update

Private backend environment verification has now been completed successfully.

### What is now confirmed

The local `.env` contains the required backend startup variables with the following non-secret values:

- `DB_HOST=mysql`
- `DB_PORT=3306`
- `DB_NAME=gestao_ct_financeiro`
- `PORT=3000`
- `NODE_ENV=production`

Required secret-bearing variables were checked for presence only and are present:

- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`

### Readiness impact

This clears the private environment-variable gate for backend-only startup planning.

It does **not** yet approve:

- backend startup execution
- frontend startup
- any migration or schema-altering activity

### Updated readiness state

| Area | Status | Note |
|---|---|---|
| Database-only isolated startup | Ready and validated | MySQL healthy on `127.0.0.1:3318` |
| MySQL query readiness | Ready and validated | schema present and queryable |
| Backend env variable readiness | Ready and validated | required variables present; non-secret values coherent |
| Residual CTFlow volume safety | Preserved | still untouched |
| Backend startup execution | Pending explicit approval | prereq checks now largely cleared |

---

## 13. Phase 8B.1 update

Backend startup remains blocked, but the blocker is now precisely identified:

- no local CTFlow backend image exists
- backend startup would trigger an implicit Docker build
- that build was not approved in Phase 8B

### What is now clarified

- MySQL dependency is ready
- backend env readiness is ready
- backend host port planning is ready
- the immediate missing step is controlled backend image build approval

### Updated readiness state

| Area | Status | Note |
|---|---|---|
| Database-only isolated startup | Ready and validated | unchanged |
| MySQL query readiness | Ready and validated | unchanged |
| Backend env variable readiness | Ready and validated | unchanged |
| Backend image availability | Blocked | no local CTFlow backend image exists |
| Backend image build plan | Ready | documented in `backend-image-build-plan.md` |
| Backend startup execution | Pending explicit approval | must follow image build approval |

### New safest next step

The next safe step is:

1. approve backend image build only
2. verify the built image and healthcheck tooling assumptions
3. return for separate approval before backend container startup

---

## 14. Phase 8B.2 update

The backend image build has now been executed successfully.

### What changed

- local image `ctflow-reactivation-backend:latest` now exists
- backend startup no longer depends on an implicit Docker build

### What did not change

- backend container was not started
- frontend was not started
- CloudBeaver was not started
- MySQL was not restarted
- no Compose file, Dockerfile, `.env`, or application code was modified

### Build observations carried into readiness

- build succeeded using the current backend Dockerfile and standalone reactivation Compose file
- the resulting image is approximately `1.71GB`
- build output included npm deprecation warnings and an audit summary with 4 vulnerabilities; these did not block image creation
- `curl` availability inside the built image is still a recommended validation before relying on the backend healthcheck

### Updated readiness state

| Area | Status | Note |
|---|---|---|
| Database-only isolated startup | Ready and validated | unchanged |
| MySQL query readiness | Ready and validated | unchanged |
| Backend env variable readiness | Ready and validated | unchanged |
| Backend image availability | Ready and validated | `ctflow-reactivation-backend:latest` exists |
| Backend image build plan | Completed | build gate cleared |
| Backend startup execution | Pending explicit approval | next runtime gate |

### New safest next step

The next safe step is:

1. inspect or verify `curl` availability in the built backend image
2. obtain explicit approval for backend container startup only
3. start backend without `--build`

---

## 12. Phase 8A update — backend-only startup planning

The backend-only startup plan has been drafted. No runtime action was
executed in this phase.

### What was produced

- [docs/backend-startup-plan.md](/opt/apps/projects/ctflow-app/docs/backend-startup-plan.md)
  — end-to-end procedure, validations, rollback, and decision gates.
- [docs/backend-env-requirements.md](/opt/apps/projects/ctflow-app/docs/backend-env-requirements.md)
  — full catalog of env vars the backend reads, with **names only** (no
  values printed).
- [docs/runtime-port-map.md §12](/opt/apps/projects/ctflow-app/docs/runtime-port-map.md)
  — backend planned binding `127.0.0.1:3101 -> 3000` recorded.

### What is green (no further blockers)

- The reactivation compose `backend` service resolves cleanly when
  evaluated standalone.
- MySQL dependency is satisfied: `ctflow-reactivation-mysql` is
  `healthy` on `127.0.0.1:3318`, with `gestao_ct_financeiro` populated
  and 16 tables present.
- The candidate host port `127.0.0.1:3101` was observed free at
  planning time.
- Backend bootstrap path is well-understood:
  [backend/src/index.js](/opt/apps/projects/ctflow-app/backend/src/index.js)
  → `validarEnv()` → `app.listen(PORT, '0.0.0.0', ...)`.
- The required env-var set is documented (5 hard-required, several
  optional with defaults).

### Outstanding confirmations (operator-side, no agent action)

These are not blockers in the sense of code/infra; they are
configuration confirmations that the human operator must verify before
approving a start, because the agent does not print `.env` values:

1. `.env` value alignment — see
   [docs/backend-env-requirements.md §7](/opt/apps/projects/ctflow-app/docs/backend-env-requirements.md).
   Most important: `DB_PORT` must be `3306` (container-internal port),
   not `3318` (host-published port). The compose only overrides
   `DB_HOST=mysql` and `NODE_ENV=production`; everything else is
   inherited from `.env`.
2. Healthcheck tooling — the compose `backend` healthcheck uses
   `curl`. The `node:20` base image typically ships with `curl`, but
   this should be verified once the image is built. If `curl` is
   missing, a separate approval is required to either install it or
   replace the healthcheck (both involve modifying files that are
   protected in Phase 8A).

### Updated readiness state

| Area | Status | Note |
|---|---|---|
| Database-only isolated startup | Ready and validated | unchanged from Phase 7C |
| Backend startup plan | Ready | documented end-to-end with rollback |
| Backend env-var contract | Documented | names only; values unprinted |
| Backend host port `127.0.0.1:3101` | Free at planning time | must re-check immediately before start |
| `.env` value alignment | Pending operator confirmation | see §12 outstanding confirmations |
| Healthcheck `curl` availability | Pending build-time verification | not a blocker until build step |
| Backend container start | Pending explicit approval | no action taken |

### Next safe step

The next safe step is **not** to start the backend automatically. It is
to obtain explicit human approval to execute the procedure described in
[docs/backend-startup-plan.md §6](/opt/apps/projects/ctflow-app/docs/backend-startup-plan.md),
after the operator has completed the §4/§5 confirmations.
