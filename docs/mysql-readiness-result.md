# CTFlow — MySQL Readiness Result

**Date**: 2026-05-15  
**Phase**: 7C — MySQL Readiness Validation  
**Status**: completed successfully.

---

## 1. Scope executed

Read-only readiness validation was performed against the isolated CTFlow MySQL container:

- container status inspection
- Docker health inspection
- container-local connectivity check
- safe read-only SQL queries
- verification of database, schema, tables, and visible users

No schema changes, no seed operations, and no user/database mutations were performed.

---

## 2. Target validated

| Item | Value |
|---|---|
| Container | `ctflow-reactivation-mysql` |
| Project | `ctflow-reactivation` |
| Host bind | `127.0.0.1:3318->3306` |
| Runtime state | `running` |
| Health state | `healthy` |

---

## 3. Readiness checks and results

| Check | Result |
|---|---|
| Docker container running | yes |
| Docker healthcheck healthy | yes |
| `mysqladmin ping` inside container | yes |
| Main CTFlow database present | yes |
| CTFlow schema tables present | yes |
| Visible MySQL users queryable | yes |
| Read-only SQL access as root inside container | yes |

---

## 4. Database and schema findings

### MySQL server identity

Observed:

- MySQL version: `8.0.45`
- Server flavor: `MySQL Community Server - GPL`
- Internal MySQL port: `3306`

### Databases present

Observed databases:

- `gestao_ct_financeiro`
- `information_schema`
- `mysql`
- `performance_schema`
- `sys`

### CTFlow schema confirmation

Confirmed schema:

- `gestao_ct_financeiro`

### Table inventory

Observed `16` tables in `gestao_ct_financeiro`:

- `account_users`
- `accounts`
- `agenda_aulas`
- `agendamentos`
- `alunos`
- `cts`
- `escala_dias`
- `escalas`
- `horarios_aula`
- `mensalidades`
- `migration_horario_para_escala`
- `modalidades`
- `presencas`
- `profissionais`
- `transacoes`
- `users`

### Approximate table row snapshot

Observed row counts from `INFORMATION_SCHEMA.TABLES`:

- `cts`: `2`
- all other listed tables: `0`

This is consistent with a minimally initialized schema plus a small amount of existing CT data.

---

## 5. User visibility findings

Visible MySQL users returned by read-only query:

- `mysql.infoschema@localhost`
- `mysql.session@localhost`
- `mysql.sys@localhost`
- `root@%`
- `root@localhost`

No secrets or password values are reproduced here.

---

## 6. Healthcheck observation

Docker health is green and repeated healthcheck executions are succeeding.

Observed nuance:

- health log output includes the standard `mysqladmin` warning about using a password on the command line

Impact:

- this does not block readiness
- but it is worth tracking as an observability/noise item for a future hardening pass

---

## 7. Conclusion

The isolated CTFlow MySQL instance is ready for backend dependency use.

What is now confirmed:

- the database service is healthy
- the expected CTFlow schema exists
- the schema is queryable
- the first isolated volume boot worked
- the residual CTFlow volume was not involved

This clears the database-readiness gate for any future, separately approved backend-only startup.
