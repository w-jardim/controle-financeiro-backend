

# 🥋 API Gestão de CT - Backend

API REST para gestão de Centros de Treinamento (CTs) com controle financeiro, autenticação JWT e arquitetura multi-tenant.

---

## 🚀 Status (atual)

- ✅ API modular: `auth`, `cts`, `transacoes`
- ✅ Autenticação JWT (geração/verificação via `src/shared/utils/jwt.js`)
- ✅ Multi-tenant por `account_id`
- ✅ Docker + compose para desenvolvimento
- ✅ Infra de testes: Jest + Supertest (smoke tests verdes)

Pendências principais: aplicar índices SQL faltantes, melhorar logging estruturado e aumentar cobertura de integração.

---

## 🧱 Tecnologias

- Node.js + Express (CommonJS)
- MySQL 8 (mysql2 pool)
- Docker / Docker Compose
- Testes: Jest + Supertest

---

## 🧪 Testes e ambiente de integração

- Há um `docker-compose.test.yml` canônico na raiz que orquestra o MySQL de teste com healthcheck.
- Scripts úteis (na pasta `backend`): `db:test:up`, `db:test:down`, `test:with-db` — estes scripts sobem o DB de teste, aguardam `healthy` e executam a suíte de integração.
- Antes de rodar localmente, copie/ajuste `backend/.env.test.example` → `backend/.env.test` (NÃO comitar segredos reais). Exemplo inclui `JWT_SECRET`, `JWT_EXPIRES_IN`, `DB_PORT`, `NODE_ENV=test`.

Comandos rápidos:

```bash
# subir DB de teste (na raiz do repo):
docker compose -f docker-compose.test.yml up -d --build

# ou, a partir de backend, usar os scripts:
cd backend
npm run db:test:up
npm run test:with-db
npm run db:test:down
```

Observação: os testes de integração usam um setup global que fecha o pool MySQL no `afterAll` para evitar hangs.

---

## 🔐 Autenticação

- Endpoints principais: `/auth/register`, `/auth/login`.
- O token JWT é assinado com a variável `JWT_SECRET`; certifique-se de ter `backend/.env.test` com `JWT_SECRET` ao rodar testes.

Exemplo de login (POST `/auth/login`):

```json
{
  "email": "usuario@email.com",
  "senha": "123456"
}
```

Resposta com token:

```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "SEU_TOKEN_JWT"
}
```

---

## 📁 Organização e arquivos importantes

- Fixtures de teste: `backend/tests/fixtures/`
- Setup Jest: `backend/tests/setup/jest.setup.js` (carrega `backend/.env.test` quando `NODE_ENV=test`)
- Postman collection movida para `docs/postman/postman_collection.json`
- Arquivos antigos e backups arquivados em `docs/archive/`

---

## ⚠️ Riscos e pendências

1. Schema SQL: `mysql-init/01-init.sql` precisa de revisões — faltam índices únicos que garantam comportamento esperado frente a `ER_DUP_ENTRY` (ex.: índices para alunos). Atualizar e validar em homolog.
2. Logging: atualmente há uso de `console.*`; recomendamos migrar para Winston/Pino e integrar no `errorHandler`.
3. Segurança: aplicar `express-rate-limit`, Helmet e revisar CORS antes de deploy.
4. CI: revisar `package.json` raiz/CI e garantir pipelines utilizem `docker-compose.test.yml` para integração.

---

## 🔧 Como contribuir / passos rápidos

1. Criar branch: `git checkout -b chore/update-readme`
2. Rodar DB de teste e testes: ver seção acima (`npm run test:with-db`)
3. Fazer mudanças, adicionar testes, abrir PR para revisão

---

## 👨‍💻 Autor

Wallace 🚀


