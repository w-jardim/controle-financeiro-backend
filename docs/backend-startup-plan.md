# CTFlow — Backend-Only Startup Plan

**Date**: 2026-05-15
**Phase**: 8A — Backend-Only Startup Planning
**Status**: planning only; no runtime actions executed; awaiting human approval.

---

## 1. Objective

Define the minimum, lowest-blast-radius procedure for bringing up the
CTFlow backend container against the already-healthy isolated MySQL
(`ctflow-reactivation-mysql`, `127.0.0.1:3318`), without starting the
frontend or CloudBeaver.

This document is a plan, not an execution. No container will be started
by this phase.

---

## 2. Scope

In scope:

- Building (or reusing) the `ctflow-reactivation-backend` image from
  [backend/Dockerfile](/opt/apps/projects/ctflow-app/backend/Dockerfile).
- Starting **only** the `backend` service from
  [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml).
- Validating that the backend reaches MySQL on the isolated network.
- Validating health endpoints on `127.0.0.1:3101`.

Out of scope:

- Frontend, CloudBeaver, Nginx, Certbot.
- Any migration, seed, build of frontend, or test run.
- Any change to `.env`, source code, Dockerfile, or compose files.
- Any modification or restart of `ctflow-reactivation-mysql`.

---

## 3. Pre-state assumed (from Phase 7C)

| Item | Expected state |
|---|---|
| `ctflow-reactivation-mysql` | `running`, `healthy`, bound to `127.0.0.1:3318` |
| Database | `gestao_ct_financeiro` exists with 16 tables |
| Network | `ctflow-reactivation_ctflow-reactivation-net` exists |
| Volume | `ctflow-reactivation_reactivation_mysql_data` exists |
| Residual volume | `ctflow-app_ctflow_mysql_data` present and untouched |
| Backend / Frontend / CloudBeaver | not running |
| Candidate backend host port `127.0.0.1:3101` | not listening at last inspection |

The plan below begins with a read-only re-verification of all of these.

---

## 4. Identified considerations and blockers

These must be resolved (or explicitly accepted) **before** approving
execution.

### 4.0 Backend image build gate

The backend image build gate has now been completed successfully in
Phase 8B.2.

Current state:

- local image `ctflow-reactivation-backend:latest` exists
- backend startup will no longer require an implicit build

References:

- [backend-image-build-plan.md](/opt/apps/projects/ctflow-app/docs/backend-image-build-plan.md)
- [backend-image-build-result.md](/opt/apps/projects/ctflow-app/docs/backend-image-build-result.md)

### 4.1 `.env` value alignment — confirmation needed (potential blocker)

See [docs/backend-env-requirements.md §7](/opt/apps/projects/ctflow-app/docs/backend-env-requirements.md).
The reactivation compose only overrides `DB_HOST=mysql` and
`NODE_ENV=production` for the backend. All other DB variables are
inherited from `.env`.

The values in `.env` are not printed by the agent. The operator must
privately confirm:

- `DB_PORT=3306` (container-internal; **not** the host port `3318`)
- `DB_NAME=gestao_ct_financeiro`
- `DB_USER`/`DB_PASSWORD` correspond to a user that exists in the
  fresh isolated MySQL volume (Phase 7C observed `root@%` and
  `root@localhost`)
- `JWT_SECRET` is non-empty
- `PORT=3000` (or unset; the compose maps `127.0.0.1:3101 -> 3000`)

If any of these is wrong, a separate approval is required to either:

- adjust `.env`, or
- add an `environment:` override to the `backend` service in the
  reactivation compose.

Both are out of scope for Phase 8A.

### 4.2 `curl` presence in backend image — confirmation still needed

The compose healthcheck for `backend` is:

```
curl -fsS http://127.0.0.1:3000/ping >/dev/null || exit 1
```

The [Dockerfile](/opt/apps/projects/ctflow-app/backend/Dockerfile) uses
`FROM node:20` (Debian-based) and does not explicitly install `curl`.
The `node:20` base image typically ships with `curl`, but this should be
verified against the built image before relying on the healthcheck.

Fallback (only with approval): replace healthcheck with a
node-only probe such as
`node -e "require('http').get('http://127.0.0.1:3000/ping', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"`.
This would require modifying
[docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml),
which is forbidden in Phase 8A without explicit approval.

### 4.3 Compose `depends_on` ordering

The reactivation compose declares:

