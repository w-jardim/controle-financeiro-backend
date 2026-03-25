# RESUMO TÉCNICO DA API - CONTROLADOR FINANCEIRO

## 1. VISÃO GERAL DA API

- **Nome**: API de Gestão de CT de Artes Marciais
- **Versão**: 1.0.0
- **Base URL Local**: `http://localhost:3000` (ou porta configurada)
- **Tecnologia**: Express 5.1.0 + MySQL2
- **Autenticação**: JWT (Bearer Token)

**Módulos existentes**:
- Autenticação (`/auth`)
- CTs - Centros de Treinamento (`/cts`)
- Alunos (`/alunos`)
- Transações (`/transacoes`)
- Rotas de status (`/saude`, `/ping`, `/teste-banco`, `/`)

---

## 2. AUTENTICAÇÃO

### 2.1 Cadastro de Conta
- **Nome**: Cadastrar nova conta
- **Método**: `POST`
- **Path**: `/auth/cadastro`
- **Auth**: Não requer
- **Body**:
```json
{
  "nomeResponsavel": "string (obrigatório)",
  "email": "string (obrigatório)",
  "senha": "string (obrigatório, mínimo 6 caracteres)",
  "nomeAccount": "string (obrigatório)",
  "tipoAccount": "ct_owner | profissional_autonomo (obrigatório)",
  "nomeCtInicial": "string (opcional, usado se tipoAccount = ct_owner)"
}
```
- **Resposta Esperada** (201):
```json
{
  "mensagem": "Cadastro realizado com sucesso",
  "accountId": 1,
  "userId": 1,
  "ctId": 1
}
```
- **Observações**: 
  - Cria account, user e vincula com role 'owner'
  - Se tipoAccount for 'ct_owner' e nomeCtInicial existir, cria CT inicial
  - Transação no banco (commit/rollback automático)

### 2.2 Login
- **Nome**: Fazer login
- **Método**: `POST`
- **Path**: `/auth/login`
- **Auth**: Não requer
- **Body**:
```json
{
  "email": "string (obrigatório)",
  "senha": "string (obrigatório)"
}
```
- **Resposta Esperada** (200):
```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "jwt-token-string",
  "usuario": { ... },
  "account": { ... }
}
```
- **Observações**: 
  - Retorna token JWT para uso nas rotas protegidas
  - Token contém: { sub: userId, accountId, role }

---

## 3. CTS (CENTROS DE TREINAMENTO)

**Auth obrigatória**: SIM (Bearer Token)

### 3.1 Listar CTs
- **Nome**: Listar todos os CTs da conta
- **Método**: `GET`
- **Path**: `/cts`
- **Auth**: Bearer Token
- **Query Params**:
  - `page` ou `pagina` (opcional, padrão: 1)
  - `limit` ou `limite` (opcional, padrão: 10)
- **Body**: N/A
- **Resposta Esperada** (200):
```json
{
  "pagina": 1,
  "limite": 10,
  "total": 5,
  "totalPaginas": 1,
  "dados": [
    {
      "id": 1,
      "account_id": 1,
      "nome": "CT Centro",
      "ativo": 1,
      "criado_em": "...",
      "atualizado_em": "..."
    }
  ]
}
```

### 3.2 Buscar CT por ID
- **Nome**: Buscar CT específico
- **Método**: `GET`
- **Path**: `/cts/:id`
- **Auth**: Bearer Token
- **Params**: `id` (numérico, obrigatório)
- **Resposta Esperada** (200): objeto CT
- **Observações**: Retorna 404 se não encontrado

### 3.3 Criar CT
- **Nome**: Criar novo CT
- **Método**: `POST`
- **Path**: `/cts`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "nome": "string (obrigatório)"
}
```
- **Resposta Esperada** (201):
```json
{
  "mensagem": "CT criado com sucesso",
  "id": 3
}
```
- **Observações**: Nome único por account

### 3.4 Atualizar CT
- **Nome**: Atualizar CT existente
- **Método**: `PUT`
- **Path**: `/cts/:id`
- **Auth**: Bearer Token
- **Params**: `id`
- **Body**:
```json
{
  "nome": "string (obrigatório)",
  "ativo": "boolean (opcional)"
}
```
- **Resposta Esperada** (200):
```json
{
  "mensagem": "CT atualizado com sucesso"
}
```

### 3.5 Desativar CT
- **Nome**: Desativar CT
- **Método**: `PATCH`
- **Path**: `/cts/:id/desativar`
- **Auth**: Bearer Token
- **Params**: `id`
- **Resposta Esperada** (200):
```json
{
  "mensagem": "CT desativado com sucesso"
}
```

### 3.6 Ativar CT
- **Nome**: Ativar CT
- **Método**: `PATCH`
- **Path**: `/cts/:id/ativar`
- **Auth**: Bearer Token
- **Params**: `id`
- **Resposta Esperada** (200):
```json
{
  "mensagem": "CT ativado com sucesso"
}
```

---

## 4. ALUNOS

**Auth obrigatória**: SIM (Bearer Token)

### 4.1 Listar Alunos
- **Nome**: Listar alunos da conta
- **Método**: `GET`
- **Path**: `/alunos`
- **Auth**: Bearer Token
- **Query Params** (todos opcionais):
  - `nome` (filtro LIKE)
  - `cpf` (filtro exato)
  - `ct_id` (filtro por CT)
  - `ativo` (0 ou 1)
- **Resposta Esperada** (200): array de alunos

### 4.2 Buscar Aluno por ID
- **Nome**: Buscar aluno específico
- **Método**: `GET`
- **Path**: `/alunos/:id`
- **Auth**: Bearer Token
- **Params**: `id`
- **Resposta Esperada** (200): objeto aluno
- **Observações**: 404 se não encontrado

### 4.3 Criar Aluno
- **Nome**: Criar novo aluno
- **Método**: `POST`
- **Path**: `/alunos`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "ct_id": "number (obrigatório)",
  "nome": "string (obrigatório)",
  "cpf": "string (opcional, mas único por account)",
  "data_nascimento": "date (opcional)",
  "sexo": "string (opcional)",
  "telefone": "string (opcional)",
  "email": "string (opcional)",
  "nome_responsavel": "string (opcional)",
  "telefone_responsavel": "string (opcional)"
}
```
- **Resposta Esperada** (201): objeto aluno criado completo
- **Observações**: CPF único por account (409 se duplicado)

