# CTFlow — Compose Reactivation Override

**Date**: 2026-05-15
**Phase**: 6B — Prepare Isolated Compose Override
**Status**: proposal only; no containers started; no existing Compose file modified.
**File proposed**: [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml)

---

## 1. Why a new file

Phase 6A confirmed:

- all four existing Compose files resolve through `docker compose config`,
- but the declared port layout is not startable on this host because
  VirAzul and Orchestrator already occupy `3000`, `3001`, `3002`, `3003`,
  `3307`, `3308`, `5173`, and `8080`,
- and a residual CTFlow MySQL volume exists
  (`ctflow-app_ctflow_mysql_data`) for which no reuse decision has been
  approved yet.

The existing `docker-compose.yml`, `docker-compose.dev.yml`,
`docker-compose.prod.yml`, and `docker-compose.test.yml` were therefore
left untouched. Reactivation work is concentrated in a single new file
that can be reviewed, approved, and discarded independently.

---

## 2. Design choices

### 2.1 Standalone, not layered

`docker-compose.reactivation.yml` is a complete Compose definition, not a
partial overlay. It is intended to be used by itself:

```
docker compose -f docker-compose.reactivation.yml config
```

Reasoning:

- a layered override could merge with `docker-compose.prod.yml` and
  silently re-attach the residual volume `ctflow-app_ctflow_mysql_data`
  through the `ctflow_mysql_data:` named-volume declaration there,
- a layered override could also pick up `container_name`, `network`, and
  `restart` values from a different file at merge time, making the
  effective configuration harder to audit.

A standalone file makes the effective configuration explicit.

### 2.2 Pinned Compose project name

The file sets `name: ctflow-reactivation`. As a result:

- the network materializes as `ctflow-reactivation_ctflow-reactivation-net`,
- the named volume materializes as
  `ctflow-reactivation_reactivation_mysql_data`,
- containers materialize under the names declared in `container_name:`.

None of those names overlap with VirAzul, Orchestrator, or the existing
CTFlow residual resources.

### 2.3 Volume isolation

The MySQL service uses a fresh named volume `reactivation_mysql_data`.

It does **not** mount `ctflow-app_ctflow_mysql_data`. The residual
volume is neither read, written, nor destroyed by this proposal.

If reviewers later decide that the residual volume should be reused,
that becomes a separate, explicitly approved change (a Phase 7 decision,
not 6B).

### 2.4 Port allocation

| Service | Internal | Host bind | Source of recommendation |
|---|---:|---|---|
| backend | `3000` | `127.0.0.1:3101` | Phase 6A candidate list |
| mysql | `3306` | `127.0.0.1:3318` | Phase 6B brief; replaces the prior `3317` candidate |
| frontend | `80` | `127.0.0.1:8187` | Phase 6A candidate list |
| cloudbeaver (optional) | `8978` | `127.0.0.1:8188` | Phase 6A candidate list |

All four candidate host ports were re-checked during Phase 6B and
observed not listening at inspection time. They are not reservations.
They must be re-checked again immediately before any future start.

### 2.5 Loopback only

Every published port binds to `127.0.0.1`. No `0.0.0.0` binding exists
in this file. That keeps the first reactivation invisible to the host's
external network surface.

### 2.6 MySQL not public

MySQL is bound to `127.0.0.1:3318` only. It is reachable for local
validation tooling but is not exposed off-host. There is no public
mapping path through this file.

### 2.7 `restart: "no"`

All services use `restart: "no"`. A misconfigured first boot will fail
once rather than enter a restart loop and consume the host.

### 2.8 Healthchecks added

- `mysql` keeps a healthcheck but avoids embedding the password in
  command arguments. The check uses `CMD-SHELL` with `$$`-escaped env
  expansion so the password is read from the container's runtime
  environment at exec time and does not appear in
  `docker compose config` resolved output.
- `backend` adds a tentative healthcheck against `/ping`.
- `frontend` adds a tentative healthcheck against the root path.

These two app-level healthchecks are explicitly marked as **tentative**.
They presume `curl` (backend) and `wget` (frontend) are present in the
respective images. This must be confirmed before approval to start.

### 2.9 Dependency on health, not just start

`backend.depends_on.mysql` and `frontend.depends_on.backend` both
require `service_healthy`. Combined with the healthchecks above, this
addresses Phase 6A's Blocker 3 (production compose only sequencing on
`depends_on` start).

---

## 3. Constraints honored

