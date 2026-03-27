# 📊 PLANO DE AÇÃO EXECUTIVO
## Backend Controle Financeiro

---

## 🎯 DECISÃO CRÍTICA

### Cenário Atual vs Futuro

```
HOJE (30% production-ready):
├─ ✅ API funciona localmente
├─ ✅ Testes manuais OK
├─ ✅ Docker setup bom
├─ ❌ 0% automated tests
├─ ❌ Sem autenticação (qualquer acessa)
├─ ❌ Sem logs estruturados
├─ ❌ Rate limiting ausente
└─ ⚠️  Quebra com 100+ usuarios

APÓS 2 SEMANAS (90% production-ready):
├─ ✅ Refatorado em 3 camadas
├─ ✅ 70% test coverage
├─ ✅ JWT authentication
├─ ✅ Winston logs estruturados
├─ ✅ Rate limiting + Helmet
├─ ✅ CI/CD pipeline
└─ ✅ Suporta 1000+ usuarios
```

### Recomendação:

🔴 **NÃO vá para produção sem FASE 1**  
🟡 **FASE 1 é essencial** (não opcional)  
✅ **Depois: seguro, escalável, profissional**

---

## 📋 FASE 1: ESTABILIZAÇÃO (ESSENCIAL)

### 1️⃣ Refatoração em 3 Camadas

**Arquivos a Criar/Alterar**:
```
src/
├── repositories/
│   └── TransacaoRepository.js    ← NOVO (SQL puro)
├── services/
│   └── TransacaoService.js       ← NOVO (lógica negócio)
├── controllers/
│   └── transactionsController.js ← REFATORAR (só orquestração)
├── middlewares/
│   ├── validarTransacao.js       ← Manter
│   ├── validarPaginacao.js       ← NOVO
│   └── tratarErros.js            ← NOVO
├── utils/
│   └── response.js               ← NOVO
```

**Exemplo - Antes vs Depois**:

*Antes (380 linhas em 1 controller):*
```javascript
async function listarTransacoes(req, res, next) {
  // Validação
  // Montagem query
  // Execução
  // Resposta
  // TUDO MISTURADO
}
```

*Depois (camadas separadas):*
```javascript
// REPOSITORY: Query pura
class TransacaoRepository {
  async listar(filtros) {
    const query = this.construirQuery(filtros);
    return await this.conexao.query(query);
  }
}

// SERVICE: Lógica de negócio
class TransacaoService {
  async listar(filtros, usuario) {
    if (filtros.limite > 100) throw new Error('Max 100');
    
    // Se não for admin, filtrar por usuario
    if (!usuario.isAdmin) {
      filtros.usuario_id = usuario.id;
    }
    
    return await this.repository.listar(filtros);
  }
}

// CONTROLLER: Orquestra
async function listarTransacoes(req, res, next) {
  try {
    const dados = await service.listar(req.query, req.user);
    res.json({ success: true, data: dados });
  } catch (erro) {
    next(erro);
  }
}
```

**Benefícios**:
- ✅ Service reutilizável em CLI/Job/GraphQL
- ✅ Repository testável isoladamente
- ✅ Controller limpo: 5 linhas vs 50
- ✅ Fácil adicionar cache em service
- ✅ Fácil adicionar autenticação depois

---

### 2️⃣ Implementar Testes (70% Cobertura Mínimo)

