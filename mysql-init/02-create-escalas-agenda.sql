-- Migration: criar tabelas escalas, escala_dias e agenda_aulas
-- Data: 2026-04-01

-- 1) Tabela escalas (regra recorrente)
CREATE TABLE IF NOT EXISTS escalas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  ct_id INT NOT NULL,
  profissional_id INT NOT NULL,
  modalidade_id INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Unicidade lógica para evitar duplicação em reexecução da migration
  UNIQUE KEY uq_escalas_unica (account_id, ct_id, profissional_id, modalidade_id, hora_inicio, hora_fim, ativo),

  -- Índices para consultas frequentes
  INDEX idx_escalas_account_id (account_id),
  INDEX idx_escalas_ct_id (ct_id),
  INDEX idx_escalas_profissional_id (profissional_id),
  INDEX idx_escalas_modalidade_id (modalidade_id),

  CONSTRAINT fk_escalas_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_escalas_ct FOREIGN KEY (ct_id) REFERENCES cts(id) ON DELETE CASCADE,
  CONSTRAINT fk_escalas_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  CONSTRAINT fk_escalas_modalidade FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE,

  -- Integridade extra (checar que hora_fim > hora_inicio)
  CHECK (hora_fim > hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Tabela de dias por escala (pivot)
CREATE TABLE IF NOT EXISTS escala_dias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  escala_id INT NOT NULL,
  dia_semana TINYINT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_escala_dia (escala_id, dia_semana),

  INDEX idx_escala_dias_escala_id (escala_id),
  CONSTRAINT fk_escala_dias_escala FOREIGN KEY (escala_id) REFERENCES escalas(id) ON DELETE CASCADE,

  -- Dia da semana: 0..6 conforme validação existente no código (zod)
  CHECK (dia_semana BETWEEN 0 AND 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Tabela agenda_aulas (ocorrências operacionais)
CREATE TABLE IF NOT EXISTS agenda_aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  ct_id INT NOT NULL,
  escala_id INT DEFAULT NULL,
  profissional_id INT NOT NULL,
  modalidade_id INT NOT NULL,
  data_aula DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status ENUM('rascunho','liberada','cancelada','encerrada') NOT NULL DEFAULT 'rascunho',
  observacao TEXT DEFAULT NULL,
  source_agendamento_id INT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Índices sugeridos para consultas por conta / data / escala / status
  INDEX idx_agenda_account_id (account_id),
  INDEX idx_agenda_ct_id (ct_id),
  INDEX idx_agenda_escala_id (escala_id),
  INDEX idx_agenda_profissional_id (profissional_id),
  INDEX idx_agenda_data_aula (data_aula),
  INDEX idx_agenda_status (status),
  INDEX idx_agenda_modalidade_id (modalidade_id),
  INDEX idx_agenda_account_data (account_id, data_aula),
  INDEX idx_agenda_escala_data (escala_id, data_aula),

  -- Garantir unicidade de mapeamento one-to-one (um agendamento -> no máximo uma agenda_aula)
  UNIQUE KEY uq_agenda_source_agendamento (source_agendamento_id),

  CONSTRAINT fk_agenda_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_agenda_ct FOREIGN KEY (ct_id) REFERENCES cts(id) ON DELETE CASCADE,
  CONSTRAINT fk_agenda_escala FOREIGN KEY (escala_id) REFERENCES escalas(id) ON DELETE SET NULL,
  CONSTRAINT fk_agenda_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  CONSTRAINT fk_agenda_modalidade FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE,
  CONSTRAINT fk_agenda_source_agendamento FOREIGN KEY (source_agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,

  CHECK (hora_fim > hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Observação e plano de migração
-- A migração de dados de horarios_aula para escalas deve ser executada com cautela.
-- Sugerimos seguir estes passos manualmente (script a parte):
--  a) Inserir em `escalas` uma linha por cada grupo lógico de horarios_aula que representam a mesma regra.
--  b) Para cada horario_aula existente, inserir escala_dias correspondentes com o dia_semana.
--  c) Para cada registro em `agendamentos`, criar correspondência em `agenda_aulas` e armazenar novo id em coluna temporária (adicionar coluna `agenda_aula_id` em agendamentos antes de migrar).
--  d) Validar integridade, executar testes e somente então remover coluna `horario_aula_id` e a tabela `horarios_aula` se desejado.
