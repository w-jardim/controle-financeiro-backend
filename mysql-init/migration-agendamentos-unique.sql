-- ==============================================================
-- MIGRATION: UNIQUE CONSTRAINT em AGENDAMENTOS
-- ==============================================================
-- Objetivo: impedir duplicidade de agendamento do mesmo aluno
-- no mesmo horário e data dentro da mesma account.
-- ==============================================================

-- ETAPA 1 — DETECÇÃO DE DUPLICADOS

-- 1a) Contar grupos duplicados
SELECT account_id, aluno_id, horario_aula_id, data_aula, COUNT(*) AS qtd
FROM agendamentos
GROUP BY account_id, aluno_id, horario_aula_id, data_aula
HAVING COUNT(*) > 1;

-- 1b) IDs duplicados (todos exceto o mais antigo por grupo)
SELECT a.id
FROM agendamentos a
INNER JOIN (
  SELECT account_id, aluno_id, horario_aula_id, data_aula, MIN(id) AS id_manter
  FROM agendamentos
  GROUP BY account_id, aluno_id, horario_aula_id, data_aula
  HAVING COUNT(*) > 1
) dup ON a.account_id = dup.account_id
      AND a.aluno_id = dup.aluno_id
      AND a.horario_aula_id = dup.horario_aula_id
      AND a.data_aula = dup.data_aula
      AND a.id <> dup.id_manter;

-- 1c) Inspeção detalhada dos duplicados
SELECT a.*
FROM agendamentos a
INNER JOIN (
  SELECT account_id, aluno_id, horario_aula_id, data_aula
  FROM agendamentos
  GROUP BY account_id, aluno_id, horario_aula_id, data_aula
  HAVING COUNT(*) > 1
) dup ON a.account_id = dup.account_id
      AND a.aluno_id = dup.aluno_id
      AND a.horario_aula_id = dup.horario_aula_id
      AND a.data_aula = dup.data_aula
ORDER BY a.account_id, a.aluno_id, a.horario_aula_id, a.data_aula, a.id;

-- ==============================================================
-- ETAPA 2 — SANEAMENTO (idempotente)
-- Remove duplicados mantendo o registro mais antigo (menor id)
-- ==============================================================

DELETE a
FROM agendamentos a
INNER JOIN (
  SELECT account_id, aluno_id, horario_aula_id, data_aula, MIN(id) AS id_manter
  FROM agendamentos
  GROUP BY account_id, aluno_id, horario_aula_id, data_aula
  HAVING COUNT(*) > 1
) dup ON a.account_id = dup.account_id
      AND a.aluno_id = dup.aluno_id
      AND a.horario_aula_id = dup.horario_aula_id
      AND a.data_aula = dup.data_aula
      AND a.id <> dup.id_manter;

-- ==============================================================
-- ETAPA 3 — CONSTRAINT UNIQUE (idempotente)
-- ==============================================================

SET @constraint_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'agendamentos'
    AND CONSTRAINT_NAME = 'uq_agendamento_unico'
);

SET @ddl = IF(@constraint_exists = 0,
  'ALTER TABLE agendamentos ADD CONSTRAINT uq_agendamento_unico UNIQUE (account_id, aluno_id, horario_aula_id, data_aula)',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
