# AUDITORIA TÉCNICA - ISOLAMENTO MULTI-TENANT E DUPLICIDADE

**Data**: 25 de março de 2026  
**Sistema**: API de Gestão de CT de Artes Marciais  
**Severidade**: 🔴 CRÍTICA  

---

## 🎯 OBJETIVO

Identificar e corrigir todas as falhas de isolamento multi-tenant e validação de duplicidade nos módulos CTs, Alunos e Transações.

---

## 🚨 PROBLEMA REPORTADO

**Vulnerabilidade identificada:**
> Foi possível cadastrar um aluno usando um `ct_id` que não pertence ao `account_id` do usuário logado.

**Impacto:**
- Vazamento de dados entre contas (violação LGPD/GDPR)
- Possibilidade de associar alunos de uma conta a CTs de outra conta
- Integridade referencial comprometida
- Violação do princípio de isolamento multi-tenant

---

## 📊 RESUMO EXECUTIVO

### Status por Módulo

| Módulo | Isolamento Multi-Tenant | Duplicidade | Status Geral |
|--------|------------------------|-------------|--------------|
| **CTs** | ✅ SEGURO | ✅ SEGURO | ✅ APROVADO |
| **Alunos** | 🔴 CRÍTICO | ⚠️ INCOMPLETO | 🔴 REPROVADO |
| **Transações** | 🔴 CRÍTICO | ⚠️ INCOMPLETO | 🔴 REPROVADO |

### Falhas Críticas Encontradas

1. ✅ **CTs**: 0 falhas
2. 🔴 **Alunos**: 3 falhas críticas
3. 🔴 **Transações**: 3 falhas críticas

**TOTAL: 6 VULNERABILIDADES CRÍTICAS**

---

## 📋 ANÁLISE DETALHADA POR MÓDULO

---

### 1️⃣ MÓDULO: CTS

#### ✅ DIAGNÓSTICO: APROVADO

**Camada Controller** (`ctController.js`):
- ✅ Todos os métodos passam `req.user.accountId` do JWT
- ✅ Sem acesso direto ao repository

**Camada Service** (`ctService.js`):
- ✅ Validação de `accountId` em todos os métodos
- ✅ Validação de duplicidade por nome com `existePorNome(nome, accountId)`
- ✅ Validação na atualização com `existePorNomeIgnorandoId(nome, id, accountId)`
- ✅ Todas as operações verificam existência antes de atualizar/desativar/ativar

**Camada Repository** (`ctRepository.js`):
- ✅ Todas as queries incluem `WHERE account_id = ?`
- ✅ Métodos `listar`, `buscarPorId`, `criar`, `atualizar`, `desativar`, `ativar` protegidos
- ✅ Métodos de duplicidade consideram `account_id`

**Camada SQL** (`01-init.sql`):
- ✅ `UNIQUE KEY uq_ct_nome_por_account (account_id, nome)` — previne duplicação
- ✅ `INDEX idx_ct_account_id (account_id)` — otimiza queries multi-tenant
- ✅ `CONSTRAINT fk_ct_account CASCADE` — delete em cascata correto

#### ✅ CONCLUSÃO: MÓDULO 100% SEGURO

**Nenhuma ação necessária.**

---

### 2️⃣ MÓDULO: ALUNOS

#### 🔴 DIAGNÓSTICO: FALHAS CRÍTICAS DETECTADAS

**Camada Controller** (`alunoController.js`):
- ✅ Todos os métodos passam `req.user.accountId` do JWT
- ✅ Sem acesso direto ao repository

**Camada Service** (`alunoService.js`):

##### 🔴 FALHA CRÍTICA #1: Validação de CT Ownership Ausente

**Arquivo**: `backend/src/modules/alunos/services/alunoService.js`  
**Método**: `criar(dados, accountId)`  
**Linha**: ~54  

**Problema:**
```javascript
async criar(dados, accountId) {
  const accountIdValidado = this.validarAccountId(accountId);

  if (!dados.nome || !String(dados.nome).trim()) {
    throw this.criarErro('O campo nome é obrigatório', 400);
  }

  if (!dados.ct_id) {
    throw this.criarErro('O campo ct_id é obrigatório', 400);
  }

  // ❌ FALHA: Não valida se ct_id pertence ao accountId!
  // ❌ Aceita qualquer ct_id de qualquer conta

  try {
    return await alunoRepository.criar({
      ...dados,
      accountId: accountIdValidado
    });
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      throw this.criarErro('CPF já cadastrado', 409);
    }
    throw error;
  }
}
```

**Impacto:**
- Usuário de account_id=1 pode criar aluno com ct_id=99 de account_id=2
- Violação total do isolamento multi-tenant
- Dados cruzados entre contas

**Regra Faltante:**
```javascript
// Deve validar:
const ctExiste = await ctRepository.buscarPorId(dados.ct_id, accountIdValidado);
if (!ctExiste) {
  throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
}
```

---

##### 🔴 FALHA CRÍTICA #2: Validação de CT Ownership na Atualização Ausente