```
backend:
  depends_on:
    mysql:
      condition: service_healthy
```

`mysql` is already running and `healthy`, so `up -d backend` will
satisfy the dependency immediately. Starting `backend` alone does **not**
re-create or restart the `mysql` container.

### 4.4 Data-only first contact

This is the first time the CTFlow backend will run against this fresh
isolated MySQL volume. The schema was initialized from
[mysql-init/](/opt/apps/projects/ctflow-app/mysql-init/). The backend
will perform read connections via `/ready` and `/teste-banco`. No DDL
or DML is part of this plan.

---

## 5. Pre-flight read-only checklist

Run all of these and verify before requesting approval to start the
backend. None of these mutate state.

```bash
# 1. Workspace and branch sanity
pwd
git status --short
git branch --show-current

# 2. MySQL still healthy
docker ps --filter name=ctflow-reactivation-mysql \
  --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# 3. Isolated network still present
docker network ls --filter name=ctflow-reactivation_ctflow-reactivation-net

# 4. Isolated volume still present
docker volume ls --filter name=ctflow-reactivation_reactivation_mysql_data

# 5. Residual volume untouched
docker volume ls --filter name=ctflow-app_ctflow_mysql_data

# 6. Candidate backend host port free
ss -ltn '( sport = :3101 )'

# 7. Compose resolves cleanly (standalone, not layered)
docker compose -p ctflow-reactivation \
  -f docker-compose.reactivation.yml config >/dev/null

# 8. Confirm env var NAMES (no values) loaded for backend
docker compose -p ctflow-reactivation \
  -f docker-compose.reactivation.yml config | \
  awk '/^  backend:/,/^  [a-z]/' | grep -E 'env_file|environment|DB_HOST|NODE_ENV' || true

# 9. Backend not currently running
docker ps -a --filter name=ctflow-reactivation-backend \
  --format 'table {{.Names}}\t{{.Status}}'
```

Acceptance criteria for pre-flight:

- MySQL container is `Up ... (healthy)` on `127.0.0.1:3318->3306`.
- `ctflow-reactivation_ctflow-reactivation-net` exists.
- `ctflow-reactivation_reactivation_mysql_data` exists.
- `ctflow-app_ctflow_mysql_data` exists (untouched).
- Port `3101` is not listening.
- `docker compose ... config` exits 0.
- `ctflow-reactivation-backend` does not yet exist (or is `Exited`/removed).

Plus the operator confirmations from §4.1 and §4.2.

---

## 6. Proposed start sequence (NOT executed in Phase 8A)

Only execute after explicit human approval and after the pre-flight
checklist is fully green.

### 6.1 Build image

```bash
docker compose -p ctflow-reactivation \
  -f docker-compose.reactivation.yml build backend
```

Verification after build:

```bash
docker image ls | grep ctflow-reactivation-backend
docker run --rm ctflow-reactivation-backend curl --version || \
  echo "WARN: curl not present in image; revisit healthcheck"
```

Status:

- completed successfully in Phase 8B.2
- resulting image: `ctflow-reactivation-backend:latest`

This step does not need to be repeated unless the image is removed or
the build inputs change.

### 6.2 Start backend only

```bash
docker compose -p ctflow-reactivation \
  -f docker-compose.reactivation.yml up -d backend
```

Explicitly **not**:

- `up -d` without a service name (would start `frontend` too).
- `up -d backend frontend`.
- `--build` if already built in §6.1 (avoid implicit rebuild).
- `--force-recreate` on `mysql` (would disturb a healthy container).

### 6.3 Wait for backend health

```bash
for i in $(seq 1 20); do
  state=$(docker inspect -f '{{.State.Health.Status}}' \
    ctflow-reactivation-backend 2>/dev/null || echo "missing")
  echo "attempt=$i state=$state"
  [ "$state" = "healthy" ] && break
  sleep 5
done
```

Expected: container reaches `healthy` within ~2 minutes
(start_period=30s + a few retries).

### 6.4 Validation queries (read-only)

Each must return HTTP 200 and a JSON body consistent with
[backend/src/app.js](/opt/apps/projects/ctflow-app/backend/src/app.js):

```bash
curl -fsS http://127.0.0.1:3101/ping
curl -fsS http://127.0.0.1:3101/saude
curl -fsS http://127.0.0.1:3101/ready
curl -fsS http://127.0.0.1:3101/teste-banco
```

Optional, for surface confirmation:

