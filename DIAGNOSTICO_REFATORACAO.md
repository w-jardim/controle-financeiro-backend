# 📊 DIAGNÓSTICO E REFATORAÇÃO ARQUITETURAL

## 1️⃣ DIAGNÓSTICO DA ESTRUTURA ATUAL

### Situação Atual (Antes Refator)

```
backend/src/
├── index.js                           ← app + bootstrap juntos
├── database.js                        ← conexão MySQL
├── controllers/
│   └── transactionsController.js      ← 7 controladores
├── services/
│   └── transacaoService.js            ← lógica de transações
├── repositories/
│   └── transacaoRepository.js         ← acesso BD
├── routes/
│   └── transactionsRoutes.js          ← rotas /transacoes
└── middlewares/
    └── validarTransacao.js            ← validação input
```

### Análise Crítica

✅ **BOM (já implementado)**:
- Controllers leves (apenas orquestram)
- Service layer com lógica de negócio
- Repository layer com queries
- Separação de responsabilidades básica
- Middlewares específicos

❌ **PROBLEMAS**:
1. **Tudo na raiz `src/`** → Não escalável (quando tiver 10 módulos, vira caos)
2. **`index.js` mistura app + bootstrap** → Difícil de testar
3. **Middleware de validação específico** → Não reutilizável para outros módulos
4. **Sem estrutura de shared** → Codigo compartilhado desorganizado
5. **Sem pasta para utils/errors** → Utilitários espalhados
6. **Sem preparação para novos módulos** → Setup precário para CT/alunos/etc

🎯 **IMPACTO DA REFATORAÇÃO**:
- Seu projeto vai crescer de 1 módulo para +7 (usuários, alunos, profissionais, turmas, etc)
- Código atual vai ficar ilegível sem refatoração
- Novos devs não conseguirão entender padrão

---

## 2️⃣ NOVA ESTRUTURA PROPOSTA

### Estrutura Modular por Domínio

```
backend/src/
│
├── modules/                           ← Módulos de domínio
│   │
│   └── transacoes/                    ← Módulo de transações (ATUAL)
│       ├── controllers/
│       │   └── transacaoController.js
│       ├── services/
│       │   └── transacaoService.js
│       ├── repositories/
│       │   └── transacaoRepository.js
│       ├── routes/
│       │   └── transacaoRoutes.js
│       ├── middlewares/
│       │   └── validarTransacao.js
│       └── module.js                  ← NOVO: entry point do módulo
│
├── shared/                            ← Código compartilhado
│   ├── database/
│   │   └── connection.js              ← pool MySQL
│   ├── middlewares/
│   │   ├── errorHandler.js            ← tratamento de erros global
│   │   └── corsConfig.js              ← CORS middleware
│   ├── utils/
│   │   ├── asyncHandler.js            ← wrapper para async
│   │   └── validators.js              ← validadores generalizados
│   └── errors/
│       └── AppError.js                ← classe de erro customizado
│
├── app.js                             ← NOVO: setup express
├── index.js                           ← NOVO: bootstrap & listen
└── routes/
    └── index.js                       ← NOVO: registro de todas rotas
```

### Responsabilidade de Cada Pasta

| Pasta | Responsabilidade | Exemplo |
|-------|------------------|---------|
| `modules/transacoes/` | Toda lógica do módulo transações | CRUD, queries, validação |
| `modules/*/controllers/` | Orquestradores (req → service → res) | ChamamaService, format response |
| `modules/*/services/` | Lógica de negócio | Validações, regras, cálculos |
| `modules/*/repositories/` | Acesso ao BD puro | SELECT, INSERT, UPDATE, DELETE |
| `modules/*/routes/` | Definição de endpoints | GET /transacoes, POST, etc |
| `modules/*/middlewares/` | Middlewares específicos do módulo | validarTransacao, autenticarTransacao |
| `modules/*/module.js` | Entry point (carrega tudo) | Registra rotas em app |
| `shared/database/` | Conexão inicial | Pool MySQL compartilhado |
| `shared/middlewares/` | Middlewares globais | CORS, error handler |
| `shared/utils/` | Utilitários generalizados | asyncHandler, validators |
| `shared/errors/` | Classe de erro padrão | AppError |
| `app.js` | Setup Express | Middleware, rotas, config |
| `index.js` | Bootstrap do servidor | Listen, startup |

---

## 3️⃣ PLANO DE MIGRAÇÃO SEGURO

### Fase 1: Preparação (Sem Quebra)

**Passo 1**: Criar nova estrutura de pastas
```bash
# Criar pastas
mkdir -p src/modules/transacoes/{controllers,services,repositories,routes,middlewares}
mkdir -p src/shared/{database,middlewares,utils,errors}
```