**Arquivo**: `backend/src/modules/alunos/services/alunoService.js`  
**Método**: `atualizar(id, dados, accountId)`  
**Linha**: ~76  

**Problema:**
```javascript
async atualizar(id, dados, accountId) {
  const numeroId = this.validarId(id);
  const accountIdValidado = this.validarAccountId(accountId);

  const alunoExistente = await alunoRepository.buscarPorId(
    numeroId,
    accountIdValidado
  );

  if (!alunoExistente) {
    throw this.criarErro('Aluno não encontrado', 404);
  }

  // ❌ FALHA: Se dados.ct_id for fornecido, não valida ownership!
  // ❌ Permite trocar aluno de um CT próprio para CT de outra conta

  try {
    return await alunoRepository.atualizar(numeroId, accountIdValidado, dados);
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      throw this.criarErro('CPF já cadastrado', 409);
    }
    throw error;
  }
}
```

**Impacto:**
- Usuário pode mover aluno próprio para CT de outra conta
- Vazamento de dados entre accounts

**Regra Faltante:**
```javascript
if (dados.ct_id && dados.ct_id !== alunoExistente.ct_id) {
  const ctExiste = await ctRepository.buscarPorId(dados.ct_id, accountIdValidado);
  if (!ctExiste) {
    throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
  }
}
```

---

##### ⚠️ FALHA #3: Validação de Duplicidade CPF Reativa

**Arquivo**: `backend/src/modules/alunos/services/alunoService.js`  
**Métodos**: `criar()`, `atualizar()`  

**Problema:**
```javascript
try {
  return await alunoRepository.criar({...});
} catch (error) {
  // ❌ MÁ PRÁTICA: Só detecta duplicidade APÓS tentar inserir
  if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
    throw this.criarErro('CPF já cadastrado', 409);
  }
  throw error;
}
```

**Problema:**
- Validação reativa (depende de erro do banco)
- Não é proativa como no módulo CTs
- Mensagem genérica (pode ser CPF ou outro campo único)
- Dificulta debugging

**Regra Faltante:**
```javascript
// ANTES do try/catch:
if (dados.cpf) {
  const cpfJaExiste = await alunoRepository.existePorCpf(dados.cpf, accountIdValidado, id);
  if (cpfJaExiste) {
    throw this.criarErro('CPF já cadastrado nesta conta', 409);
  }
}
```

---

**Camada Repository** (`alunoRepository.js`):
- ✅ Todas as queries incluem `WHERE account_id = ?`
- ✅ Métodos `listar`, `buscarPorId`, `criar`, `atualizar`, `desativar`, `ativar` protegidos
- ❌ **AUSENTE**: Método `existePorCpf(cpf, accountId, idIgnorar)` para validação proativa

**Camada SQL** (`01-init.sql`):
- ✅ `UNIQUE KEY uq_alunos_account_cpf (account_id, cpf)` — previne duplicação
- ✅ `INDEX idx_alunos_account_id`, `idx_alunos_ct_id`, `idx_alunos_nome`
- ❌ **PROBLEMA**: FK `fk_alunos_ct` não valida mesma conta
  - Permite aluno de account_id=1 referenciar CT de account_id=2
  - FK apenas valida existência do CT, não o ownership

#### 🔴 CONCLUSÃO: MÓDULO REPROVADO

**3 vulnerabilidades críticas + 1 ausência de constraint SQL**

---

### 3️⃣ MÓDULO: TRANSAÇÕES

#### 🔴 DIAGNÓSTICO: FALHAS CRÍTICAS DETECTADAS

**Camada Controller** (`transacaoController.js`):
- ✅ Todos os métodos passam `req.user.accountId` do JWT
- ✅ Sem acesso direto ao repository

**Camada Service** (`transacaoService.js`):

##### 🔴 FALHA CRÍTICA #4: Validação de CT Ownership Ausente na Criação

**Arquivo**: `backend/src/modules/transacoes/services/transacaoService.js`  
**Método**: `criar(dados, accountId)`  
**Linha**: ~220  

**Problema:**
```javascript
async criar(dados, accountId) {
  const accountIdValidado = this.validarAccountId(accountId);

  const tipo = this.validarTipo(dados.tipo);
  const descricao = this.validarDescricao(dados.descricao);
  const valor = this.validarValor(dados.valor);
  const ctIdValidado = this.validarCtId(dados.ct_id); // ❌ Só valida formato!

  // ❌ FALHA: Não valida se ct_id pertence ao accountId!
  // validarCtId() apenas verifica se é número válido ou null

  const jaExiste = await repository.existePorTipoEDescricao(
    tipo,
    descricao,
    accountIdValidado
  );

  if (jaExiste) {
    throw this.criarErro(
      'Já existe uma transação com esse tipo e descrição',
      409
    );
  }

  const resultado = await repository.criar({
    accountId: accountIdValidado,
    ct_id: ctIdValidado, // ❌ Aceita ct_id de qualquer conta!
    tipo,
    descricao,
    valor
  });

  return {
    mensagem: 'Transação criada com sucesso',
    id: resultado.id
  };
}
```