```bash
curl -fsS http://127.0.0.1:3101/ | head -c 300; echo
```

Acceptance criteria:

| Endpoint | Expected |
|---|---|
| `/ping` | 200, `{ "rota": "ping", "status": "ok" }` |
| `/saude` | 200, `status: ok` |
| `/ready` | 200, `banco: conectado` |
| `/teste-banco` | 200, `resultado: [{ banco_ativo: 1 }]` |
| `/` | 200, JSON info banner with `ambiente: production` |

If `/ready` returns `503` or `/teste-banco` errors, the backend reached
the container layer but the pool did not connect to MySQL. Treat as a
config alignment issue (most likely §4.1) and proceed to rollback.

### 6.5 Confirm isolation invariants still hold

After successful start:

```bash
# Backend bound to loopback only
ss -ltn '( sport = :3101 )'
# Should show 127.0.0.1:3101 only — not 0.0.0.0:3101

# No public exposure of MySQL changed
ss -ltn '( sport = :3318 )'

# Residual CTFlow volume still present and unmounted
docker volume inspect ctflow-app_ctflow_mysql_data \
  --format '{{.Name}} {{.Mountpoint}}'
docker ps --format '{{.Names}}' | xargs -I{} \
  docker inspect {} --format \
  '{{.Name}} {{range .Mounts}}{{.Name}} {{end}}' | \
  grep ctflow-app_ctflow_mysql_data && \
  echo "BLOCKER: residual volume is mounted somewhere" || \
  echo "OK: residual volume not mounted"

# Neighbor stacks untouched
docker ps --format 'table {{.Names}}\t{{.Status}}' | \
  grep -E 'virazul|orchestrator' || true
```

---

## 7. Rollback procedure

If any acceptance criterion fails, or if any unexpected
behavior is observed, roll back immediately.

```bash
# 1. Stop and remove only the backend container
docker compose -p ctflow-reactivation \
  -f docker-compose.reactivation.yml stop backend
docker compose -p ctflow-reactivation \
  -f docker-compose.reactivation.yml rm -f backend

# 2. Confirm MySQL is still healthy and untouched
docker ps --filter name=ctflow-reactivation-mysql \
  --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# 3. Confirm port 3101 is free again
ss -ltn '( sport = :3101 )'

# 4. Capture diagnostics before image cleanup
docker logs --tail 200 ctflow-reactivation-backend 2>/dev/null > \
  /tmp/ctflow-reactivation-backend.log || true
```

Explicitly **do not** during rollback:

- run `docker compose down` (would remove MySQL too).
- run `docker compose down -v` (would destroy the isolated volume).
- delete the residual `ctflow-app_ctflow_mysql_data` volume.
- restart `mysql`.
- delete the built image without operator decision (it may be needed
  for the next attempt).

Post-rollback, the environment returns to the Phase 7C end state:
MySQL-only, isolated, healthy.

---

## 8. Decision points requiring human approval

The agent must pause and obtain explicit approval before any of the
following:

1. Building the backend image (§6.1).
2. Starting the backend container (§6.2).
3. Any modification to `.env` (e.g., to fix a `DB_PORT` mismatch).
4. Any modification to `docker-compose.reactivation.yml` (e.g., to
   override `DB_PORT`, change the healthcheck command, or alter the
   port mapping).
5. Any decision to consume the residual volume
   `ctflow-app_ctflow_mysql_data` instead of the current fresh volume.
6. Proceeding to a follow-up phase (frontend startup, CloudBeaver,
   migrations, seed, Nginx integration, public exposure).

---

## 9. Out-of-scope reminders (Phase 8A)

The following are explicitly **not** part of this plan:

- starting `frontend`
- starting `cloudbeaver`
- restarting or recreating `mysql`
- running migrations or seeds
- running tests or builds beyond the backend image build
- modifying Nginx
- modifying any `.env*` file
- modifying source, Dockerfile, or compose files
- deploying or pushing
- committing

---

## 10. Summary

| Stage | Status |
|---|---|
| MySQL dependency | satisfied (Phase 7C) |
| Compose definition | valid, standalone |
| Host port `3101` | observed free at planning time |
| Image build | not yet performed |
| Backend start | not yet performed |
| `.env` value alignment | requires operator confirmation (see §4.1) |
| Image healthcheck tooling | requires post-build confirmation (see §4.2) |

When all confirmations in §4 and §5 are green and approval is granted,
the §6 sequence can proceed.