### 4.4 Atualizar Aluno
- **Nome**: Atualizar aluno
- **Método**: `PUT`
- **Path**: `/alunos/:id`
- **Auth**: Bearer Token
- **Params**: `id`
- **Body**: campos parciais permitidos (ct_id, nome, cpf, data_nascimento, sexo, telefone, email, nome_responsavel, telefone_responsavel, ativo)
- **Resposta Esperada** (200): objeto aluno atualizado
- **Observações**: 409 se CPF duplicado

### 4.5 Desativar Aluno
- **Nome**: Desativar aluno (exclusão lógica)
- **Método**: `DELETE`
- **Path**: `/alunos/:id`
- **Auth**: Bearer Token
- **Params**: `id`
- **Resposta Esperada** (200): objeto aluno atualizado (ativo=0)

### 4.6 Ativar Aluno
- **Nome**: Ativar aluno
- **Método**: `PATCH`
- **Path**: `/alunos/:id/ativar`
- **Auth**: Bearer Token
- **Params**: `id`
- **Resposta Esperada** (200): objeto aluno atualizado (ativo=1)

---

## 5. TRANSAÇÕES

**Auth obrigatória**: SIM (Bearer Token)

### 5.1 Listar Transações
- **Nome**: Listar transações com filtros e paginação
- **Método**: `GET`
- **Path**: `/transacoes`
- **Auth**: Bearer Token
- **Query Params** (todos opcionais):
  - `tipo` (`receita` ou `despesa`)
  - `descricao` (filtro LIKE)
  - `ct_id` (filtro por CT)
  - `pagina` (padrão: 1)
  - `limite` (padrão: 10)
  - `ordenar` (id, tipo, descricao, valor, criado_em, atualizado_em)
  - `direcao` (asc ou desc, padrão: asc)
- **Resposta Esperada** (200):
```json
{
  "pagina": 1,
  "limite": 10,
  "total": 25,
  "totalPaginas": 3,
  "filtros": { ... },
  "ordenacao": { ... },
  "dados": [ ... ]
}
```

### 5.2 Buscar Transação por ID
- **Nome**: Buscar transação específica
- **Método**: `GET`
- **Path**: `/transacoes/:id`
- **Auth**: Bearer Token
- **Params**: `id`
- **Resposta Esperada** (200): objeto transacao
- **Observações**: 404 se não encontrado

### 5.3 Criar Transação
- **Nome**: Criar nova transação
- **Método**: `POST`
- **Path**: `/transacoes`
- **Auth**: Bearer Token
- **Body**:
```json
{
  "tipo": "receita | despesa (obrigatório)",
  "descricao": "string (obrigatório)",
  "valor": "number > 0 (obrigatório)",
  "ct_id": "number (opcional, null permitido)"
}
```
- **Resposta Esperada** (201):
```json
{
  "mensagem": "Transação criada com sucesso",
  "id": 10
}
```
- **Observações**: Não permite duplicata (tipo + descricao por account)

### 5.4 Atualizar Transação
- **Nome**: Atualizar transação
- **Método**: `PUT`
- **Path**: `/transacoes/:id`
- **Auth**: Bearer Token
- **Params**: `id`
- **Body**: mesmo formato do criar
- **Resposta Esperada** (200):
```json
{
  "mensagem": "Transação atualizada com sucesso"
}
```
- **Observações**: Valida duplicata ignorando o próprio id