**Método `validarCtId()`**:
```javascript
validarCtId(ctId) {
  if (ctId === undefined || ctId === null || ctId === '') {
    return null;
  }

  const numeroCtId = Number(ctId);

  if (!Number.isInteger(numeroCtId) || numeroCtId <= 0) {
    throw this.criarErro('ct_id deve ser um número válido', 400);
  }

  return numeroCtId; // ❌ Só valida tipo, não ownership!
}
```

**Impacto:**
- Usuário de account_id=1 pode criar transação com ct_id=99 de account_id=2
- Violação do isolamento multi-tenant
- Dados financeiros podem ser associados a CTs de outras contas

**Regra Faltante:**
```javascript
if (ctIdValidado !== null) {
  const ctExiste = await ctRepository.buscarPorId(ctIdValidado, accountIdValidado);
  if (!ctExiste) {
    throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
  }
}
```

---

##### 🔴 FALHA CRÍTICA #5: Validação de CT Ownership Ausente na Atualização

**Arquivo**: `backend/src/modules/transacoes/services/transacaoService.js`  
**Método**: `atualizar(id, dados, accountId)`  
**Linha**: ~250  

**Problema:**
```javascript
async atualizar(id, dados, accountId) {
  const numeroId = this.validarId(id);
  const accountIdValidado = this.validarAccountId(accountId);

  const tipo = this.validarTipo(dados.tipo);
  const descricao = this.validarDescricao(dados.descricao);
  const valor = this.validarValor(dados.valor);
  const ctIdValidado = this.validarCtId(dados.ct_id); // ❌ Só valida formato!

  // ❌ FALHA: Se ct_id for fornecido, não valida ownership!
  // ❌ Permite trocar transação de CT próprio para CT de outra conta

  const jaExiste = await repository.existePorTipoEDescricaoIgnorandoId(
    tipo,
    descricao,
    numeroId,
    accountIdValidado
  );

  if (jaExiste) {
    throw this.criarErro(
      'Já existe uma transação com esse tipo e descrição',
      409
    );
  }

  const resultado = await repository.atualizar(
    numeroId,
    accountIdValidado,
    {
      tipo,
      descricao,
      valor,
      ct_id: ctIdValidado // ❌ Aceita ct_id de qualquer conta!
    }
  );

  if (resultado.afetadas === 0) {
    throw this.criarErro('Transação não encontrada', 404);
  }

  return {
    mensagem: 'Transação atualizada com sucesso'
  };
}
```

**Impacto:**
- Usuário pode mover transação própria para CT de outra conta
- Vazamento de dados financeiros entre accounts

**Regra Faltante:**
```javascript
if (ctIdValidado !== null) {
  const ctExiste = await ctRepository.buscarPorId(ctIdValidado, accountIdValidado);
  if (!ctExiste) {
    throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
  }
}
```

---

##### ⚠️ FALHA #6: Constraint UNIQUE Ausente no SQL

**Arquivo**: `mysql-init/01-init.sql`  
**Tabela**: `transacoes`  