**Package.json Atualizado**:
```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --collectCoverageFrom='src/**/*.js'"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

**Testes Necessários**:

*Exemplo: testes/transacoes.test.js*
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('Transações API', () => {
  describe('GET /transacoes', () => {
    it('deve listar transações com paginação', async () => {
      const res = await request(app)
        .get('/transacoes?page=1&limit=10');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagina', 1);
      expect(res.body).toHaveProperty('dados');
      expect(Array.isArray(res.body.dados)).toBe(true);
    });

    it('deve filtrar por tipo', async () => {
      const res = await request(app)
        .get('/transacoes?tipo=receita');
      
      expect(res.status).toBe(200);
      res.body.dados.forEach(t => {
        expect(t.tipo).toBe('receita');
      });
    });

    it('deve rejeitar paginação inválida', async () => {
      const res = await request(app)
        .get('/transacoes?page=0&limit=-5');
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });
  });

  describe('POST /transacoes', () => {
    it('deve criar transação válida', async () => {
      const res = await request(app)
        .post('/transacoes')
        .send({
          tipo: 'receita',
          descricao: 'Salário',
          valor: 5000
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('deve rejeitar tipo inválido', async () => {
      const res = await request(app)
        .post('/transacoes')
        .send({
          tipo: 'transfer',  // ← inválido
          descricao: 'Salário',
          valor: 5000
        });
      
      expect(res.status).toBe(400);
    });

    it('deve rejeitar valor negativo', async () => {
      const res = await request(app)
        .post('/transacoes')
        .send({
          tipo: 'receita',
          descricao: 'Salário',
          valor: -5000  // ← inválido
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /transacoes/:id', () => {
    it('deve deletar transação existente', async () => {
      const res = await request(app)
        .delete('/transacoes/1');
      
      expect(res.status).toBe(200);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .delete('/transacoes/99999');
      
      expect(res.status).toBe(404);
    });
  });
});
```

**Rodar**:
```bash
npm test                  # Executa todos testes
npm test -- --coverage   # Com cobertura
npm run test:watch       # Watch mode (re-run on save)
```

**Meta**: ≥70% cobertura (linhas de código testadas)

---

### 3️⃣ Adicionar Logs Estruturados (Winston)

**package.json**:
```json
{
  "dependencies": {
    "winston": "^3.11.0"
  }
}
```

**Criar: src/utils/logger.js**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Arquivo: todas os logs
    new winston.transports.File({ 
      filename: 'logs/error.log',
      level: 'error'
    }),
    // Arquivo: todos logs
    new winston.transports.File({ 
      filename: 'logs/combine.log'
    }),
    // Console: em desenvolvimento
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ] : [])
  ]
});

module.exports = logger;
```

**Usar em src/index.js**:
```javascript
const logger = require('./utils/logger');

logger.info('Aplicação iniciada', {
  porta: PORTA,
  ambiente: process.env.NODE_ENV
});

app.use((erro, req, res, next) => {
  logger.error('Erro na requisição', {
    rota: req.path,
    metodo: req.method,
    erro: erro.message,
    stack: erro.stack,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    status: 'erro',
    mensagem: 'Erro interno do servidor'
  });
});
```

**Usar em controller**:
```javascript
async function listarTransacoes(req, res, next) {
  try {
    logger.info('Listando transações', {
      filtros: req.query,
      usuario_id: req.user?.id
    });

    const dados = await service.listar(req.query);
    
    logger.info('Transações listadas com sucesso', {
      quantidade: dados.length
    });

    res.json(dados);
  } catch (erro) {
    logger.error('Erro ao listar transações', {
      erro: erro.message,
      stack: erro.stack
    });
    next(erro);
  }
}
```

**Arquivo de log gerado** (`logs/combine.log`):
```json
{"level":"info","message":"Aplicação iniciada","porta":3000,"ambiente":"development","timestamp":"2025-01-15T10:00:00.000Z"}
{"level":"info","message":"Listando transações","filtros":{"tipo":"receita"},"usuario_id":1,"timestamp":"2025-01-15T10:00:05.000Z"}
{"level":"info","message":"Transações listadas com sucesso","quantidade":10,"timestamp":"2025-01-15T10:00:05.100Z"}
```

---

### 4️⃣ Implementar Rate Limiting

**package.json**:
```json
{
  "dependencies": {
    "express-rate-limit": "^7.0.0"
  }
}
```

**Criar: src/middlewares/rateLimit.js**
```javascript
const rateLimit = require('express-rate-limit');

