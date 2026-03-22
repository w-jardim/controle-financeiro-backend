# PASSO 3 FASE 1 - Módulo de Autenticação (Cadastro)

## 📋 Implementação Completa

A implementação do módulo de autenticação com cadastro apenas (sem login, sem JWT) foi concluída com sucesso.

---

## 📁 Estrutura Criada

```
backend/src/modules/auth/
├── controllers/
│   └── authController.js        ← Orquestra requisições de cadastro
├── services/
│   └── authService.js           ← Lógica de negócio e validações
├── repositories/
│   └── authRepository.js        ← Acesso ao banco de dados
├── routes/
│   └── authRoutes.js            ← Define rota POST /auth/cadastro
└── module.js                    ← Entry point do módulo
```

---

## 🔧 Modificações no app.js

### Import adicionado (linha 7):
```javascript
const { registrarRotasAuth } = require('./modules/auth/module');
```

### Registro do módulo adicionado (seção "Registro de Módulos", após transações):
```javascript
registrarRotasAuth(app);
```

---

##📊 Arquitetura Implementada

### AuthRepository
Métodos de acesso ao banco (queries com placeholders):
- `buscarUsuarioPorEmail(email)` - Previne cadastro duplicado
- `criarAccount({ nome, tipo, plano, status })` - Cria a conta
- `criarUsuario({ nome, email, senhaHash })` - Cria o usuário
- `vincularUsuarioNaConta({ accountId, userId, role })` - Vincula user a account
- `criarCtInicial({ accountId, nome })` - Cria CT inicial para ct_owner

### AuthService
Lógica de negócio centralizada:
- **Validações obrigatórias**: nomeResponsavel, email, senha, nomeAccount, tipoAccount
- **Validação de senha**: mínimo 6 caracteres
- **Validação de tipo**: apenas 'ct_owner' ou 'profissional_autonomo'
- **Prevenção de duplicação**: verifica email existente (status 409)
- **Hash de senha**: bcrypt.hash(senha, 10)
- **Fluxo de negócio**:
  1. Cria account (plano='basic', status='ativo')
  2. Cria usuário com senha hashada
  3. Vincula usuário na account (role='owner')
  4. Se ct_owner e nomeCtInicial, cria CT inicial
  5. Retorna { mensagem, accountId, userId, ctId }

### AuthController
Simples e focado:
- Usa `asyncHandler` para captura de promises
- Chama service.cadastrarContaComOwner(req.body)
- Retorna status 201 com JSON

### AuthRoutes & Module
- Rota POST `/auth/cadastro`
- module.js exporta função `registrarRotasAuth(app)`

---

## 🧪 Exemplos de Teste

### Dependência Necessária
Bcrypt já está instalado no package.json:
```json
"bcrypt": "^6.0.0"
```

### Exemplo 1: Cadastro CT Owner (com CT inicial)

**Comando cURL:**
```bash
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nomeResponsavel": "Wallace",
    "email": "wallace@teste.com",
    "senha": "123456",
    "nomeAccount": "Wallace Gestão CT",
    "tipoAccount": "ct_owner",
    "nomeCtInicial": "CT Bangu"
  }'
```

**Comando PowerShell:**
```powershell
$body = @{
    nomeResponsavel = "Wallace"
    email = "wallace@teste.com"
    senha = "123456"
    nomeAccount = "Wallace Gestão CT"
    tipoAccount = "ct_owner"
    nomeCtInicial = "CT Bangu"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/auth/cadastro" `
  -Method POST -ContentType "application/json" `
  -Body $body -UseBasicParsing
```

**Resposta esperada (201):**
```json
{
  "mensagem": "Cadastro realizado com sucesso",
  "accountId": 1,
  "userId": 1,
  "ctId": 1
}
```

### Exemplo 2: Cadastro Profissional Autônomo (sem CT)

**Comando cURL:**
```bash
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nomeResponsavel": "Carlos",
    "email": "carlos@teste.com",
    "senha": "123456",
    "nomeAccount": "Carlos Personal",
    "tipoAccount": "profissional_autonomo"
  }'
```

**Resposta esperada (201):**
```json
{
  "mensagem": "Cadastro realizado com sucesso",
  "accountId": 2,
  "userId": 2,
  "ctId": null
}
```

### Exemplo 3: Erro - Email duplicado

**Comando:**
```bash
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nomeResponsavel": "Outro Wallace",
    "email": "wallace@teste.com",
    "senha": "123456",
    "nomeAccount": "Outra Conta",
    "tipoAccount": "ct_owner",
    "nomeCtInicial": "Outro CT"
  }'
```