**Problema:**
```sql
CREATE TABLE IF NOT EXISTS transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  ct_id INT NULL,
  tipo ENUM('receita','despesa') NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_transacoes_account_id (account_id),
  INDEX idx_transacoes_ct_id (ct_id),
  INDEX idx_transacoes_data (criado_em),
  -- ❌ AUSENTE: UNIQUE KEY para tipo+descricao por account_id
  
  CONSTRAINT fk_transacoes_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_transacoes_ct
    FOREIGN KEY (ct_id) REFERENCES cts(id)
    ON DELETE SET NULL
    -- ❌ PROBLEMA: Não valida mesma conta
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Impacto:**
- Service valida duplicidade, mas SQL não garante
- Race conditions podem inserir duplicatas
- Inconsistência entre validação lógica e estrutural

**Constraint Faltante:**
```sql
UNIQUE KEY uq_transacoes_tipo_descricao_account (account_id, tipo, descricao)
```

---

**Camada Repository** (`transacaoRepository.js`):
- ✅ Todas as queries incluem `WHERE account_id = ?`
- ✅ Métodos `listar`, `buscarPorId`, `criar`, `atualizar`, `deletar` protegidos
- ✅ Métodos `existePorTipoEDescricao` e `existePorTipoEDescricaoIgnorandoId` consideram `account_id`
- ✅ Métodos de resumo filtram por `account_id`

**Camada SQL** (`01-init.sql`):
- ❌ **AUSENTE**: `UNIQUE KEY uq_transacoes_tipo_descricao_account (account_id, tipo, descricao)`
- ✅ `INDEX idx_transacoes_account_id`, `idx_transacoes_ct_id`, `idx_transacoes_data`
- ❌ **PROBLEMA**: FK `fk_transacoes_ct` não valida mesma conta
  - Permite transação de account_id=1 referenciar CT de account_id=2
  - FK apenas valida existência do CT, não o ownership

#### 🔴 CONCLUSÃO: MÓDULO REPROVADO

**3 vulnerabilidades críticas + 1 constraint SQL ausente**

---

## 📝 RESUMO DE FALHAS ENCONTRADAS

### 🔴 FALHAS CRÍTICAS DE ISOLAMENTO MULTI-TENANT

| # | Módulo | Arquivo | Método | Descrição |
|---|--------|---------|--------|-----------|
| 1 | Alunos | `alunoService.js` | `criar()` | Não valida se `ct_id` pertence ao `accountId` |
| 2 | Alunos | `alunoService.js` | `atualizar()` | Permite trocar `ct_id` sem validar ownership |
| 3 | Alunos | `01-init.sql` | FK `fk_alunos_ct` | FK não valida mesma conta |
| 4 | Transações | `transacaoService.js` | `criar()` | Não valida se `ct_id` pertence ao `accountId` |
| 5 | Transações | `transacaoService.js` | `atualizar()` | Permite trocar `ct_id` sem validar ownership |
| 6 | Transações | `01-init.sql` | FK `fk_transacoes_ct` | FK não valida mesma conta |

### ⚠️ FALHAS DE DUPLICIDADE E BOAS PRÁTICAS

| # | Módulo | Arquivo | Descrição |
|---|--------|---------|-----------|
| 7 | Alunos | `alunoService.js` | Validação reativa de CPF (via catch ER_DUP_ENTRY) |
| 8 | Alunos | `alunoRepository.js` | Ausência de método `existePorCpf()` |
| 9 | Transações | `01-init.sql` | Constraint UNIQUE ausente para `tipo+descricao+account` |

---

## ✅ REGRAS QUE DEVEM EXISTIR

### Regra 1: Isolamento Total de Dados
**Princípio:** Um usuário só pode acessar dados da própria conta.  
**Implementação:** Todas as queries incluem `WHERE account_id = ?`  
**Status:** ✅ Implementado em todos os módulos

### Regra 2: Validação de Foreign Keys Multi-Tenant
**Princípio:** Ao referenciar CT via `ct_id`, validar que pertence ao mesmo `account_id`.  
**Implementação:** Service deve validar ownership antes de criar/atualizar.  
**Status:** 🔴 AUSENTE em Alunos e Transações

### Regra 3: Validação Proativa de Duplicidade
**Princípio:** Validar duplicidade antes de tentar inserir/atualizar.  
**Implementação:** Service chama `existe*()` antes de `criar()`/`atualizar()`.  
**Status:** ✅ CTs / ✅ Transações / 🔴 Alunos (validação reativa)

### Regra 4: Constraints SQL de Duplicidade
**Princípio:** SQL deve garantir unicidade mesmo em race conditions.  
**Implementação:** `UNIQUE KEY` para combinação de campos + `account_id`.  
**Status:** ✅ CTs / ✅ Alunos / 🔴 Transações (constraint ausente)

### Regra 5: Não Confiar em Foreign Keys para Multi-Tenant
**Princípio:** FKs garantem integridade referencial, não isolamento multi-tenant.  
**Implementação:** Service deve validar explicitamente ownership.  
**Status:** 🔴 VIOLADO em Alunos e Transações

---

## 🛠️ CORREÇÕES POR ARQUIVO

### 📂 `backend/src/modules/cts/repositories/ctRepository.js`

**Ação:** ✅ NENHUMA (módulo já seguro)

**Adicionar método auxiliar** (para ser usado por outros módulos):

```javascript
/**
 * Verifica se um CT existe e pertence ao account_id informado
 * @param {number} ctId - ID do CT
 * @param {number} accountId - ID da conta
 * @returns {Promise<boolean>} - true se existe e pertence, false caso contrário
 */
async existeEPertenceAoConta(ctId, accountId) {
  if (!accountId) throw new AppError('accountId é obrigatório', 400);
  if (!ctId) return false;

  const ct = await this.buscarPorId(ctId, accountId);
  return Boolean(ct);
}
```

**Justificativa:** Método reutilizável para validação em outros módulos.

---

### 📂 `backend/src/modules/alunos/repositories/alunoRepository.js`

**Ação 1:** Adicionar método `existePorCpf()`

**Localização:** Após método `buscarPorId()`

```javascript
/**
 * Verifica se já existe um aluno com o CPF informado na conta
 * @param {string} cpf - CPF a verificar
 * @param {number} accountId - ID da conta
 * @param {number|null} idIgnorar - ID do aluno a ignorar (para atualização)
 * @returns {Promise<boolean>}
 */