// Global rate limit: 100 req/min por IP
const limitadorGlobal = rateLimit({
  windowMs: 60 * 1000,       // 1 minuto
  max: 100,                   // 100 requisições máximo
  message: 'Muitas requisições, tente mais tarde',
  standardHeaders: true,      // Retorna info em RateLimit-* headers
  legacyHeaders: false
});

// Strict rate limit: 10 req/min para endpoints sensíveis
const limitadorStricto = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Muitas requisições neste endpoint'
});

module.exports = {
  limitadorGlobal,
  limitadorStricto
};
```

**Usar em src/index.js**:
```javascript
const { limitadorGlobal, limitadorStricto } = require('./middlewares/rateLimit');

// Global
app.use(limitadorGlobal);

// Endpoints específicos (POST/DELETE são críticos)
app.post('/transacoes', limitadorStricto, ...);
app.delete('/transacoes/:id', limitadorStricto, ...);
```

**Teste**:
```bash
# Faz 15 requisições rápidas
for i in {1..15}; do
  curl http://localhost:3000/transacoes
done

# Requisição 11-15 retorna 429 Too Many Requests ✓
```

---

## 🔁 Atualização do Plano — Estado atual (2026-03-27)

Status das ações propostas e trabalho realizado no repositório (resumo):

- ✅ Remoção de arquivo obsoleto: `backend/docker-compose.test.yml` (arquivo vazio removido).
- ✅ Fixtures organizadas: `AUTH_CADASTRO_CT_OWNER.json` e `AUTH_CADASTRO_PROFISSIONAL.json` movidas para `backend/tests/fixtures/` e documentação atualizada.
- ✅ Coleção Postman arquivada em `docs/postman/postman_collection.json`; referência em `backend/.postman/resources.yaml` atualizada.
- ✅ Documentos antigos e backups arquivados em `docs/archive/` (preservados para revisão).
- ✅ Exemplo de ambiente de teste atualizado: `backend/.env.test.example` inclui `DB_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN` e `NODE_ENV=test`.
- ✅ `errorHandler` ajustado para suprimir logs em `NODE_ENV=test` para evitar poluição da saída de testes.

Itens pendentes / ações recomendadas:

- [ ] Adicionar índices únicos faltantes no `mysql-init/01-init.sql` relacionados a `alunos` (ex.: `uq_alunos_nome_data`, `uq_alunos_nome_telefone`) — alteração de schema, testar em ambiente homolog.
- [ ] Validar execução completa da suíte de integração contra DB de teste: `npm run test:with-db` e corrigir regressões.
- [ ] Confirmar `backend/.env.test` está no `.gitignore` e documentar fluxo de testes no README.
- [ ] Revisão manual recomendada: `package.json` na raiz e demais MDs de auditoria antes de remoção/arquivamento adicional.
- [ ] Planejar/logging estruturado (winston/pino) e rate limiting conforme Fase 1 (prioridade média).

Observações:

- Todas as mudanças aplicadas nesta etapa foram preservadas de forma reversível (git) e sem remover código funcional.
- Arquivos foram arquivados em `docs/archive/` para consulta histórica.


---

### 5️⃣ Adicionar Helmet (Security Headers)

**package.json**:
```json
{
  "dependencies": {
    "helmet": "^7.1.0"
  }
}
```

**Usar em src/index.js** (uma linha!):
```javascript
const helmet = require('helmet');
const express = require('express');
const app = express();

app.use(helmet());  // ← Uma linha, protege 9 headers!

app.use(express.json());
// ... resto do código
```

**O que protege**:
- ✅ X-Frame-Options (protege contra clickjacking)
- ✅ X-Content-Type-Options (protege contra MIME sniffing)
- ✅ X-XSS-Protection (protege contra XSS)
- ✅ Strict-Transport-Security (força HTTPS)
- ✅ Content-Security-Policy (controla scripts permitidos)
- E mais 4...

---

### 6️⃣ Limpeza Geral

**Remover debug code** (src/index.js, linha 32):
```javascript
// ❌ ANTES:
res.status(200).json({
  status: 'ok',
  mensagem: 'API do controlador financeiro está funcionando',
  //mensagem: "AGORA ESTOU EM DEV 🔥",  ← Remover esta linha
  timestamp: new Date().toISOString()
});

