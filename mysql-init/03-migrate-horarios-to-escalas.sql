-- Migration script: Migrar dados de horarios_aula -> escalas + escala_dias
-- Também criar entradas em agenda_aulas a partir de agendamentos, preservando vínculo
-- Data: 2026-04-03
-- INSTRUÇÕES IMPORTANTES:
-- 1) Execute em ambiente de staging primeiro.
-- 2) Não remova a tabela `horarios_aula` ou a coluna `agendamentos.horario_aula_id` neste script.
-- 3) Este script cria colunas/entradas temporárias (`migration_horario_para_escala`, `agenda_aulas.source_agendamento_id`, `agendamentos.agenda_aula_id`) para permitir validação e rollback.

-- ========== 0) Pré-checagens ==========
SELECT COUNT(*) AS total_horarios FROM horarios_aula;
SELECT COUNT(*) AS total_agendamentos FROM agendamentos;

-- ========== 1) Cria tabela de mapeamento (se ainda não existir) ==========
CREATE TABLE IF NOT EXISTS migration_horario_para_escala (
  horario_id INT PRIMARY KEY,
  escala_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Use INSERT IGNORE + UNIQUE constraint on escalas to ensure idempotência
INSERT IGNORE INTO escalas (account_id, ct_id, profissional_id, modalidade_id, hora_inicio, hora_fim, ativo)
SELECT DISTINCT account_id, ct_id, profissional_id, modalidade_id, hora_inicio, hora_fim, COALESCE(ativo, 1)
FROM horarios_aula;

-- After insertion, escalas must contain one row per distinct group. The UNIQUE constraint prevents duplicates on re-run.

-- Populate mapping using matching unique columns on escalas
INSERT IGNORE INTO migration_horario_para_escala (horario_id, escala_id)
SELECT h.id AS horario_id, e.id AS escala_id
FROM horarios_aula h
JOIN escalas e ON e.account_id = h.account_id AND e.ct_id = h.ct_id AND e.profissional_id = h.profissional_id AND e.modalidade_id = h.modalidade_id AND e.hora_inicio = h.hora_inicio AND e.hora_fim = h.hora_fim
WHERE NOT EXISTS (SELECT 1 FROM migration_horario_para_escala m WHERE m.horario_id = h.id);

-- Detect any horários that could not be mapped (sinal de problema) or that map to a escala with inconsistent data
SELECT h.id AS horario_id, h.account_id AS horario_account, h.ct_id AS horario_ct, h.profissional_id AS horario_profissional, h.modalidade_id AS horario_modalidade, h.hora_inicio AS horario_hora_inicio, h.hora_fim AS horario_hora_fim,
       m.escala_id, e.account_id AS escala_account, e.ct_id AS escala_ct, e.profissional_id AS escala_profissional, e.modalidade_id AS escala_modalidade, e.hora_inicio AS escala_hora_inicio, e.hora_fim AS escala_hora_fim
FROM horarios_aula h
LEFT JOIN migration_horario_para_escala m ON m.horario_id = h.id
LEFT JOIN escalas e ON e.id = m.escala_id
WHERE m.escala_id IS NULL OR (
  e.account_id <> h.account_id OR e.ct_id <> h.ct_id OR e.profissional_id <> h.profissional_id OR e.modalidade_id <> h.modalidade_id OR e.hora_inicio <> h.hora_inicio OR e.hora_fim <> h.hora_fim
);

-- If the previous SELECT returns rows, manual intervention is required before proceeding.

INSERT IGNORE INTO escala_dias (escala_id, dia_semana)
SELECT m.escala_id, h.dia_semana
FROM horarios_aula h
JOIN migration_horario_para_escala m ON m.horario_id = h.id
LEFT JOIN escala_dias ed ON ed.escala_id = m.escala_id AND ed.dia_semana = h.dia_semana
WHERE ed.id IS NULL;

-- ========== 5) Preparar colunas de transição para agendamentos ==========
-- Adiciona coluna agenda_aula_id em agendamentos, se não existir
ALTER TABLE agendamentos ADD COLUMN agenda_aula_id INT NULL;

-- Adiciona coluna temporária source_agendamento_id em agenda_aulas para mapear origem


