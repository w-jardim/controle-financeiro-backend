-- Configurar charset UTF-8 para session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Criar tabela de transações com suporte completo a UTF-8
CREATE TABLE IF NOT EXISTS transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('receita', 'despesa') NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados de exemplo
INSERT INTO transacoes (tipo, descricao, valor) VALUES
('receita', 'Salário mensal', 3500.00),
('receita', 'Freelance - Projeto X', 1200.50),
('despesa', 'Aluguel', 1500.00),
('despesa', 'Alimentação', 450.75),
('despesa', 'Transporte', 200.00),
('receita', 'Bônus', 800.00),
('despesa', 'Energia elétrica', 180.50),
('despesa', 'Internet', 89.90),
('receita', 'Venda de item', 350.00),
('despesa', 'Medicamentos', 120.00);