// ✅ DEPOIS:
res.status(200).json({
  status: 'ok',
  mensagem: 'API do controlador financeiro está funcionando',
  timestamp: new Date().toISOString()
});
```

**Versão dinâmica de package.json**:
```javascript
// ❌ ANTES (src/index.js):
res.status(200).json({
  mensagem: 'Bem-vindo à API de Controle Financeiro',
  versao: '1.0.0',  ← Hardcoded!
});

// ✅ DEPOIS:
const package = require('../package.json');

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'Bem-vindo à API de Controle Financeiro',
    versao: package.version,  ← De package.json
  });
});
```

**Validação de limites**:
```javascript
// Em validarTransacao.js
const MAX_DESCRICAO = 255;
const MAX_VALOR = 999999999.99;

if (descricao.length > MAX_DESCRICAO) {
  return res.status(400).json({
    erro: `Descrição não pode exceder ${MAX_DESCRICAO} caracteres`
  });
}

if (valor > MAX_VALOR) {
  return res.status(400).json({
    erro: `Valor não pode exceder ${MAX_VALOR}`
  });
}
```

---

## 📈 FASE 2: PROFISSIONALIZAÇÃO (2-3 semanas)

### 7️⃣ Implementar Autenticação JWT

**package.json**:
```json
{
  "dependencies": {
    "jsonwebtoken": "^9.1.2",
    "bcrypt": "^5.1.1"
  }
}
```

**Criar: src/controllers/AuthController.js**
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

class AuthController {
  async login(req, res, next) {
    try {
      const { usuario, senha } = req.body;
      
      // Validar credenciais (buscar no BD)
      const user = await usuarioRepository.findByUsername(usuario);
      if (!user) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Verificar senha (hashed)
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaValida) {
        logger.warn('Tentativa de login falhou', { usuario });
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, usuario: user.usuario },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info('Login bem-sucedido', { usuario: user.usuario });
      res.json({ token });
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = new AuthController();
```

**Criar: src/middlewares/autenticar.js**
```javascript
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

module.exports = autenticar;
```

**Usar nas rotas**:
```javascript
const autenticar = require('../middlewares/autenticar');

roteador.get('/', autenticar, listarTransacoes);     // Protegido
roteador.post('/', autenticar, validarTransacao, criarTransacao);  // Protegido
roteador.delete('/:id', autenticar, deletarTransacao);  // Protegido
```

**Teste**:
```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"joao","senha":"123456"}'
# Resposta: { "token": "eyJhbGciOiJIUzI1NiIs..." }

# 2. Usar token
curl http://localhost:3000/transacoes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
# Funciona! ✓

# 3. Sem token
curl http://localhost:3000/transacoes
# Resposta 401: Token não fornecido
```

---

### 8️⃣ Adicionar Swagger/OpenAPI

**package.json**:
```json
{
  "dependencies": {
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.8"
  }
}
```

**Criar: src/swagger.js**
```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Controle Financeiro',
      version: '1.0.0',
      description: 'API para gestão de transações financeiras'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor desenvolvimento'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
```

**Documentar rotas**:
```javascript
// Em routes/transactionsRoutes.js

/**
 * @swagger
 * /transacoes:
 *   get:
 *     summary: Lista todas as transações
 *     parameters:
 *       - name: tipo
 *         in: query
 *         schema:
 *           type: string
 *           enum: [receita, despesa]
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de transações
 */
roteador.get('/', listarTransacoes);
```

**Acessar**: `http://localhost:3000/api-docs`

---

### 9️⃣ Versionamento API (/v1/)

**Mover rotas**:
```javascript
// Antes:
app.use('/transacoes', rotasTransacoes);

// Depois:
app.use('/v1/transacoes', rotasTransacoes);
app.use('/v2/transacoes', rotasTransacoesNova);  // Futura
```

**Benefício**: Permite evolução sem quebrar client

---

