# Gestão de CTs e Finanças — Backend

API REST para gestão de centros de treinamento (CTs) de artes marciais: alunos, profissionais, modalidades, horários, agendamentos, presenças, mensalidades e transações financeiras.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Banco | MySQL 8 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validação | Zod 4 |
| Logging | Pino |
| Docs | OpenAPI 3.0.3 + Swagger UI |
| Testes | Jest + Supertest |
| Container | Docker + Docker Compose |

---

## Módulos

| Módulo | Rota base | Auth |
|--------|-----------|------|
| Auth | `/auth` | Público |
| CTs | `/cts` | JWT |
| Alunos | `/alunos` | JWT |
| Profissionais | `/profissionais` | JWT |
| Modalidades | `/modalidades` | JWT |
| Horários de Aula | `/horarios-aula` | JWT |
| Agendamentos | `/agendamentos` | JWT |
| Presenças | `/presencas` | JWT |
| Mensalidades | `/mensalidades` | JWT |
| Transações | `/transacoes` | JWT |

---

## Como rodar em desenvolvimento

### Pré-requisitos
- Node.js >= 20
- Docker e Docker Compose
- MySQL 8 (local ou via Docker)

### 1. Clonar e instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env com as credenciais reais
```

### 3. Subir banco via Docker (dev)

```bash
# Na raiz do projeto (acima de backend/)
docker compose -f docker-compose.dev.yml up -d
```

### 4. Iniciar o servidor

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## Variáveis de ambiente

| Variável | Obrigatória | Default | Descrição |
|----------|:-----------:|---------|-----------|
| `DB_HOST` | Sim | — | Host do MySQL |
| `DB_PORT` | Não | `3306` | Porta do MySQL |
| `DB_USER` | Sim | — | Usuário do banco |
| `DB_PASSWORD` | Sim | — | Senha do banco |
| `DB_NAME` | Sim | — | Nome do banco |
| `JWT_SECRET` | Sim | — | Segredo para assinar tokens |
| `JWT_EXPIRES_IN` | Não | `7d` | Expiração do token |
| `PORT` | Não | `3000` | Porta HTTP |
| `NODE_ENV` | Não | `development` | Ambiente (`development`, `production`, `test`) |
| `LOG_LEVEL` | Não | `info` | Nível de log (pino) |
| `CORS_ORIGIN` | Não | `*` | Origin permitido no CORS |

> O servidor **não sobe** se `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` ou `JWT_SECRET` estiverem ausentes.

---

## Testes

### Subir banco de teste e rodar suite completa

```bash
npm run test:with-db
```

### Rodar testes (banco já de pé)

```bash
npm test
```

### Subir/derrubar banco de teste manualmente

```bash
npm run db:test:up
npm run db:test:down
```

### Lint

```bash
npm run lint
```

---

## Docker — ambiente completo

```bash
# Desenvolvimento (stack padrão do projeto)
docker compose up -d --build

# Opcional: usar explicitamente o arquivo dev
docker compose -f docker-compose.dev.yml up -d --build
```

No ambiente de desenvolvimento (`docker-compose.dev.yml`), os serviços sobem em:
- Frontend (Vite): `http://localhost:5173`
- Backend (API): `http://localhost:3000`
- Adminer: `http://localhost:8080`

---

## Autenticação

1. **Cadastro**: `POST /auth/cadastro` → retorna `accountId`, `userId`, `ctId`
2. **Login**: `POST /auth/login` → retorna `{ dados: { token } }`
3. Enviar em rotas protegidas: `Authorization: Bearer <token>`

---

## Documentação Swagger

| Rota | Descrição |
|------|-----------|
| `GET /docs` | Swagger UI interativo |
| `GET /docs.json` | Spec OpenAPI em JSON |

---

## Padrão de resposta da API

### Sucesso

```json
{
  "dados": { ... },
  "meta": { "total": 10, "pagina": 1, "limite": 20 }
}
```

### Erro

```json
{
  "erro": {
    "mensagem": "Descrição do erro",
    "codigo": "BAD_REQUEST",
    "status": 400,
    "requestId": "uuid"
  }
}
```

Códigos: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNPROCESSABLE_ENTITY`, `INTERNAL_ERROR`.

---

## Rotas de saúde e operação

| Rota | Descrição |
|------|-----------|
| `GET /` | Info da API, versão, links |
| `GET /saude` | Health check |
| `GET /ping` | Ping simples |
| `GET /ready` | Readiness (inclui check do banco) |
| `GET /teste-banco` | Teste de conexão MySQL |

---

## Estrutura de pastas

```
backend/
├── src/
│   ├── app.js                  # Config Express, middlewares, rotas
│   ├── index.js                # Bootstrap (listen)
│   └── modules/
│       ├── agendamentos/
│       ├── alunos/
│       ├── auth/
│       ├── cts/
│       ├── horarios-aula/
│       ├── mensalidades/
│       ├── modalidades/
│       ├── presencas/
│       ├── profissionais/
│       └── transacoes/
│   └── shared/
│       ├── database/connection.js
│       ├── docs/openapi.yaml, swagger.js
│       ├── errors/AppError.js
│       ├── middlewares/
│       │   ├── authMiddleware.js
│       │   ├── corsConfig.js
│       │   ├── errorHandler.js
│       │   ├── requestId.js
│       │   └── validate.js
│       ├── utils/
│       │   ├── asyncHandler.js
│       │   ├── jwt.js
│       │   ├── logger.js
│       │   └── response.js
│       └── validators/
├── tests/
│   ├── integration/
│   ├── unit/
│   ├── helpers/
│   ├── fixtures/
│   └── setup/jest.setup.js
├── .env.example
├── .env.test
├── jest.config.js
└── package.json
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `JWT_SECRET não definido` | Definir `JWT_SECRET` no `.env` |
| `DB_NAME não foi carregado` (testes) | Verificar se `backend/.env.test` existe |
| `ER_ACCESS_DENIED_ERROR` | Conferir `DB_USER` e `DB_PASSWORD` |
| Porta 3000 ocupada | Mudar `PORT` no `.env` |
| Testes falham com timeout | Verificar se MySQL de teste está healthy (`npm run db:test:up`) |
| `ECONNREFUSED 127.0.0.1:3308` | Banco de teste não está rodando; executar `npm run db:test:up` |