async existePorCpf(cpf, accountId, idIgnorar = null) {
  if (!accountId) throw new AppError('accountId é obrigatório', 400);
  if (!cpf) return false;

  let consulta = 'SELECT id FROM alunos WHERE account_id = ? AND cpf = ?';
  const params = [accountId, cpf];

  if (idIgnorar) {
    consulta += ' AND id <> ?';
    params.push(idIgnorar);
  }

  consulta += ' LIMIT 1';

  const [rows] = await conexao.execute(consulta, params);
  return rows.length > 0;
}
```

---

### 📂 `backend/src/modules/alunos/services/alunoService.js`

**Ação 1:** Importar ctRepository no topo do arquivo

```javascript
const alunoRepository = require('../repositories/alunoRepository');
const ctRepository = require('../../cts/repositories/ctRepository'); // ← ADICIONAR
const AppError = require('../../../shared/errors/AppError');
```

**Ação 2:** Corrigir método `criar()`

**Substituir:**
```javascript
async criar(dados, accountId) {
  const accountIdValidado = this.validarAccountId(accountId);

  if (!dados.nome || !String(dados.nome).trim()) {
    throw this.criarErro('O campo nome é obrigatório', 400);
  }

  if (!dados.ct_id) {
    throw this.criarErro('O campo ct_id é obrigatório', 400);
  }

  try {
    return await alunoRepository.criar({
      ...dados,
      accountId: accountIdValidado
    });
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      throw this.criarErro('CPF já cadastrado', 409);
    }
    throw error;
  }
}
```

**Por:**
```javascript
async criar(dados, accountId) {
  const accountIdValidado = this.validarAccountId(accountId);

  // Validação de campos obrigatórios
  if (!dados.nome || !String(dados.nome).trim()) {
    throw this.criarErro('O campo nome é obrigatório', 400);
  }

  if (!dados.ct_id) {
    throw this.criarErro('O campo ct_id é obrigatório', 400);
  }

  // ✅ CORREÇÃO #1: Validar que CT pertence à conta do usuário
  const ctExiste = await ctRepository.buscarPorId(dados.ct_id, accountIdValidado);
  if (!ctExiste) {
    throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
  }

  // ✅ CORREÇÃO #2: Validação proativa de CPF duplicado
  if (dados.cpf) {
    const cpfJaExiste = await alunoRepository.existePorCpf(
      dados.cpf,
      accountIdValidado
    );
    if (cpfJaExiste) {
      throw this.criarErro('CPF já cadastrado nesta conta', 409);
    }
  }

  // Criar aluno (agora sem try/catch de ER_DUP_ENTRY, pois validamos antes)
  return await alunoRepository.criar({
    ...dados,
    accountId: accountIdValidado
  });
}
```

**Ação 3:** Corrigir método `atualizar()`

**Substituir:**
```javascript
async atualizar(id, dados, accountId) {
  const numeroId = this.validarId(id);
  const accountIdValidado = this.validarAccountId(accountId);

  const alunoExistente = await alunoRepository.buscarPorId(
    numeroId,
    accountIdValidado
  );

  if (!alunoExistente) {
    throw this.criarErro('Aluno não encontrado', 404);
  }

  try {
    return await alunoRepository.atualizar(numeroId, accountIdValidado, dados);
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      throw this.criarErro('CPF já cadastrado', 409);
    }
    throw error;
  }
}
```

**Por:**
```javascript
async atualizar(id, dados, accountId) {
  const numeroId = this.validarId(id);
  const accountIdValidado = this.validarAccountId(accountId);

  const alunoExistente = await alunoRepository.buscarPorId(
    numeroId,
    accountIdValidado
  );

  if (!alunoExistente) {
    throw this.criarErro('Aluno não encontrado', 404);
  }

  // ✅ CORREÇÃO #1: Validar que novo CT pertence à conta (se fornecido e diferente)
  if (dados.ct_id && dados.ct_id !== alunoExistente.ct_id) {
    const ctExiste = await ctRepository.buscarPorId(dados.ct_id, accountIdValidado);
    if (!ctExiste) {
      throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
    }
  }

  // ✅ CORREÇÃO #2: Validação proativa de CPF duplicado (se fornecido e diferente)
  if (dados.cpf && dados.cpf !== alunoExistente.cpf) {
    const cpfJaExiste = await alunoRepository.existePorCpf(
      dados.cpf,
      accountIdValidado,
      numeroId // Ignora o próprio aluno
    );
    if (cpfJaExiste) {
      throw this.criarErro('CPF já cadastrado nesta conta', 409);
    }
  }

  // Atualizar aluno (agora sem try/catch de ER_DUP_ENTRY)
  return await alunoRepository.atualizar(numeroId, accountIdValidado, dados);
}
```

---

### 📂 `backend/src/modules/transacoes/services/transacaoService.js`

**Ação 1:** Importar ctRepository no topo do arquivo

```javascript
const repository = require('../repositories/transacaoRepository');
const ctRepository = require('../../cts/repositories/ctRepository'); // ← ADICIONAR
const AppError = require('../../../shared/errors/AppError');
```

**Ação 2:** Corrigir método `criar()`

**Localização:** Após validações existentes, antes de `existePorTipoEDescricao`

**Adicionar:**
```javascript
async criar(dados, accountId) {
  const accountIdValidado = this.validarAccountId(accountId);

  const tipo = this.validarTipo(dados.tipo);
  const descricao = this.validarDescricao(dados.descricao);
  const valor = this.validarValor(dados.valor);
  const ctIdValidado = this.validarCtId(dados.ct_id);

  // ✅ CORREÇÃO: Validar que CT pertence à conta (se fornecido)
  if (ctIdValidado !== null) {
    const ctExiste = await ctRepository.buscarPorId(ctIdValidado, accountIdValidado);
    if (!ctExiste) {
      throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
    }
  }

  const jaExiste = await repository.existePorTipoEDescricao(
    tipo,
    descricao,
    accountIdValidado
  );

  if (jaExiste) {
    throw this.criarErro(
      'Já existe uma transação com esse tipo e descrição',
      409
    );
  }

  const resultado = await repository.criar({
    accountId: accountIdValidado,
    ct_id: ctIdValidado,
    tipo,
    descricao,
    valor
  });

  return {
    mensagem: 'Transação criada com sucesso',
    id: resultado.id
  };
}
```

**Ação 3:** Corrigir método `atualizar()`

**Substituir:**
```javascript
async atualizar(id, dados, accountId) {
  const numeroId = this.validarId(id);
  const accountIdValidado = this.validarAccountId(accountId);

  const tipo = this.validarTipo(dados.tipo);
  const descricao = this.validarDescricao(dados.descricao);
  const valor = this.validarValor(dados.valor);
  const ctIdValidado = this.validarCtId(dados.ct_id);

  const jaExiste = await repository.existePorTipoEDescricaoIgnorandoId(
    tipo,
    descricao,
    numeroId,
    accountIdValidado
  );

  if (jaExiste) {
    throw this.criarErro(
      'Já existe uma transação com esse tipo e descrição',
      409
    );
  }

  const resultado = await repository.atualizar(
    numeroId,
    accountIdValidado,
    {
      tipo,
      descricao,
      valor,
      ct_id: ctIdValidado
    }
  );

  if (resultado.afetadas === 0) {
    throw this.criarErro('Transação não encontrada', 404);
  }

  return {
    mensagem: 'Transação atualizada com sucesso'
  };
}
```

**Por:**
```javascript
async atualizar(id, dados, accountId) {
  const numeroId = this.validarId(id);
  const accountIdValidado = this.validarAccountId(accountId);

  const tipo = this.validarTipo(dados.tipo);
  const descricao = this.validarDescricao(dados.descricao);
  const valor = this.validarValor(dados.valor);
  const ctIdValidado = this.validarCtId(dados.ct_id);

  // ✅ CORREÇÃO: Validar que CT pertence à conta (se fornecido)
  if (ctIdValidado !== null) {
    const ctExiste = await ctRepository.buscarPorId(ctIdValidado, accountIdValidado);
    if (!ctExiste) {
      throw this.criarErro('CT não encontrado ou não pertence à sua conta', 404);
    }
  }

  const jaExiste = await repository.existePorTipoEDescricaoIgnorandoId(
    tipo,
    descricao,
    numeroId,
    accountIdValidado
  );

  if (jaExiste) {
    throw this.criarErro(
      'Já existe uma transação com esse tipo e descrição',
      409
    );
  }

  const resultado = await repository.atualizar(
    numeroId,
    accountIdValidado,
    {
      tipo,
      descricao,
      valor,
      ct_id: ctIdValidado
    }
  );

  if (resultado.afetadas === 0) {
    throw this.criarErro('Transação não encontrada', 404);
  }

  return {
    mensagem: 'Transação atualizada com sucesso'
  };
}
```

---

### 📂 `mysql-init/01-init.sql`

**Ação 1:** Adicionar constraint UNIQUE em transações

**Localização:** Após linha `INDEX idx_transacoes_data (criado_em),`

**Adicionar:**
```sql
  INDEX idx_transacoes_data (criado_em),
  UNIQUE KEY uq_transacoes_tipo_descricao_account (account_id, tipo, descricao), -- ← ADICIONAR

  CONSTRAINT fk_transacoes_account