### 5.5 Deletar Transação
- **Nome**: Deletar transação (exclusão física)
- **Método**: `DELETE`
- **Path**: `/transacoes/:id`
- **Auth**: Bearer Token
- **Params**: `id`
- **Resposta Esperada** (200):
```json
{
  "mensagem": "Transação deletada com sucesso"
}
```

### 5.6 Resumo de Transações
- **Nome**: Resumo financeiro por período
- **Método**: `GET`
- **Path**: `/transacoes/resumo`
- **Auth**: Bearer Token
- **Query Params**:
  - `mes` (opcional, mas obrigatório com ano)
  - `ano` (opcional, mas obrigatório com mes)
  - `ct_id` (opcional)
- **Resposta Esperada** (200):
```json
{
  "filtro": { ... },
  "totalRegistros": 10,
  "totalReceitas": 1500.00,
  "totalDespesas": 800.00,
  "saldo": 700.00
}
```
- **Observações**: Se não informar mes/ano, traz resumo geral

### 5.7 Resumo Mensal
- **Nome**: Resumo mensal por ano
- **Método**: `GET`
- **Path**: `/transacoes/resumo/mensal`
- **Auth**: Bearer Token
- **Query Params**:
  - `ano` (obrigatório, 2000 a ano atual +1)
  - `ct_id` (opcional)
- **Resposta Esperada** (200): array com 12 meses (Janeiro a Dezembro) com totalReceitas, totalDespesas e saldo

---

## 6. ROTAS DE STATUS (SEM AUTENTICAÇÃO)

### 6.1 Raiz
- `GET /` - Informações da API

### 6.2 Saúde
- `GET /saude` - Status ok da API

### 6.3 Ping
- `GET /ping` - Teste de conectividade

### 6.4 Teste de Banco
- `GET /teste-banco` - Testa conexão MySQL

---

## 7. VARIÁVEIS RECOMENDADAS PARA COLLECTION

```
baseUrl: http://localhost:3000
token: (preenchido após login)
accountId: (preenchido após cadastro/login)
userId: (preenchido após cadastro/login)
ctId: (preenchido após criar CT)
alunoId: (preenchido após criar aluno)
transacaoId: (preenchido após criar transação)
```

---

## 8. ORDEM IDEAL DE EXECUÇÃO NO POSTMAN

1. **Status & Health Checks**
   - GET /
   - GET /saude
   - GET /ping
   - GET /teste-banco

2. **Autenticação**
   - POST /auth/cadastro (salvar accountId, userId, ctId, token)
   - POST /auth/login (atualizar token)

3. **CTs**
   - GET /cts (listar)
   - POST /cts (criar novo CT, salvar ctId)
   - GET /cts/:id
   - PUT /cts/:id
   - PATCH /cts/:id/desativar
   - PATCH /cts/:id/ativar

4. **Alunos**
   - POST /alunos (criar, salvar alunoId)
   - GET /alunos (listar)
   - GET /alunos/:id
   - PUT /alunos/:id
   - PATCH /alunos/:id/ativar
   - DELETE /alunos/:id (desativa)

5. **Transações**
   - POST /transacoes (criar, salvar transacaoId)
   - GET /transacoes (listar com filtros)
   - GET /transacoes/:id
   - PUT /transacoes/:id
   - DELETE /transacoes/:id

6. **Resumos Financeiros**
   - GET /transacoes/resumo (sem params)
   - GET /transacoes/resumo?mes=3&ano=2026
   - GET /transacoes/resumo/mensal?ano=2026

---

## 9. PENDÊNCIAS OU PONTOS DE ATENÇÃO

### Autenticação
- Rotas protegidas: `/cts/*`, `/transacoes/*`, `/alunos/*`
- Token JWT deve ser enviado no header: `Authorization: Bearer {token}`
- Token contém accountId (multi-tenant automático)

### Foreign Keys
- **Alunos** depende de CT existente (`ct_id` obrigatório)
- **Transações** pode ter `ct_id` null (transação geral da conta)

### Campos Obrigatórios
- **Cadastro**: nomeResponsavel, email, senha, nomeAccount, tipoAccount
- **Login**: email, senha
- **CT**: nome
- **Aluno**: nome, ct_id
- **Transação**: tipo, descricao, valor

### Validações Especiais
- **CPF**: único por account (409 se duplicado)
- **Nome CT**: único por account (409 se duplicado)
- **Transação (tipo+descricao)**: único por account (409 se duplicado)
- **Senha**: mínimo 6 caracteres
- **ID params**: devem ser numéricos positivos (middleware validarIdNumerico em algumas rotas)

### Exclusão
- **CTs**: exclusão lógica (ativo = 0/1)
- **Alunos**: exclusão lógica (ativo = 0/1)
- **Transações**: exclusão física (DELETE remove do banco)

### Paginação
- **CTs**: suporta page/limite
- **Transações**: suporta pagina/limite + ordenação
- **Alunos**: retorna lista completa (sem paginação implementada no repository atual)

### Inconsistências Encontradas
- Nenhuma crítica detectada. Estrutura modular bem definida.

---

**Pronto para gerar collection Postman completa na próxima etapa.**