-- Insert agenda_aulas only when no agenda exists for that agendamento (ensured by unique constraint on source_agendamento_id)
INSERT INTO agenda_aulas (account_id, ct_id, escala_id, profissional_id, modalidade_id, data_aula, hora_inicio, hora_fim, status, observacao, source_agendamento_id)
SELECT a.account_id,
       h.ct_id,
       m.escala_id,
       h.profissional_id,
       h.modalidade_id,
       a.data_aula,
       h.hora_inicio,
       h.hora_fim,
       -- Map old agendamento.status values to new agenda_aulas.status ENUM
       CASE
         WHEN a.status = 'agendado' THEN 'liberada'
         WHEN a.status = 'cancelado' THEN 'cancelada'
         WHEN a.status IN ('compareceu','faltou') THEN 'encerrada'
         ELSE 'rascunho'
       END AS status,
       a.observacao,
       a.id AS source_agendamento_id
FROM agendamentos a
LEFT JOIN horarios_aula h ON a.horario_aula_id = h.id
LEFT JOIN migration_horario_para_escala m ON h.id = m.horario_id
WHERE a.horario_aula_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM agenda_aulas ag WHERE ag.source_agendamento_id = a.id);

-- Validate: agendamentos that reference horarios_aula but did not produce agenda_aulas (possible missing horarios or other inconsistency)
SELECT a.id AS agendamento_id, a.horario_aula_id, m.escala_id
FROM agendamentos a
LEFT JOIN horarios_aula h ON a.horario_aula_id = h.id
LEFT JOIN migration_horario_para_escala m ON h.id = m.horario_id
LEFT JOIN agenda_aulas ag ON ag.source_agendamento_id = a.id
WHERE a.horario_aula_id IS NOT NULL AND ag.id IS NULL;

-- Only set if NULL to avoid overwriting manual corrections. Report discrepancies where value exists but points to a different agenda_aulas record.
UPDATE agendamentos a
JOIN agenda_aulas ag ON ag.source_agendamento_id = a.id
SET a.agenda_aula_id = ag.id
WHERE a.agenda_aula_id IS NULL;

-- Report agendamentos where agenda_aula_id is set but inconsistent with mapping
SELECT a.id AS agendamento_id, a.agenda_aula_id, ag.id AS mapped_agenda_id
FROM agendamentos a
LEFT JOIN agenda_aulas ag ON ag.source_agendamento_id = a.id
WHERE a.agenda_aula_id IS NOT NULL AND ag.id IS NOT NULL AND a.agenda_aula_id <> ag.id;

-- ========== 8) Verificações pós-migração (consultas para validação humana)
-- 8.1 Contagens gerais
SELECT (SELECT COUNT(*) FROM horarios_aula) AS horarios_before,
       (SELECT COUNT(DISTINCT escala_id) FROM migration_horario_para_escala) AS escalas_created_by_mapping,
       (SELECT COUNT(*) FROM escalas) AS escalas_total;

SELECT (SELECT COUNT(*) FROM agendamentos) AS agendamentos_before,
       (SELECT COUNT(*) FROM agenda_aulas) AS agenda_aulas_total,
       (SELECT COUNT(*) FROM agendamentos WHERE agenda_aula_id IS NOT NULL) AS agendamentos_mapeados;

-- 8.2 Conferência de vínculos: agendamentos que não encontraram horário correspondente
SELECT a.id AS agendamento_id, a.horario_aula_id
FROM agendamentos a
LEFT JOIN migration_horario_para_escala m ON m.horario_id = a.horario_aula_id
WHERE a.horario_aula_id IS NOT NULL AND m.horario_id IS NULL;

-- 8.3 Conferência dias da semana: garantir que todos os dias foram migrados
SELECT h.id AS horario_id, h.dia_semana, m.escala_id
FROM horarios_aula h
LEFT JOIN migration_horario_para_escala m ON m.horario_id = h.id
LEFT JOIN escala_dias ed ON ed.escala_id = m.escala_id AND ed.dia_semana = h.dia_semana
WHERE ed.id IS NULL;

-- 8.4 Conferência account_id consistência
SELECT h.id AS horario_id, h.account_id AS horario_account, e.id AS escala_id, e.account_id AS escala_account
FROM horarios_aula h
LEFT JOIN migration_horario_para_escala m ON m.horario_id = h.id
LEFT JOIN escalas e ON e.id = m.escala_id
WHERE e.id IS NOT NULL AND h.account_id <> e.account_id;

-- ========== 9) Recomendações pós-migração ==========
-- 9.1 Revisar resultados das consultas acima; corrigir quaisquer inconsistências manualmente.
-- 9.2 Após validação completa, remover coluna temporária agenda_aula_id de agendamentos e source_agendamento_id de agenda_aulas se desejado.
-- 9.3 Somente após aprovação, considerar exclusão ou arquivamento da tabela `horarios_aula`.

-- FIM DO SCRIPT
