# CTFlow — Database-Only Startup Plan

**Date**: 2026-05-15  
**Status**: approval plan only; no container started.

---

## 1. Objective

Prepare the narrowest safe approval package for a **database-only** CTFlow startup.

Target service:

- `mysql` from [docker-compose.reactivation.yml](/opt/apps/projects/ctflow-app/docker-compose.reactivation.yml)

Target project:

- `ctflow-reactivation`

Target host bind:

- `127.0.0.1:3318 -> 3306`

Target data volume:

- `ctflow-reactivation_reactivation_mysql_data` (fresh volume, not yet materialized)

---

## 2. Preconditions already validated

The following were confirmed in this phase:

1. `docker-compose.reactivation.yml` exists.
2. Standalone resolution works with `docker compose -f docker-compose.reactivation.yml config`.
3. The standalone resolved config contains:
   - service `mysql`
   - project name `ctflow-reactivation`
   - named volume `reactivation_mysql_data`
   - network `ctflow-reactivation-net`
4. Candidate startup port `127.0.0.1:3318` was not listening at inspection time.
5. Residual volume `ctflow-app_ctflow_mysql_data` exists.
6. Proposed fresh reactivation volume is separate and is not yet present, which is expected before first start.

---

## 3. Important execution boundary

The first approved database-only startup should use the **standalone reactivation file only**:

```bash
docker compose -f docker-compose.reactivation.yml ...
```

It should **not** be layered with `docker-compose.prod.yml`.

Reason:

- layering with `docker-compose.prod.yml` reintroduces extra ports, networks, and merged service config not intended for the isolated first boot
- the reactivation file was explicitly designed as standalone

---

## 4. Proposed startup scope

### What the future approved command should do

- create the isolated reactivation network if needed
- create the fresh isolated reactivation volume if needed
- start only the `mysql` service

### What it must not do

- start backend
- start frontend
- attach the residual CTFlow volume
- modify existing VirAzul or Orchestrator resources

---

## 5. Planned validation targets after startup

If the future startup is approved, the immediate validation goals should be:

1. confirm container starts under project `ctflow-reactivation`
2. confirm published port is `127.0.0.1:3318`
3. confirm volume created is `ctflow-reactivation_reactivation_mysql_data`
4. confirm healthcheck transitions to healthy
5. confirm residual volume `ctflow-app_ctflow_mysql_data` remains untouched

No application-layer or migration validation should be bundled into this first DB-only step.

---

## 6. Known risks even for DB-only startup

### Low-to-medium risk

- MySQL image boot could fail due to config or env mismatch
- `mysql-init` scripts may influence first-boot behavior on a fresh volume
- future logs may include sensitive runtime details if not handled carefully

### Contained by current design

- loopback-only bind on `127.0.0.1:3318`
- `restart: "no"`
- isolated project name
- isolated fresh volume
- no residual volume mount

---

## 7. Approval checklist

- [ ] Approve use of `docker-compose.reactivation.yml` as a standalone file
- [ ] Approve starting only the `mysql` service
- [ ] Approve using fresh volume `ctflow-reactivation_reactivation_mysql_data`
- [ ] Approve leaving `ctflow-app_ctflow_mysql_data` untouched
- [ ] Approve rechecking `127.0.0.1:3318` immediately before execution
- [ ] Approve redaction discipline for any command output containing env-expanded configuration

---

## 8. Recommended next approved action

The narrowest safe next step is:

1. approve database-only startup with the standalone reactivation file
2. recheck port `3318`
3. start only `mysql`
4. inspect health and created resources

That is the smallest blast-radius move available for CTFlow reactivation.
