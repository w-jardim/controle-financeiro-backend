# CTFlow — Data Strategy

**Date**: 2026-05-15  
**Status**: planning only; no volume mounted, created, or deleted.

---

## 1. Objective

Define the safest data strategy for the first approved CTFlow database-only startup.

Current confirmed facts:

- residual volume exists: `ctflow-app_ctflow_mysql_data`
- proposed reactivation project name: `ctflow-reactivation`
- proposed fresh volume name: `ctflow-reactivation_reactivation_mysql_data`
- no containers have been started
- the fresh reactivation volume is not yet materialized in Docker, which is expected before first start

---

## 2. Data assets currently known

### Residual CTFlow volume

| Item | Value |
|---|---|
| Volume name | `ctflow-app_ctflow_mysql_data` |
| Compose project label | `ctflow-app` |
| Compose volume label | `ctflow_mysql_data` |
| Status | exists on host |

Interpretation:

- this is a historical CTFlow data artifact
- it may contain useful data
- it must be treated as protected until an explicit reuse decision exists

### Fresh reactivation volume

| Item | Value |
|---|---|
| Volume name | `ctflow-reactivation_reactivation_mysql_data` |
| Compose project | `ctflow-reactivation` |
| Source in compose | `reactivation_mysql_data` |
| Status | not yet created |

Interpretation:

- this is the proposed clean-slate data target for first startup
- it will only exist after an approved runtime action creates it

---

## 3. Strategy options

### Option A — Fresh empty volume for first boot

Description:
- approve database-only startup using the new isolated reactivation volume
- do not mount the residual volume

Pros:

- lowest operational risk
- no chance of mutating historical CTFlow data
- best fit for smoke validation of MySQL startup, healthcheck, and bind behavior

Cons:

- does not validate historical data recovery
- may not reflect real production data shape

### Option B — Clone residual volume later, then start from clone

Description:
- keep residual volume untouched
- later create an approved copy/clone path
- use the clone for a data-bearing validation run

Pros:

- preserves original artifact
- supports historical-data validation with lower risk than direct reuse

Cons:

- requires additional approved operational steps later
- not needed for the very first database-only smoke start

### Option C — Directly reuse residual volume

Description:
- mount `ctflow-app_ctflow_mysql_data` directly into a future CTFlow MySQL start

Pros:

- fastest path to historical data visibility

Cons:

- highest risk
- could mutate the only known CTFlow residual data artifact
- not appropriate for first startup without deeper approval and recovery planning

---

## 4. Recommendation

For the **first database-only startup**, choose **Option A**:

- use a fresh isolated volume
- keep the residual volume untouched
- defer any historical-data handling to a later explicit decision

This matches the safety posture already established in Phases 5 and 6.

---

## 5. Why the fresh-volume path is the safest now

1. It validates container boot mechanics without risking historical data.
2. It confirms the isolated project namespacing behaves as intended.
3. It avoids accidental coupling to unknown legacy database state.
4. It keeps rollback simple: if startup fails, no residual CTFlow data was mounted.

---

## 6. Decision points for human approval

Before any database-only startup, approval should explicitly state:

1. whether first start uses the fresh isolated volume
2. whether the residual volume must remain fully untouched
3. whether historical CTFlow data recovery is deferred to a later phase

Recommended approval wording:

- approve first database-only startup using `ctflow-reactivation_reactivation_mysql_data`
- do not mount or alter `ctflow-app_ctflow_mysql_data`

---

## 7. Phase 7A conclusion

Data strategy is ready for approval if the goal is a low-risk first boot.

The only strategy recommended for that first step is:

- fresh isolated volume for startup
- residual CTFlow volume preserved untouched
