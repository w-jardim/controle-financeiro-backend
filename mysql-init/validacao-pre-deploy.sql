-- ============================================
-- SCRIPT DE VALIDAÇÃO PRÉ-DEPLOY
-- AUDITORIA MULTI-TENANT
-- ============================================
-- Data: 25/03/2026
-- Objetivo: Verificar se dados existentes violam regras de isolamento
-- EXECUTAR ANTES de aplicar correções de código e constraints SQL
-- ============================================

-- ============================================
-- TESTE 1: Alunos com CT de outra conta
-- ============================================
SELECT 
  a.id AS aluno_id,
  a.nome AS aluno_nome,
  a.account_id AS aluno_account_id,
  c.id AS ct_id,
  c.nome AS ct_nome,
  c.account_id AS ct_account_id,
  '❌ ALUNO DE UMA CONTA VINCULADO A CT DE OUTRA CONTA' AS problema
FROM alunos a
INNER JOIN cts c ON a.ct_id = c.id
WHERE a.account_id <> c.account_id;

-- ⚠️ INTERPRETAÇÃO:
-- Se retornar 0 linhas: ✅ DADOS OK
-- Se retornar linhas: ❌ DADOS CORROMPIDOS - corrigir antes de deploy

-- ============================================
-- TESTE 2: Transações com CT de outra conta
-- ============================================
SELECT 
  t.id AS transacao_id,
  t.descricao,
  t.account_id AS transacao_account_id,
  c.id AS ct_id,
  c.nome AS ct_nome,
  c.account_id AS ct_account_id,
  '❌ TRANSAÇÃO DE UMA CONTA VINCULADA A CT DE OUTRA CONTA' AS problema
FROM transacoes t
INNER JOIN cts c ON t.ct_id = c.id
WHERE t.account_id <> c.account_id;

-- ⚠️ INTERPRETAÇÃO:
-- Se retornar 0 linhas: ✅ DADOS OK
-- Se retornar linhas: ❌ DADOS CORROMPIDOS - corrigir antes de deploy

-- ============================================
-- TESTE 3: Duplicatas de Transações (tipo + descricao por conta)
-- ============================================
SELECT 
  account_id,
  tipo,
  descricao,
  COUNT(*) AS total_duplicatas,
  GROUP_CONCAT(id ORDER BY id) AS ids_duplicados,
  '⚠️ DUPLICATAS ENCONTRADAS - constraint UNIQUE falhará' AS problema
FROM transacoes
GROUP BY account_id, tipo, descricao
HAVING COUNT(*) > 1;

-- ⚠️ INTERPRETAÇÃO:
-- Se retornar 0 linhas: ✅ DADOS OK - pode adicionar constraint UNIQUE
-- Se retornar linhas: ⚠️ DUPLICATAS - decidir estratégia:
--   Opção 1: Manter duplicatas antigas, adicionar constraint sem aplicar retroativo
--   Opção 2: Limpar duplicatas manualmente antes de adicionar constraint

-- ============================================
-- TESTE 4: CPFs duplicados na mesma conta
-- ============================================
SELECT 
  account_id,
  cpf,
  COUNT(*) AS total_duplicatas,
  GROUP_CONCAT(id ORDER BY id) AS ids_alunos,
  GROUP_CONCAT(nome ORDER BY id SEPARATOR ' | ') AS nomes,
  '⚠️ CPF DUPLICADO - constraint já existe mas dados podem estar corrompidos' AS problema
FROM alunos
WHERE cpf IS NOT NULL
GROUP BY account_id, cpf
HAVING COUNT(*) > 1;

-- ⚠️ INTERPRETAÇÃO:
-- Se retornar 0 linhas: ✅ DADOS OK
-- Se retornar linhas: ⚠️ DUPLICATAS - constraint uq_alunos_account_cpf deveria ter impedido
--   (pode indicar dados adicionados antes da constraint ou com constraint desabilitada)

