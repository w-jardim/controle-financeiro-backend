# CTFlow — Runtime Ownership Map

**Date**: 2026-05-15  
**Method**: read-only Docker metadata inspection (`docker ps`, `docker inspect`, `docker network inspect`, `docker volume inspect`).

---

## 1. Executive summary

At the time of inspection, **no running containers on this host belong to the `ctflow-app` repository**.

The active application stacks observed are:

- `virazul` — likely the current production-like runtime serving ports `3000`, `8080`, `3307`
- `api-virazul` — likely a separate dev stack serving ports `3001`, `5173`, `3308`
- `orchestrator` — a distinct application stack serving ports `3002`, `3003`

There is also evidence of a **residual CTFlow Compose artifact**:

- Docker volume `ctflow-app_ctflow_mysql_data`

That means CTFlow currently exists in this workspace as a repository and Compose definition, but **not as an active running stack** on this host.

---

## 2. Ownership evidence used

Ownership was determined from:

- container names
- image names
- Compose labels:
  - `com.docker.compose.project`
  - `com.docker.compose.service`
  - `com.docker.compose.project.working_dir`
  - `com.docker.compose.project.config_files`
- Docker network membership
- Docker volume labels when applicable

---

## 3. Running container classification

| Container | Compose project label | Working dir label | Network | Classification | Notes |
|---|---|---|---|---|---|
| `virazul-backend` | `virazul` | `/opt/apps/projects/virazul` | `virazul_default` | VirAzul | Not CTFlow |
| `virazul-frontend` | `virazul` | `/opt/apps/projects/virazul` | `virazul_default` | VirAzul | Not CTFlow |
| `virazul-mysql` | `virazul` | `/opt/apps/projects/virazul` | `virazul_default` | VirAzul | Not CTFlow |
| `virazul-api-dev` | `api-virazul` | `/opt/apps/projects/virazul-dev/api-virazul` | `api-virazul_default` | VirAzul dev | Separate dev stack |
| `viraazul-mysql-dev` | `api-virazul` | `/opt/apps/projects/virazul-dev/api-virazul` | `api-virazul_default` | VirAzul dev | Occupies host port `3308` |
| `virazul-app-dev` | `api-virazul` | `/opt/apps/projects/virazul-dev/api-virazul` | `api-virazul_default` | VirAzul dev | Vite dev frontend |
| `orchestrator-backend` | `orchestrator` | `/opt/apps/projects/orchestrator` | `orchestrator_orchestrator` | Orchestrator | Distinct project |
| `orchestrator-frontend` | `orchestrator` | `/opt/apps/projects/orchestrator` | `orchestrator_orchestrator` | Orchestrator | Distinct project |
| `orchestrator-mysql` | `orchestrator` | `/opt/apps/projects/orchestrator` | `orchestrator_orchestrator` | Orchestrator | Internal-only DB |
| `orchestrator-redis` | `orchestrator` | `/opt/apps/projects/orchestrator` | `orchestrator_orchestrator` | Orchestrator | Internal-only cache |

---

## 4. CTFlow status on this host

### What was expected from this repository

The repository at `/opt/apps/projects/ctflow-app` declares these production container names in [docker-compose.prod.yml](/opt/apps/projects/ctflow-app/docker-compose.prod.yml):

- `ctflow-mysql`
- `ctflow-backend`
- `ctflow-frontend`

It also declares these dev container names in [docker-compose.yml](/opt/apps/projects/ctflow-app/docker-compose.yml) and [docker-compose.dev.yml](/opt/apps/projects/ctflow-app/docker-compose.dev.yml):

- `mysql-financeiro-dev`
- `financeiro-backend-dev`
- `financeiro-frontend-dev`
- `adminer-financeiro-dev`

### What was actually found

No running or stopped containers matching:

- `ctflow-*`
- `financeiro-*`

No active Docker network matching:

- `ctflow-*`
- `financeiro-*`

### Residual artifact found

The following Docker volume exists:

- `ctflow-app_ctflow_mysql_data`

Volume metadata shows:

- Compose project label: `ctflow-app`
- Compose volume label: `ctflow_mysql_data`

This is consistent with a **previous CTFlow Compose lifecycle**, but without any currently attached running containers.

---

## 5. Ownership conclusions

### CTFlow

- Repository exists at `/opt/apps/projects/ctflow-app`
- Compose files are versioned locally
- No active CTFlow containers were found
- One CTFlow-namespaced volume exists and is likely residual

### VirAzul

- `virazul` is an active stack from `/opt/apps/projects/virazul`
- `api-virazul` is a separate active dev stack from `/opt/apps/projects/virazul-dev/api-virazul`
- These stacks currently occupy the main ports that overlap with CTFlow expectations

### Orchestrator

- Active and clearly separated by project label, path, and network
- Its unhealthy frontend healthcheck belongs to the Orchestrator project, not CTFlow

### Legacy / orphaned candidates

- `ctflow-app_ctflow_mysql_data` is the clearest orphaned/residual CTFlow artifact
- Any assumption that current `virazul-*` containers are "CTFlow runtime" is inaccurate from an ownership perspective
  - they may be functionally related
  - but Docker metadata shows they belong to another project tree

---

## 6. Implications for future work

1. CTFlow runtime fixes cannot be safely applied by editing this repository alone unless a new CTFlow deployment target is explicitly chosen.
2. The false-negative frontend healthcheck previously diagnosed belongs to the `orchestrator` stack, not CTFlow.
3. Port conflicts affecting CTFlow test plans are caused by the active `api-virazul` dev stack, especially `viraazul-mysql-dev` on `3308`.
4. Any "production reconciliation" plan must first decide whether CTFlow should:
   - deploy as its own `ctflow-*` stack,
   - replace part of VirAzul,
   - or remain documentation-only until ownership is clarified.

---

## 7. Reactivation guidance

Based on current ownership, the safest reactivation path is:

1. Reactivate CTFlow as an independent stack.
2. Avoid reusing VirAzul or Orchestrator runtime resources.
3. Preserve the residual CTFlow volume until a data-handling decision is approved.
4. Use non-conflicting ports and a dedicated CTFlow network in a future approved execution phase.

---

## 8. Change log

- Read-only runtime ownership mapping completed.
- No containers, networks, volumes, code, or config were modified.