```

**Justificativa:**
- Garante unicidade de tipo+descricao por conta no nível do banco
- Previne race conditions
- Alinha SQL com validação do service

---

**OBSERVAÇÃO SOBRE FOREIGN KEYS:**

As FKs `fk_alunos_ct` e `fk_transacoes_ct` **NÃO PODEM** ser alteradas para validar mesmo `account_id` nativamente no MySQL (não há suporte para multi-column FK check condicional).

**Solução adotada:**
- Validação de ownership na camada Service (conforme correções acima)
- FKs mantêm apenas integridade referencial (existência do CT)
- Service garante isolamento multi-tenant

**Nota:** Algumas engines SQL enterprise (Oracle, PostgreSQL com extensões) permitem triggers ou check constraints complexos, mas MySQL/InnoDB não suporta nativamente.

---

## 📊 AJUSTES DE BANCO RECOMENDADOS

### ✅ Obrigatórios (Segurança)

| Tabela | Ação | SQL | Prioridade |
|--------|------|-----|------------|
| `transacoes` | Adicionar constraint UNIQUE | `UNIQUE KEY uq_transacoes_tipo_descricao_account (account_id, tipo, descricao)` | 🔴 CRÍTICA |

### ⚠️ Recomendados (Performance)

| Tabela | Ação | SQL | Prioridade |
|--------|------|-----|------------|
| `alunos` | Índice composto | `INDEX idx_alunos_account_ct (account_id, ct_id)` | 🟡 MÉDIA |
| `transacoes` | Índice composto | `INDEX idx_transacoes_account_ct (account_id, ct_id)` | 🟡 MÉDIA |

**Justificativa:** Queries comuns filtram por `account_id` + `ct_id` simultaneamente.

---

## 🎯 PLANO DE CORREÇÃO EM ETAPAS

### ETAPA 1: Preparação do Repository (Fundação)
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 10 minutos  
**Risco:** BAIXO

**Ações:**
1. ✅ Adicionar método `existeEPertenceAoConta()` em `ctRepository.js`
2. ✅ Adicionar método `existePorCpf()` em `alunoRepository.js`

**Validação:**
- Métodos retornam boolean correto
- Consideram `account_id` nas queries
- Tratam casos de `null`/`undefined`

---

### ETAPA 2: Correção do Módulo Alunos (Service)
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 15 minutos  
**Risco:** MÉDIO

**Pré-requisito:** Etapa 1 concluída

**Ações:**
1. ✅ Importar `ctRepository` em `alunoService.js`
2. ✅ Adicionar validação de CT ownership em `criar()`
3. ✅ Adicionar validação de CPF proativo em `criar()`
4. ✅ Adicionar validação de CT ownership em `atualizar()`
5. ✅ Adicionar validação de CPF proativo em `atualizar()`
6. ✅ Remover try/catch de `ER_DUP_ENTRY` (agora desnecessário)

**Validação:**
- Não é possível criar aluno com `ct_id` de outra conta (retorna 404)
- Não é possível atualizar aluno para `ct_id` de outra conta (retorna 404)
- CPF duplicado retorna 409 antes de tentar inserir
- Mensagens de erro claras

---

### ETAPA 3: Correção do Módulo Transações (Service)
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 15 minutos  
**Risco:** MÉDIO

**Pré-requisito:** Etapa 1 concluída

**Ações:**
1. ✅ Importar `ctRepository` em `transacaoService.js`
2. ✅ Adicionar validação de CT ownership em `criar()`
3. ✅ Adicionar validação de CT ownership em `atualizar()`

**Validação:**
- Não é possível criar transação com `ct_id` de outra conta (retorna 404)
- Não é possível atualizar transação para `ct_id` de outra conta (retorna 404)
- Transações com `ct_id=null` continuam funcionando
- Mensagens de erro claras

---

### ETAPA 4: Ajustes de Banco (SQL)
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 5 minutos  
**Risco:** MÉDIO (requer rebuild de containers)

**Pré-requisito:** Etapas 2 e 3 concluídas (para garantir que service já valida)

**Ações:**
1. ✅ Adicionar `UNIQUE KEY uq_transacoes_tipo_descricao_account` em `01-init.sql`
2. ✅ Rebuild dos containers Docker
3. ✅ Verificar que constraint foi criada

**Validação:**
```sql
SHOW CREATE TABLE transacoes;
-- Deve mostrar constraint uq_transacoes_tipo_descricao_account

