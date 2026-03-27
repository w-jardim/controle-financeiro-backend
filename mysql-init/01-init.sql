-- ============================================
-- CONFIGURAÇÃO INICIAL
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- TABELA: ACCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'ct_owner',
  plano VARCHAR(50) NOT NULL DEFAULT 'basic',
  status VARCHAR(50) NOT NULL DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: ACCOUNT_USERS
-- ============================================

CREATE TABLE IF NOT EXISTS account_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner','admin','user') NOT NULL DEFAULT 'user',
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_account_user (account_id, user_id),
  INDEX idx_account_users_account_id (account_id),
  INDEX idx_account_users_user_id (user_id),

  CONSTRAINT fk_account_users_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_account_users_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: CTS
-- ============================================

CREATE TABLE IF NOT EXISTS cts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_ct_nome_por_account (account_id, nome),
  INDEX idx_ct_account_id (account_id),

  CONSTRAINT fk_ct_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: TRANSACOES
-- ============================================

CREATE TABLE IF NOT EXISTS transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  ct_id INT NULL,
  tipo ENUM('receita','despesa') NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_transacoes_account_tipo_descricao (account_id, tipo, descricao),
  INDEX idx_transacoes_account_id (account_id),
  INDEX idx_transacoes_ct_id (ct_id),
  INDEX idx_transacoes_data (criado_em),

  CONSTRAINT fk_transacoes_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_transacoes_ct
    FOREIGN KEY (ct_id) REFERENCES cts(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: ALUNOS
-- ============================================

CREATE TABLE IF NOT EXISTS alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  ct_id INT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) NULL,
  data_nascimento DATE NULL,
  sexo VARCHAR(20) NULL,
  telefone VARCHAR(20) NULL,
  email VARCHAR(150) NULL,
  nome_responsavel VARCHAR(150) NULL,
  telefone_responsavel VARCHAR(20) NULL,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_alunos_account_cpf (account_id, cpf),
  UNIQUE KEY uq_alunos_nome_data (account_id, nome, data_nascimento),
  UNIQUE KEY uq_alunos_nome_telefone (account_id, nome, telefone),
  INDEX idx_alunos_account_id (account_id),
  INDEX idx_alunos_ct_id (ct_id),
  INDEX idx_alunos_nome (nome),

  CONSTRAINT fk_alunos_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_alunos_ct
    FOREIGN KEY (ct_id) REFERENCES cts(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: PROFISSIONAIS
-- ============================================

CREATE TABLE IF NOT EXISTS profissionais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NULL,
  telefone VARCHAR(20) NULL,
  especialidade VARCHAR(100) NULL,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_profissionais_nome_telefone (account_id, nome, telefone),
  INDEX idx_profissionais_account_id (account_id),
  INDEX idx_profissionais_nome (nome),

  CONSTRAINT fk_profissionais_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: MODALIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS modalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  descricao VARCHAR(255) NULL,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_modalidades_account_nome (account_id, nome),
  INDEX idx_modalidades_account_id (account_id),
  INDEX idx_modalidades_nome (nome),

  CONSTRAINT fk_modalidades_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: HORARIOS_AULA
-- ============================================

CREATE TABLE IF NOT EXISTS horarios_aula (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  ct_id INT NOT NULL,
  profissional_id INT NOT NULL,
  modalidade_id INT NOT NULL,
  dia_semana TINYINT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  limite_vagas INT NULL,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_horarios_account_id (account_id),
  INDEX idx_horarios_ct_id (ct_id),
  INDEX idx_horarios_profissional_id (profissional_id),
  INDEX idx_horarios_modalidade_id (modalidade_id),

  CONSTRAINT fk_horarios_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_horarios_ct
    FOREIGN KEY (ct_id) REFERENCES cts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_horarios_profissional
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_horarios_modalidade
    FOREIGN KEY (modalidade_id) REFERENCES modalidades(id)
    ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Conta principal
INSERT INTO accounts (nome, tipo, plano, status)
VALUES ('Conta Principal', 'ct_owner', 'basic', 'ativo');

-- Usuário admin
-- senha ilustrativa com hash bcrypt de exemplo
INSERT INTO users (nome, email, senha_hash, ativo)
VALUES (
  'Admin',
  'admin@admin.com',
  '$2b$10$7aX8mQ0w7J5Y9zR9Vx1k2e6mN4pQf2W8sL0gB3nD1cH5uT7rK9y1a',
  1
);

-- Vincular usuário à conta
INSERT INTO account_users (account_id, user_id, role, ativo)
VALUES (1, 1, 'owner', 1);

-- CTs de exemplo
INSERT INTO cts (account_id, nome, ativo) VALUES
(1, 'CT Centro', 1),
(1, 'CT Zona Sul', 1);

-- Transações de exemplo
INSERT INTO transacoes (account_id, ct_id, tipo, descricao, valor) VALUES
(1, 1, 'receita', 'Mensalidade aluno', 150.00),;
ALTER TABLE profissionais
  ADD UNIQUE KEY uq_profissionais_nome_telefone (account_id, nome, telefone);