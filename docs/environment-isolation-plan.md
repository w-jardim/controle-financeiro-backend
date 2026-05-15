# CTFlow — Environment Isolation Plan

**Date**: 2026-05-15  
**Status**: planning only.

---

## 1. Goal

Define how CTFlow can be reactivated without colliding with active neighboring stacks on the same host.

Adjacent active environments already confirmed:

- VirAzul
- VirAzul dev/API
- Orchestrator

CTFlow therefore needs a clearly isolated execution boundary.

---

## 2. Isolation options

### Option A — Parallel isolated CTFlow stack

Description:
- CTFlow runs as its own Compose project with unique host ports and its own network.

Pros:
- lowest risk to VirAzul and Orchestrator
- easiest ownership model
- easiest rollback, because adjacent stacks are untouched

Cons:
- requires port remapping or Compose override work in a later approved phase
- may require temporary duplicate ingress rules later

### Option B — Shadow prod-like stack on loopback only

Description:
- CTFlow runs in a prod-like layout but binds only to non-public `127.0.0.1` ports not currently in use.

Pros:
- closer to production behavior
- easier to validate reverse-proxy assumptions later

Cons:
- still requires careful port selection
- can be confused with live prod-like services if naming and docs are weak

### Option C — Replace or absorb adjacent runtime

Description:
- CTFlow would take over bindings or runtime behavior currently served by VirAzul.

Pros:
- could reduce duplicate stacks later

Cons:
- highest risk path
- blocked by current ownership ambiguity
- not appropriate for first reactivation

### Recommendation

Choose **Option A** first, or **Option B** if prod-like validation is the immediate goal.

Do **not** choose Option C as the first activation path.

---

## 3. Isolation boundaries to maintain

### Runtime boundaries

- dedicated Compose project identity
- dedicated Docker network
- dedicated host ports
- no shared container names with VirAzul or Orchestrator

### Data boundaries

- do not assume VirAzul MySQL data is CTFlow data
- do not mount VirAzul volumes into CTFlow
- treat `ctflow-app_ctflow_mysql_data` as a protected artifact until a reuse decision is explicitly approved

### Traffic boundaries

- no public ingress cutover during first reactivation
- no Nginx production routing changes during initial bring-up
- validate locally or on isolated bindings first

---

## 4. Database isolation guidance

For the first reactivation attempt, the safest path is:

1. avoid touching the residual CTFlow volume immediately
2. decide whether the goal is:
   - empty smoke environment
   - historical CTFlow data recovery
   - production-like restoration
3. only after that decision, approve one of:
   - fresh empty volume
   - cloned copy of residual volume
   - direct reuse of residual volume

Risk ranking:

- lowest risk: fresh empty volume
- medium risk: cloned copy of residual volume
- highest risk: direct reuse of residual volume without inspection plan

---

## 5. Network isolation guidance

When reactivation is approved later, CTFlow should:

- use its own Docker bridge network
- avoid joining `virazul_default`
- avoid joining `api-virazul_default`
- avoid joining `orchestrator_orchestrator`

This preserves clean service discovery and keeps backend/frontend naming assumptions predictable.

---

## 6. Minimum approval bundle for isolated reactivation

Before any runtime change, approval should explicitly cover:

1. the chosen isolation option
2. the chosen data strategy
3. the chosen port set
4. whether activation is dev-like or prod-like

Without all four, activation should not start.

---

## 7. Recommended next step

Approve a CTFlow-only parallel isolated stack using non-conflicting loopback or high ports, with a fresh data target for the first smoke run.

That gives the safest path to confirm container behavior before any data-bearing or ingress-bearing activation.
