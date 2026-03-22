# API de Gestão de Centro de Treinamento (CT) de Artes Marciais

Sistema backend modular para gerenciamento completo de um centro de treinamento de artes marciais, iniciando com módulo de gestão financeira e evoluindo progressivamente para suportar alunos, profissionais, turmas, agendamentos e muito mais.

**Status**: 🟢 **Funcional** | **Módulos Ativos**: Transações Financeiras | **Versão**: 1.1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Quick Start](#quick-start)
3. [Arquitetura](#arquitetura)
4. [Instalação](#instalação)
5. [API Endpoints](#api-endpoints)
6. [Desenvolvimento](#desenvolvimento)
7. [Roadmap](#roadmap)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

### Contexto

Este projeto começou como uma simples API de controle financeiro (receitas e despesas) e está evoluindo para um **sistema completo de gestão de centro de treinamento**.

### Objetivos

- 🎯 Gerenciar de forma centralizada todos os aspectos de um CT
- 🎯 Modularidade: fácil adicionar novos domínios (alunos, turmas, etc)
- 🎯 Performance e escalabilidade
- 🎯 Code quality e manutenibilidade

### Escopo Atual (v1.1.0)

- ✅ **Módulo Transações**: CRUD de receitas/despesas com filtros, paginação e relatórios

### Escopo Futuro

- 🗂️ **Módulo Autenticação** (v2.0): Usuários e JWT
- 👥 **Módulo Alunos** (v2.0): Cadastro, histórico
- 👨‍🏫 **Módulo Profissionais** (v2.1): Instrutores, especialidades
- 📚 **Módulo Turmas** (v2.1): Definição, horários
- 📅 **Módulo Agendamentos** (v2.1): Sistema de aulas
- 📊 **Módulo Avaliações** (v3.0): Avaliações físicas
- 💳 **Módulo Matrículas** (v3.0): Gestão de mensalidades

---

## Quick Start

### 1️⃣ Requisitos
- Docker e Docker Compose instalados
- **OU** Node.js 20+ + MySQL 8.0+

### 2️⃣ Iniciar (Docker - Recomendado)

```bash
git clone <seu-repositorio>
cd controle-financeiro-backend
docker-compose up -d
```

### 3️⃣ Testar

```bash
curl http://localhost:3000/saude
# Resposta: {"status":"ok","mensagem":"API funcionando"}
```

### 4️⃣ Explorar

- **API**: http://localhost:3000
- **Banco de Dados**: http://localhost:8080 (Adminer)
- **Documentação**: Veja [API Endpoints](#api-endpoints)

---

## Stack Tecnológico

```
Node.js 20 LTS
├── Express 5.1.0      (Framework HTTP)
├── MySQL 8.0          (Banco de dados)
├── mysql2 3.20.0      (Driver MySQL promise-based)
└── nodemon 3.1.14     (Hot-reload desenvolvimento)
```

---

## Arquitetura

### Estrutura de Pastas

```
backend/src/
│
├── app.js                           ← Configuração Express
├── index.js                         ← Bootstrap / Inicialização
│
├── modules/                         ← Módulos de Domínio
│   └── transacoes/                  ← Módulo Transações
│       ├── controllers/             ← Orquestra requisições
│       ├── services/                ← Lógica de negócio
│       ├── repositories/            ← Acesso ao BD
│       ├── routes/                  ← Definição de rotas
│       ├── middlewares/             ← Validação input
│       └── module.js                ← Entry point
│
└── shared/                          ← Código Compartilhado
    ├── database/
    │   └── connection.js            ← Pool MySQL
    ├── middlewares/
    │   ├── errorHandler.js          ← Tratamento de erros
    │   └── corsConfig.js            ← CORS
    ├── utils/
    │   └── asyncHandler.js          ← Wrapper async/await
    └── errors/
        └── AppError.js              ← Classe erro padrão
```

### Fluxo de Requisição

```
Request HTTP
     ↓
Routes (define endpoints)
     ↓
Middleware (valida input)
     ↓
Controller (orquestra, chama service)
     ↓
Service (lógica de negócio)
     ↓
Repository (acesso ao BD)
     ↓
Database (pool MySQL)
```

### Benefícios

| Aspecto | Benefício |
|---------|-----------|
| **Modular** | Fácil adicionar novos módulos |
| **Separação de Responsabilidades** | Cada camada tem seu propósito |
| **Testabilidade** | Camadas isoladas |
| **Reutilização** | Services usáveis em CLI, jobs, etc |
| **Escalabilidade** | Estrutura pronta para crescimento |

---

## Instalação

### Local (Node.js + MySQL)

```bash
# 1. Clonar e instalar
git clone <seu-repositorio>
cd backend
npm install

# 2. Configurar .env
cp ../.env.example ../.env
# Edite .env com suas credenciais

# 3. Criar banco
mysql -u root -p < ../mysql-init/01-init.sql

# 4. Rodar
npm run dev      # com hot-reload
# ou
npm start        # produção
```

### Docker (Recomendado)

```bash
# Desenvolvimento (hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose up -d
```

**Serviços Disponíveis**:
- **Backend**: http://localhost:3000
- **Adminer**: http://localhost:8080
- **MySQL**: localhost:3307

**Comandos úteis**:
```bash
docker-compose logs -f backend  # Ver logs
docker-compose down             # Parar
docker-compose down -v          # Parar + limpar dados
```

---

## API Endpoints

### Health Check

```http
GET /                   # Info da API
GET /saude              # Status do servidor
GET /ping               # Pong simples
GET /teste-banco        # Valida conexão MySQL
```

### Transações

#### Listar

```http
GET /transacoes?pagina=1&limite=10&tipo=receita&descricao=salario&ordenar=id&direcao=asc
```

**Query Parameters**:
- `pagina` (default=1) - Número da página
- `limite` (default=10) - Itens por página
- `tipo` - Filtrar por "receita" ou "despesa"
- `descricao` - Buscar em descrição (partial match)
- `ordenar` (default=id) - Campo: id, tipo, descricao, valor, criado_em
- `direcao` (default=asc) - ASC ou DESC

**Resposta (200)**:
```json
{
  "pagina": 1,
  "limite": 10,
  "total": 25,
  "totalPaginas": 3,
  "filtros": { "tipo": "receita" },
  "ordenacao": { "campo": "id", "direcao": "asc" },
  "dados": [
    {
      "id": 1,
      "tipo": "receita",
      "descricao": "Salário mensal",
      "valor": 3000.00,
      "criado_em": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

#### Buscar por ID

```http
GET /transacoes/:id
```

**Resposta (200)**:
```json
{
  "id": 1,
  "tipo": "receita",
  "descricao": "Salário mensal",
  "valor": 3000.00,
  "criado_em": "2026-03-01T10:00:00.000Z"
}
```

#### Criar

```http
POST /transacoes
Content-Type: application/json

{
  "tipo": "receita",
  "descricao": "Freelance projeto X",
  "valor": 500.50
}
```

**Campos Obrigatórios**:
- `tipo` (string) - "receita" ou "despesa"
- `descricao` (string) - Não vazio, até 255 caracteres
- `valor` (number) - Maior que 0, até 999999999.99

**Resposta (201)**:
```json
{
  "mensagem": "Transação criada com sucesso",
  "id": 42
}
```

#### Atualizar

```http
PUT /transacoes/:id
Content-Type: application/json

{
  "tipo": "despesa",
  "descricao": "Compras supermercado",
  "valor": 150.75
}
```

**Resposta (200)**:
```json
{
  "mensagem": "Transação atualizada com sucesso"
}
```

#### Deletar

```http
DELETE /transacoes/:id
```

**Resposta (200)**:
```json
{
  "mensagem": "Transação deletada com sucesso"
}
```

#### Resumo de Período

```http
GET /transacoes/resumo?mes=3&ano=2026
```

**Query Parameters** (ambos opcionais):
- `mes` (1-12)
- `ano` (2000+)

**Resposta (200)**:
```json
{
  "filtro": { "mes": 3, "ano": 2026 },
  "totalRegistros": 15,
  "totalReceitas": 3500.00,
  "totalDespesas": 1200.50,
  "saldo": 2299.50
}
```

#### Resumo Mensal (Ano Completo)

```http
GET /transacoes/resumo/mensal?ano=2026
```

**Query Parameters**:
- `ano` (obrigatório) - Qual ano

**Resposta (200)**:
```json
[
  {
    "ano": 2026,
    "mes": 1,
    "nomeMes": "Janeiro",
    "totalReceitas": 3500.00,
    "totalDespesas": 1200.50,
    "saldo": 2299.50
  },
  {
    "ano": 2026,
    "mes": 2,
    "nomeMes": "Fevereiro",
    "totalReceitas": 3500.00,
    "totalDespesas": 950.75,
    "saldo": 2549.25
  }
  // ... mais 10 meses
]
```

---

## Testing

### cURL

```bash
# Health check
curl http://localhost:3000/saude

# Listar transações
curl "http://localhost:3000/transacoes?limite=5"

# Criar
curl -X POST http://localhost:3000/transacoes \
  -H "Content-Type: application/json" \
  -d '{"tipo":"receita","descricao":"Salário","valor":3500}'

# Atualizar
curl -X PUT http://localhost:3000/transacoes/1 \
  -H "Content-Type: application/json" \
  -d '{"tipo":"receita","descricao":"Salário (atualizado)","valor":3800}'

# Deletar
curl -X DELETE http://localhost:3000/transacoes/1

# Resumo
curl "http://localhost:3000/transacoes/resumo?mes=3&ano=2026"

# Resumo mensal
curl "http://localhost:3000/transacoes/resumo/mensal?ano=2026"
```

### PowerShell

```powershell
# Health check
(Invoke-WebRequest -Uri http://localhost:3000/saude -UseBasicParsing).Content

# Listar
(Invoke-WebRequest -Uri "http://localhost:3000/transacoes?limite=5" -UseBasicParsing).Content | ConvertFrom-Json

# Criar
$body = '{"tipo":"receita","descricao":"Salário","valor":3500}'
Invoke-WebRequest -Uri http://localhost:3000/transacoes `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing

# Resumo mensal
(Invoke-WebRequest -Uri "http://localhost:3000/transacoes/resumo/mensal?ano=2026" -UseBasicParsing).Content | 
  ConvertFrom-Json | Format-Table mes, nomeMes, totalReceitas, totalDespesas, saldo
```

---

## Desenvolvimento

### Padrão de Commits

```bash
git commit -m "feat(transacoes): adicionar filtro por tipo"
git commit -m "fix(transacoes): corrigir paginação"
git commit -m "docs(readme): atualizar instruções"
git commit -m "refactor(architecture): reorganizar em estrutura modular"
```

### Adicionar Novo Módulo

Para adicionar módulo (ex: "alunos"):

```bash
# 1. Criar estrutura
mkdir -p src/modules/alunos/{controllers,services,repositories,routes,middlewares}

# 2. Criar arquivos:
src/modules/alunos/controllers/alunoController.js
src/modules/alunos/services/alunoService.js
src/modules/alunos/repositories/alunoRepository.js
src/modules/alunos/routes/alunoRoutes.js
src/modules/alunos/module.js

# 3. Em app.js, registrar:
const { registrarRotasAlunos } = require('./modules/alunos/module');
registrarRotasAlunos(app);
```

### Padrões de Código

#### Repository

```javascript
const conexao = require('../../../shared/database/connection');

class MeuRepository {
  async listar() {
    const [dados] = await conexao.query('SELECT * FROM tabela');
    return dados;
  }
}

module.exports = new MeuRepository();
```

#### Service

```javascript
const repository = require('../repositories/meuRepository');
const AppError = require('../../../shared/errors/AppError');

class MeuService {
  async listar() {
    return await repository.listar();
  }

  async buscarPorId(id) {
    if (!id || id <= 0) throw new AppError('ID inválido', 400);
    const item = await repository.buscarPorId(id);
    if (!item) throw new AppError('Não encontrado', 404);
    return item;
  }
}

module.exports = new MeuService();
```

#### Controller

```javascript
const meuService = require('../services/meuService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const dados = await meuService.listar();
  return res.status(200).json(dados);
});

module.exports = { listar };
```

---

## Roadmap

### v1.2.0 (Próximo)
- [ ] Melhorar validação com biblioteca Zod
- [ ] Adicionar Swagger/OpenAPI
- [ ] Testes de integração básicos

### v1.5.0
- [ ] Testes unitários (70%+ cobertura)
- [ ] Logging estruturado (Winston)
- [ ] Rate limiting

### v2.0.0 (Major)
- [ ] Autenticação JWT
- [ ] Módulo Usuários
- [ ] Módulo Alunos (CRUD)
- [ ] Testes com +90% cobertura

### v2.1.0
- [ ] Módulo Profissionais
- [ ] Módulo Turmas
- [ ] Módulo Agendamentos básico

### v3.0.0
- [ ] Módulo Avaliações físicas
- [ ] Módulo Matrículas completo
- [ ] Dashboard avançado
- [ ] API GraphQL (paralelo com REST)

---

## Troubleshooting

### "Table 'tabela' doesn't exist"
```bash
docker-compose down -v
docker-compose up -d
# Recria containers com script de inicialização
```

### "Cannot GET /saude" (404)
```bash
docker-compose ps      # Verificar se backend está rodando
docker-compose logs backend
```

### Conexão recusada em MySQL
```bash
# Verificar .env
cat .env
# Deve ter DB_HOST=mysql, DB_USER=root, DB_PASSWORD=...
```

### Porta 3000 já está em uso
```bash
# Alterar em .env
PORT=3001
# Editar docker-compose.yml se necessário
```

### Ver logs em tempo real
```bash
docker-compose logs -f backend   # Backend
docker-compose logs -f mysql     # MySQL
docker-compose logs -f           # Tudo
```

### Resetar banco de dados
```bash
docker-compose down -v
docker-compose up -d
```

---

## Variáveis de Ambiente

Criar `.env` baseado em `.env.example`:

```env
# Banco de Dados
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=seu_usuario
DB_NAME=controlador_financeiro

# Aplicação
PORT=3000
NODE_ENV=development

# MySQL Docker
MYSQL_ROOT_PASSWORD=seu_usuario
MYSQL_DATABASE=controlador_financeiro
```

---

## Estrutura do Projeto Completa

```
controle-financeiro-backend/
├── backend/
│   ├── src/
│   │   ├── app.js                       # Express config
│   │   ├── index.js                     # Bootstrap
│   │   ├── modules/
│   │   │   └── transacoes/              # Módulo Transações
│   │   │       ├── controllers/
│   │   │       ├── services/
│   │   │       ├── repositories/
│   │   │       ├── routes/
│   │   │       ├── middlewares/
│   │   │       └── module.js
│   │   └── shared/
│   │       ├── database/
│   │       ├── middlewares/
│   │       ├── utils/
│   │       └── errors/
│   ├── Dockerfile
│   ├── package.json
│   └── .dockerignore
├── mysql-init/
│   └── 01-init.sql
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md                            # Este arquivo
└── LICENSE
```

---

## Contribuindo

### Setup para Desenvolvedores

```bash
# 1. Clone
git clone <repo>
cd backend
npm install

# 2. Configure .env
cp ../.env.example ../.env

# 3. Desenvolvimento
npm run dev

# 4. Sua branch
git checkout -b feat/sua-feature

# 5. Commit e push
git add .
git commit -m "feat(modulo): sua mensagem"
git push origin feat/sua-feature

# 6. Pull Request
```

### Boas Práticas
- Use **português** para variáveis e funções
- Sempre **validate** input
- Use **AppError** para erros customizados
- Teste **localmente** antes de push
- Não commite `.env` ou `node_modules`

---

## Status do Projeto

**Versão**: 1.1.0 | **Docker Hub**: `wjardim/controle-financeiro-backend:1.1.0`

### ✅ Implementado
- [x] CRUD transações
- [x] Filtros e paginação
- [x] Ordenação avançada
- [x] Resumos por período
- [x] Validação robusta
- [x] Tratamento centralizado de erros
- [x] CORS
- [x] Docker Compose
- [x] Documentação completa
- [x] **Arquitetura modular por domínio**
- [x] **Separação app.js/index.js**

### 🔮 Planejado
- [ ] Autenticação JWT
- [ ] Testes automatizados
- [ ] Logging estruturado
- [ ] Módulos adicionais (alunos, profissionais, etc)

---

## Licença

ISC

---

## Contato

Desenvolvido com ❤️ usando Node.js, Express e MySQL

**Última atualização**: Março 2026  
**Versão do Documento**: 2.0  
**Arquitetura**: Modular por Domínio (v1.1.0)

Veja também: [DIAGNOSTICO_REFATORACAO.md](./DIAGNOSTICO_REFATORACAO.md) para detalhes da refatoração arquitetônica.
