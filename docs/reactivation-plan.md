# CTFlow — Safe Reactivation Plan

**Date**: 2026-05-15  
**Status**: planning only; no runtime actions executed.

---

## 1. Objective

Define the safest path to reactivate CTFlow on this host now that runtime ownership mapping confirmed:

- no active CTFlow containers are running
- adjacent active stacks belong to VirAzul, VirAzul dev, and Orchestrator
- a residual CTFlow volume exists

This plan is intentionally conservative and assumes **no container start, no stop, no deploy, and no config mutation** in this phase.

---

## 2. Current state summary

### Repository-declared CTFlow runtime

From the versioned Compose files, CTFlow declares:

- Dev/default:
  - backend on `3000`
  - frontend on `5173`
  - MySQL on `3307`
  - Adminer on `8080`
- Production:
  - backend on `127.0.0.1:3001`
  - frontend on `127.0.0.1:8087`
- Test:
  - MySQL on `3308`

### Active host reality

Those bindings are not currently available as a clean CTFlow runtime target:

- `3000` is occupied by VirAzul
- `3001` is occupied by VirAzul dev/API
- `3307` is occupied by VirAzul
- `3308` is occupied by VirAzul dev
- `5173` is occupied by VirAzul dev
- `8080` is occupied by VirAzul
- Orchestrator uses `3002` and `3003`

### Residual CTFlow artifact

- Docker volume `ctflow-app_ctflow_mysql_data` exists

Implication:
- CTFlow can be reactivated only after a deliberate isolation decision is made.

---

## 3. Reactivation principles

1. Do not reuse adjacent stacks implicitly.
   VirAzul and Orchestrator are separate ownership domains.
2. Prefer isolation over replacement.
   The first CTFlow reactivation should avoid stealing ports from active systems.
3. Treat existing CTFlow volume as sensitive.
   Do not attach, remove, migrate, or overwrite it without explicit approval.
4. Separate planning from execution.
   Port selection, environment isolation, and rollout approval should be completed before any `docker compose up`.

---

## 4. Recommended strategy

### Recommended path: isolated first reactivation

The safest reactivation path is to bring CTFlow back as its **own isolated stack** rather than trying to replace or merge with VirAzul runtime immediately.

Reasons:

- current active ports are already claimed
- runtime ownership is clearly separated
- repo/runtime divergence with VirAzul remains unresolved
- isolated reactivation limits accidental impact on neighboring applications

### Not recommended as first move

- Reusing VirAzul containers as if they were CTFlow
- Rebinding CTFlow onto currently occupied host ports
- Treating the residual CTFlow volume as immediately safe to mount
- Attempting production reconciliation before a sandboxed activation succeeds

---

## 5. Safe reactivation sequence

### Phase A — Approval and target definition

Before any runtime action:

1. Approve CTFlow as an independent stack on this host.
2. Approve a non-conflicting host-port set.
3. Decide whether first activation will be:
   - dev/default compose
   - prod compose
   - or a temporary reactivation profile created later with approval

### Phase B — Environment isolation decision

Choose one of these activation modes:

1. Isolated dev reactivation
   Best for smoke validation without touching production-like bindings.
2. Isolated prod-like reactivation
   Best for validating the versioned `docker-compose.prod.yml` path without public cutover.
3. Parallel validation environment
   Best if CTFlow needs to coexist with VirAzul and Orchestrator for an extended period.

### Phase C — Data safety checkpoint

Before attaching any database volume:

1. Confirm whether `ctflow-app_ctflow_mysql_data` contains required data.
2. Confirm whether first activation should use:
   - the residual CTFlow volume
   - a fresh empty volume
   - or a cloned backup volume created later under explicit approval

Until that decision exists, the safest planning assumption is:

- **first reactivation should use a fresh isolated data target, not the residual volume**

### Phase D — Controlled first boot

Only after explicit approval in a later phase:

1. start database only
2. validate container health and port binding
3. start backend
4. validate backend root and health routes
5. start frontend
6. validate frontend root and `/api` proxy behavior

### Phase E — Post-boot validation

Only after runtime activation is approved:

- verify container names and networks match CTFlow expectations
- verify no collision with VirAzul or Orchestrator
- verify frontend-to-backend proxy behavior
- verify health endpoints
- verify data source selection was correct

---

## 6. Decision points that need human approval

1. Whether CTFlow should be reactivated as a fully isolated stack.
2. Whether the first boot should use dev/default or prod compose as base.
3. Whether the residual volume `ctflow-app_ctflow_mysql_data` should be preserved untouched, inspected later, cloned, or reused.
4. Which host ports will be reserved for CTFlow.
5. Whether CTFlow is expected to remain long-term parallel to VirAzul or eventually replace part of it.

---

## 7. Suggested next approved implementation scope

The narrowest safe next scope after this planning phase would be:

1. approve a CTFlow-specific non-conflicting port plan
2. approve an environment isolation plan
3. approve creation of a reactivation-specific Compose override in a future phase
4. approve first boot of database only

That scope is much safer than approving a full multi-service start immediately.

---

## 8. Files supporting this plan

- [environment-isolation-plan.md](/opt/apps/projects/ctflow-app/docs/environment-isolation-plan.md)
- [port-allocation-plan.md](/opt/apps/projects/ctflow-app/docs/port-allocation-plan.md)
- [runtime-ownership-map.md](/opt/apps/projects/ctflow-app/docs/runtime-ownership-map.md)
- [runtime-port-map.md](/opt/apps/projects/ctflow-app/docs/runtime-port-map.md)

---

## 9. Change log

- Planning-only reactivation document created.
- No code, Compose, Nginx, env, Docker runtime, or volume state changed.