**Resposta esperada (409):**
```json
{
  "erro": "Email já cadastrado"
}
```

### Exemplo 4: Erro - Senha muito curta

**Resposta esperada (400):**
```json
{
  "erro": "Senha deve ter pelo menos 6 caracteres"
}
```

### Exemplo 5: Erro - Tipo de conta inválido

**Resposta esperada (400):**
```json
{
  "erro": "Tipo de conta deve ser ct_owner ou profissional_autonomo"
}
```

---

## 📂 Arquivos JSON Preparados para Teste

Dois arquivos JSON estão prontos na raiz do projeto para facilitar testes:

1. **[AUTH_CADASTRO_CT_OWNER.json](../AUTH_CADASTRO_CT_OWNER.json)** - Cadastro de CT Owner com CT inicial
2. **[AUTH_CADASTRO_PROFISSIONAL.json](../AUTH_CADASTRO_PROFISSIONAL.json)** - Cadastro de Profissional Autônomo sem CT

### Como usar com curl:
```bash
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d @AUTH_CADASTRO_CT_OWNER.json
```

---

## ✅ Validações Implementadas

| Campo | Validação | Status | Erro |
|-------|-----------|--------|------|
| nomeResponsavel | Obrigatório | 400 | "Nome do responsável é obrigatório" |
| email | Obrigatório | 400 | "Email é obrigatório" |
| email | Não duplicado | 409 | "Email já cadastrado" |
| senha | Obrigatória | 400 | "Senha é obrigatória" |
| senha | ≥ 6 caracteres | 400 | "Senha deve ter pelo menos 6 caracteres" |
| nomeAccount | Obrigatório | 400 | "Nome da conta é obrigatório" |
| tipoAccount | Obrigatório | 400 | "Tipo de conta é obrigatório" |
| tipoAccount | 'ct_owner' ou 'profissional_autonomo' | 400 | "Tipo de conta deve ser ct_owner ou profissional_autonomo" |

---

## 🔐 Segurança

- ✅ Senha hash com bcrypt (10 rounds)
- ✅ Queries SQL com placeholders (prepared statements)
- ✅ Sem SQL concatenada
- ✅ Email único por usuário
- ✅ AppError para erros controlados

---

## 📝 O que NÃO foi implementado (conforme especificação)

- ❌ Login
- ❌ JWT
- ❌ Middlewares de autenticação
- ❌ Refresh tokens
- ❌ Logout
- ❌ Password reset
- ❌ 2FA

Isso fica para as próximas fases.

---

## 🚀 Como usar no seu workflow

### 1. Instalar dependências (se ainda não tiver):
```bash
cd backend
npm install
```

### 2. Iniciar servidor:
```bash
npm run dev
```

### 3. Fazer cadastro:
```bash
# Via cURL
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nomeResponsavel":"Wallace","email":"wallace@teste.com","senha":"123456","nomeAccount":"Wallace CT","tipoAccount":"ct_owner","nomeCtInicial":"CT Bangu"}'

# Via PowerShell (veja exemplos acima)

# Via arquivo JSON
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d @AUTH_CADASTRO_CT_OWNER.json
```

### 4. Verificar no banco:
```sql
-- Accounts criadas
SELECT * FROM accounts;

-- Users criados (senha está HASHADA)
SELECT * FROM users;

-- Vinculação
SELECT * FROM account_users;

-- CTs criados (para ct_owner)
SELECT * FROM cts;
```

---

## 🔄 Integração com Transações

O módulo de autenticação é **totalmente independente** do módulo de transações.
- Queries ao banco são executadas com a mesma conexão (shared)
- Erros usam o mesmo AppError
- Controllers usam o mesmo asyncHandler

Ambos os módulos coexistem sem conflito.

---

## 📌 Próximas Fases Sugeridas

**PASSO 4**: Implementar Login (verificação de senha, geração de token simples)
**PASSO 5**: Implementar JWT (token com expirção)
**PASSO 6**: Middleware de autenticação obrigatória nas rotas de transações

---

## ✨ Qualidade

- ✅ Código limpo e legível
- ✅ Sem complexidade desnecessária
- ✅ Segue padrão do projeto
- ✅ Sem alterações em módulos existentes
- ✅ Pronto para expandir

---

**Implementação concluída em: 22/03/2026**
**Versão do Módulo: 1.0.0**
**Padrão: CommonJS (require/module.exports)**
**Banco: MySQL com mysql2/promise**