**Passo 2**: Separar `app.js` de `index.js`
- `app.js` = configuração Express (não faz listen)
- `index.js` = bootstrap e listen

✅ Neste ponto ainda funciona (app.js é novo, index.js inclui app.js)

### Fase 2: Migração de Arquivos

**Passo 3**: Mover database para shared
```
src/database.js → src/shared/database/connection.js
```

**Passo 4**: Mover middlewares compartilhados
```
src/middlewares/ → src/shared/middlewares/
```

**Passo 5**: Mover arquivo transações para módulo
```
src/controllers/... → src/modules/transacoes/controllers/...
src/services/... → src/modules/transacoes/services/...
src/repositories/... → src/modules/transacoes/repositories/...
src/routes/... → src/modules/transacoes/routes/...
```

**Passo 6**: Atualizar imports em cadeia
```javascript
// Antigo:
const repository = require('../repositories/transacaoRepository');

// Novo:
const repository = require('../../repositories/transacaoRepository');
```

### Fase 3: Validação

**Passo 7**: Testar funcionamento
```bash
npm run dev
# Verificar: GET /transacoes funciona?
# Verificar: POST /transacoes funciona?
# Verificar: DELETE /transacoes/1 funciona?
```

**Passo 8**: Testar endpoints principais
```bash
curl http://localhost:3000/                           # Root
curl http://localhost:3000/saude                      # Health
curl http://localhost:3000/transacoes                 # Listar
curl http://localhost:3000/transacoes/resumo          # Resumo
curl http://localhost:3000/transacoes/resumo/mensal   # Resumo mensal
```

---

## 4️⃣ MATRIZ DE MIGRAÇÃO DE IMPORTS

### Arquivo: `backend/src/database.js` → `backend/src/shared/database/connection.js`

**Quem importa e como atualizar**:

```
1. src/repositories/transacaoRepository.js
   ANTES: const conexao = require('../database');
   DEPOIS: const conexao = require('../../shared/database/connection');

2. src/index.js (futuro app.js)
   ANTES: const conexao = require('./database');
   DEPOIS: const conexao = require('./shared/database/connection');
```

### Arquivo: `backend/src/middlewares/validarTransacao.js` → `backend/src/modules/transacoes/middlewares/validarTransacao.js`

**Quem importa e como atualizar**:

```
1. src/routes/transactionsRoutes.js (futuro src/modules/transacoes/routes/transacaoRoutes.js)
   ANTES: const validarTransacao = require('../middlewares/validarTransacao');
   DEPOIS: const validarTransacao = require('../middlewares/validarTransacao');
   (sem mudança, relativamente local)
```

### Arquivo: `backend/src/controllers/transactionsController.js` → `backend/src/modules/transacoes/controllers/transacaoController.js`

**Quem importa e como atualizar**:

```
1. src/routes/transactionsRoutes.js
   ANTES: require('../controllers/transactionsController')
   DEPOIS: require('../controllers/transacaoController')
   (sem mudança de caminho, só nome)
```

### Arquivo: `backend/src/routes/transactionsRoutes.js` → `backend/src/modules/transacoes/routes/transacaoRoutes.js`

**Quem importa e como atualizar**:

```
1. src/index.js (futuro app.js)
   ANTES: const rotasTransacoes = require('./routes/transactionsRoutes');
          app.use('/transacoes', rotasTransacoes);
   
   DEPOIS: const { registrarRotasTransacoes } = require('./modules/transacoes/module');
           registrarRotasTransacoes(app);
```

### Total de Arquivos com Imports:
- `transacaoController.js` → ZERO imports de projeto (só services)
- `transacaoService.js` → 1 import: repository → ATUALIZAR
- `transacaoRepository.js` → 1 import: database → ATUALIZAR
- `transacaoRoutes.js` → 2 imports: controller, middleware → SEM MUDANÇA (local)
- `app.js` (novo) → 3+ imports: middlewares, rotas, database

---

## 5️⃣ RISCOS IDENTIFICADOS E MITIGAÇÃO

| Risco | Mitigação |
|-------|-----------|
| Quebra de rotas `/transacoes` | Testar cada endpoint após mudança |
| Erro de import (caminho errado) | Executar `npm run dev` após cada mudança |
| Banco não conecta | Verificar se DATABASE moved para path certo |
| Middleware não aplica | Verificar se middlewares importa corretamente |

---

## PRÓXIMO PASSO:

Ir para **Seção 4️⃣ - REESCRITA DE ARQUIVOS** para ver código pronto para copiar-colar.

---

**Diagnóstico Completo** ✅