-- Tentar inserir duplicata (deve falhar):
INSERT INTO transacoes (account_id, tipo, descricao, valor)
VALUES (1, 'receita', 'Mensalidade', 100.00);

INSERT INTO transacoes (account_id, tipo, descricao, valor)
VALUES (1, 'receita', 'Mensalidade', 150.00);
-- ER_DUP_ENTRY esperado
```

---

### ETAPA 5: Testes de Integração (Validação Final)
**Prioridade:** 🔴 CRÍTICA  
**Tempo estimado:** 30 minutos  
**Risco:** BAIXO

**Pré-requisito:** Etapas 1, 2, 3 e 4 concluídas

**Cenários de Teste:**

#### Teste 1: Isolamento Multi-Tenant em Alunos
```
1. Criar conta A com CT A1
2. Criar conta B com CT B1
3. Login como usuário A
4. Tentar criar aluno com ct_id = B1 (CT da conta B)
   ✅ Esperado: 404 "CT não encontrado ou não pertence à sua conta"
5. Criar aluno com ct_id = A1
   ✅ Esperado: 201 sucesso
6. Tentar atualizar aluno para ct_id = B1
   ✅ Esperado: 404 "CT não encontrado ou não pertence à sua conta"
```

#### Teste 2: Isolamento Multi-Tenant em Transações
```
1. Login como usuário A
2. Tentar criar transação com ct_id = B1 (CT da conta B)
   ✅ Esperado: 404 "CT não encontrado ou não pertence à sua conta"
3. Criar transação com ct_id = A1
   ✅ Esperado: 201 sucesso
4. Criar transação com ct_id = null (geral)
   ✅ Esperado: 201 sucesso
5. Tentar atualizar transação para ct_id = B1
   ✅ Esperado: 404 "CT não encontrado ou não pertence à sua conta"
```

#### Teste 3: Validação Proativa de CPF
```
1. Criar aluno com CPF 111.111.111-11
   ✅ Esperado: 201 sucesso