| Constraint from Phase 6B brief | Honored? | Where |
|---|---|---|
| Do not modify `docker-compose.yml` | yes | not edited |
| Do not modify `docker-compose.dev.yml` | yes | not edited |
| Do not modify `docker-compose.prod.yml` | yes | not edited |
| Do not modify `docker-compose.test.yml` | yes | not edited |
| Do not modify Dockerfile | yes | not edited |
| Do not modify `.env` or `.env.*` | yes | not edited |
| Do not print secrets | yes | docs reference variable names only |
| Do not modify source code | yes | not edited |
| Do not modify Nginx | yes | not edited |
| Do not modify database scripts | yes | `mysql-init/` mounted read-only |
| Do not start containers | yes | only file creation |
| All published ports on `127.0.0.1` | yes | every `ports:` entry uses `127.0.0.1:` |
| Avoid known used ports | yes | candidate set from Phase 6A |
| Do not reuse VirAzul or Orchestrator ports | yes | `3101`/`3318`/`8187`/`8188` only |
| MySQL not exposed publicly | yes | loopback bind only |
| No mount or destroy of residual volume | yes | dedicated `reactivation_mysql_data` |

---

## 4. Open items for Phase 7 approval

Before any `docker compose up` is approved, the reviewer should resolve:

1. **Data strategy.** This file uses a fresh empty volume. If the
   residual volume should be reused or cloned instead, that decision
   must be recorded and the file updated.
2. **Activation mode.** This file is shaped for prod-like validation
   (built images, port 80 nginx frontend). If a dev-like first boot is
   preferred (Vite on 5173, bind mounts), a separate override should be
   proposed; this one should not be repurposed silently.
3. **Healthcheck tooling.** Confirm `curl` exists in the backend image
   and `wget` exists in the frontend image, or replace the healthcheck
   bodies with image-appropriate commands.
4. **CloudBeaver enablement.** Currently commented out. Enable only if
   there is a stated reason to introduce a DB UI on first boot.
5. **Secret handling for execution.** Even with the password no longer
   in the healthcheck command line, `docker compose config` still
   expands env variables. Any operational log that captures resolved
   config must be redacted before sharing.
6. **Port re-verification at execution time.** The candidate ports are
   not reservations. Re-check listening state immediately before start.

---

## 5. Reviewer checklist

- [ ] `docker compose -f docker-compose.reactivation.yml config` resolves
      successfully (read-only command — does not start anything).
- [ ] No published port appears outside `127.0.0.1:` in the resolved output.
- [ ] No service references the volume `ctflow_mysql_data` or the
      project-prefixed `ctflow-app_ctflow_mysql_data`.
- [ ] No container name collides with active runtime
      (`virazul-*`, `orchestrator-*`, `ctflow-backend`, `ctflow-frontend`,
      `ctflow-mysql`, `financeiro-*-dev`, `adminer-*`,
      `mysql-financeiro-dev`).
- [ ] No host port collides at the moment of execution (recheck `3101`,
      `3318`, `8187`, `8188`).
- [ ] `.env` is present and contains the variables the file references.
- [ ] Secret-bearing resolved config output is not stored in shared logs.

---

## 6. Out of scope for this phase

- Building images.
- Starting any container.
- Modifying the residual volume.
- Modifying any existing Compose file, Dockerfile, Nginx config, or
  database script.
- Choosing dev-like vs prod-like first boot — recorded as an open item.
- Reverse proxy integration.

---

## 7. Cross-references

- [docs/compose-validation.md](/opt/apps/projects/ctflow-app/docs/compose-validation.md) — Phase 6A
- [docs/port-allocation-plan.md](/opt/apps/projects/ctflow-app/docs/port-allocation-plan.md) — port strategy
- [docs/runtime-port-map.md](/opt/apps/projects/ctflow-app/docs/runtime-port-map.md) — runtime ownership of ports
- [docs/reactivation-readiness.md](/opt/apps/projects/ctflow-app/docs/reactivation-readiness.md) — readiness verdict
- [docs/reactivation-plan.md](/opt/apps/projects/ctflow-app/docs/reactivation-plan.md) — broader reactivation roadmap

---

## 8. Phase 7A clarification

Additional planning validation in Phase 7A confirmed:

- the file behaves as intended when resolved standalone with
  `docker compose -f docker-compose.reactivation.yml config`
- the fresh target volume `ctflow-reactivation_reactivation_mysql_data`
  is not yet present, which is expected before first approved startup
- the residual volume `ctflow-app_ctflow_mysql_data` remains present and untouched
- port `127.0.0.1:3318` was free at inspection time

Important:

- this file should continue to be treated as a **standalone Compose file**
- combining it with `docker-compose.prod.yml` changes the effective config
  by merging in extra networks and published ports, which is outside the
  intended blast radius of the first database-only startup