-- ============================================
-- TESTE 5: Contar total de registros por módulo
-- ============================================
SELECT 
  'CTs' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(DISTINCT account_id) AS contas_distintas
FROM cts

UNION ALL

SELECT 
  'Alunos' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(DISTINCT account_id) AS contas_distintas
FROM alunos

UNION ALL

SELECT 
  'Transações' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(DISTINCT account_id) AS contas_distintas
FROM transacoes;

-- ⚠️ INTERPRETAÇÃO:
-- Mostra overview do sistema
-- Útil para entender impacto das correções

-- ============================================
-- TESTE 6: Verificar constraints existentes
-- ============================================
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('cts', 'alunos', 'transacoes')
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;

-- ⚠️ INTERPRETAÇÃO:
-- Verifica constraints já existentes
-- Deve mostrar:
--   cts: PRIMARY, FOREIGN KEY, UNIQUE (uq_ct_nome_por_account)
--   alunos: PRIMARY, FOREIGN KEY, UNIQUE (uq_alunos_account_cpf)
--   transacoes: PRIMARY, FOREIGN KEY
-- Após deploy, deve incluir:
--   transacoes: UNIQUE (uq_transacoes_tipo_descricao_account)

-- ============================================
-- TESTE 7: Alunos órfãos (ct_id inexistente)
-- ============================================
SELECT 
  a.id AS aluno_id,
  a.nome AS aluno_nome,
  a.ct_id AS ct_id_invalido,
  a.account_id,
  '❌ ALUNO REFERENCIA CT QUE NÃO EXISTE' AS problema
FROM alunos a
LEFT JOIN cts c ON a.ct_id = c.id
WHERE c.id IS NULL;

-- ⚠️ INTERPRETAÇÃO:
-- Se retornar 0 linhas: ✅ DADOS OK
-- Se retornar linhas: ❌ INTEGRIDADE VIOLADA - FK deveria ter impedido
--   (indica FK desabilitada ou dados corrompidos)

-- ============================================
-- TESTE 8: Transações órfãs (ct_id inexistente e não NULL)
-- ============================================
SELECT 
  t.id AS transacao_id,
  t.descricao,
  t.ct_id AS ct_id_invalido,
  t.account_id,
  '❌ TRANSAÇÃO REFERENCIA CT QUE NÃO EXISTE' AS problema
FROM transacoes t
LEFT JOIN cts c ON t.ct_id = c.id
WHERE t.ct_id IS NOT NULL
  AND c.id IS NULL;

-- ⚠️ INTERPRETAÇÃO:
-- Se retornar 0 linhas: ✅ DADOS OK
-- Se retornar linhas: ❌ INTEGRIDADE VIOLADA - FK deveria ter impedido

-- ============================================
-- RESUMO DE VALIDAÇÃO
-- ============================================
-- Execute todos os testes acima e documente resultados:
-- 
-- TESTE 1 (Alunos multi-tenant): [ ] OK / [ ] FALHOU (_____ linhas)
-- TESTE 2 (Transações multi-tenant): [ ] OK / [ ] FALHOU (_____ linhas)
-- TESTE 3 (Duplicatas transações): [ ] OK / [ ] FALHOU (_____ linhas)
-- TESTE 4 (CPFs duplicados): [ ] OK / [ ] FALHOU (_____ linhas)
-- TESTE 5 (Overview): _____ CTs, _____ Alunos, _____ Transações
-- TESTE 6 (Constraints): [ ] Todos presentes / [ ] Faltando _____
-- TESTE 7 (Alunos órfãos): [ ] OK / [ ] FALHOU (_____ linhas)
-- TESTE 8 (Transações órfãs): [ ] OK / [ ] FALHOU (_____ linhas)
--
-- ✅ APROVADO PARA DEPLOY: Todos os testes retornaram 0 linhas (exceto teste 5)
-- ❌ BLOQUEADO PARA DEPLOY: Um ou mais testes falharam - corrigir dados primeiro
-- ============================================