### 🔟 Response Envelope Padrão

**Criar: src/utils/response.js**
```javascript
class Response {
  static success(data, mensagem = 'Sucesso') {
    return {
      success: true,
      message: mensagem,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(erro, status = 500, detalhes = null) {
    return {
      success: false,
      error: erro,
      details: detalhes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = Response;
```

**Usar**:
```javascript
const Response = require('../utils/response');

// Antes:
res.json({ pagina: 1, dados: [...] });

// Depois:
res.json(Response.success({ pagina: 1, dados: [...] }));
```

**Resposta padronizada**:
```json
{
  "success": true,
  "message": "Transações listadas com sucesso",
  "data": {
    "pagina": 1,
    "dados": [...]
  },
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

---

## 📈 FASE 3: PRODUCTION (1 mês)

### 1️⃣1️⃣ CI/CD Pipeline (GitHub Actions)

**Criar: .github/workflows/ci.yml**
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: tests
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm install
      
      - name: Rodar testes
        run: npm test
      
      - name: Lint
        run: npm run lint
      
      - name: Build Docker
        run: docker build -t myapp:latest ./backend
      
      - name: Push para registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag myapp:latest ${{ secrets.DOCKER_USERNAME }}/myapp:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/myapp:latest
```

**Resultado**: A cada push no main, roda testes → se OK → build Docker → push registry → alert

---

### 1️⃣2️⃣ Otimizar Dockerfile

**Multi-stage build**:
```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json .
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

**Resultado**: Imagem reduz de 500MB → 100MB ✓

---

## 🎓 ESTIMATIVA DE TEMPO

| Fase | Tarefas | Horas | Prazo |
|------|---------|-------|-------|
| **1. ESSENCIAL** | Refatoração + Tests + Logs + Rate Limit + Helmet | 20-25h | 1 semana |
| **2. PROFISSIONAL** | JWT + Swagger + Versionamento + Response | 15-20h | 2-3 dias |
| **3. PRODUÇÃO** | CI/CD + Docker + Monit | 10-15h | 2-3 dias |
| **TOTAL** | | **60-70h** | **2 semanas** |

---

## ✅ CHECKLIST FINAL

Antes de ir para produção, validar:

```
SEGURANÇA:
 ☐ Sem passwords hardcoded
 ☐ JWT configurado
 ☐ CORS restringido
 ☐ Helmet headers
 ☐ Rate limiting
 ☐ SQL injection protegido
 ☐ npm audit sem vulnerabilidades

TESTES:
 ☐ 70%+ cobertura
 ☐ Testes de integração passa
 ☐ Testes de erro passa
 ☐ Load testing (100+ concurrent)

LOGS & MONITORAMENTO:
 ☐ Winston logs estruturados
 ☐ Correlation IDs funcionando
 ☐ Alertas configurados
 ☐ Rotating de logs

PERFORMANCE:
 ☐ Queries otimizadas
 ☐ Índices criados
 ☐ Cache configurado (optional)
 ☐ Timeout handling

DEVOPS:
 ☐ CI/CD pipeline
 ☐ Docker multi-stage
 ☐ Healthcheck robusto
 ☐ Backup MySQL configurado

DOCUMENTAÇÃO:
 ☐ README atualizado
 ☐ Swagger completo
 ☐ Architecture Decision Records
 ☐ Runbook de deploy
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Hoje**: Ler este documento + AUDITORIA_TECNICA.md
2. **Amanhã (Dia 1)**: Começar FASE 1 - Refatoração
3. **Dia 3**: Testes + Logs
4. **Dia 5**: Rate limit + Helmet + Limpeza
5. **Dia 8**: PR para main com FASE 1 completa
6. **Dia 9-10**: Review + Testes
7. **Dia 11-13**: FASE 2 - JWT + Swagger
8. **Dia 14**: Deploy staging + load test
9. **Dia 15**: CI/CD deploy automático

**RESULTADO**: Pronto para produção em 2 semanas! ✅

---

**Plano de Ação Criado**: 2025 ✅