2. Criar outro aluno com mesmo CPF
   ✅ Esperado: 409 "CPF já cadastrado nesta conta"
3. Atualizar aluno diferente para CPF 111.111.111-11
   ✅ Esperado: 409 "CPF já cadastrado nesta conta"
```

#### Teste 4: Duplicidade de Transações
```
1. Criar transação tipo=receita, descricao="Mensalidade"
   ✅ Esperado: 201 sucesso
2. Criar transação tipo=receita, descricao="Mensalidade"
   ✅ Esperado: 409 "Já existe uma transação com esse tipo e descrição"
3. Criar transação tipo=despesa, descricao="Mensalidade"
   ✅ Esperado: 201 sucesso (tipo diferente)
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Etapa 1: Repositories
- [ ] Adicionar `existeEPertenceAoConta()` em `ctRepository.js`
- [ ] Adicionar `existePorCpf()` em `alunoRepository.js`
- [ ] Testar métodos isoladamente

### Etapa 2: Service Alunos
- [ ] Importar `ctRepository`
- [ ] Validar CT ownership em `criar()`
- [ ] Validar CPF proativo em `criar()`
- [ ] Validar CT ownership em `atualizar()`
- [ ] Validar CPF proativo em `atualizar()`
- [ ] Remover try/catch de `ER_DUP_ENTRY`
- [ ] Testar cenários de isolamento

### Etapa 3: Service Transações
- [ ] Importar `ctRepository`
- [ ] Validar CT ownership em `criar()`
- [ ] Validar CT ownership em `atualizar()`
- [ ] Testar cenários de isolamento

### Etapa 4: SQL
- [ ] Adicionar constraint UNIQUE em `01-init.sql`
- [ ] Rebuild containers Docker
- [ ] Verificar constraint criada

### Etapa 5: Testes
- [ ] Teste isolamento alunos
- [ ] Teste isolamento transações
- [ ] Teste duplicidade CPF
- [ ] Teste duplicidade transações
- [ ] Teste com Postman (collection completa)

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Breaking change em alunos existentes | BAIXA | ALTO | Validar dados existentes antes de deploy |
| Breaking change em transações existentes | BAIXA | ALTO | Validar dados existentes antes de deploy |
| Constraint SQL falhar se dados duplicados | MÉDIA | ALTO | Limpar duplicatas antes de adicionar constraint |
| Importação circular entre módulos | BAIXA | MÉDIO | ctRepository é folha (não importa outros) |

### Script de Validação Pré-Deploy

**Executar ANTES da Etapa 4:**

```sql
-- Verificar se existem alunos com ct_id de outra conta
SELECT a.id, a.account_id AS aluno_account, c.account_id AS ct_account, a.ct_id
FROM alunos a
INNER JOIN cts c ON a.ct_id = c.id
WHERE a.account_id <> c.account_id;
-- ⚠️ Se retornar linhas, DADOS CORROMPIDOS encontrados!

-- Verificar se existem transações com ct_id de outra conta
SELECT t.id, t.account_id AS transacao_account, c.account_id AS ct_account, t.ct_id
FROM transacoes t
INNER JOIN cts c ON t.ct_id = c.id
WHERE t.account_id <> c.account_id;
-- ⚠️ Se retornar linhas, DADOS CORROMPIDOS encontrados!

-- Verificar duplicatas de transações (antes de adicionar constraint)
SELECT account_id, tipo, descricao, COUNT(*) AS total
FROM transacoes
GROUP BY account_id, tipo, descricao
HAVING COUNT(*) > 1;
-- ⚠️ Se retornar linhas, duplicatas encontradas!
```

**Se dados corrompidos forem encontrados:**
1. ❌ **NÃO** prosseguir com deploy
2. Analisar origem dos dados inválidos
3. Decidir estratégia de limpeza/migração
4. Executar correção manual
5. Re-executar script de validação
6. Prosseguir com deploy apenas se 0 linhas retornadas

---

## 📈 CONCLUSÃO

### Severidade Geral: 🔴 CRÍTICA

**6 vulnerabilidades de isolamento multi-tenant** que permitem:
- Vazamento de dados entre contas
- Violação de LGPD/GDPR
- Associação indevida de recursos

### Tempo Total Estimado: ~75 minutos
- Etapa 1: 10 min
- Etapa 2: 15 min
- Etapa 3: 15 min
- Etapa 4: 5 min
- Etapa 5: 30 min

### Próximos Passos Imediatos

1. ✅ Aprovar este plano de auditoria
2. ⏭️ Executar script de validação pré-deploy
3. ⏭️ Implementar correções seguindo ordem das etapas
4. ⏭️ Validar cada etapa antes de prosseguir
5. ⏭️ Executar bateria de testes completa
6. ⏭️ Deploy em produção

---

**Documento gerado em:** 25/03/2026  
**Revisão:** v1.0  
**Autor:** GitHub Copilot  
**Status:** ⏳ AGUARDANDO APROVAÇÃO PARA IMPLEMENTAÇÃO
