# API de Gestão de Centro de Treinamento (CT) de Artes Marciais

Sistema backend modular para gerenciamento completo de um centro de treinamento de artes marciais, iniciando com módulo de gestão financeira e evoluindo progressivamente para suportar alunos, profissionais, turmas, agendamentos e muito mais.

**Status**: 🟢 **Funcional** | **Módulos Ativos**: Transações Financeiras | **Versão**: 1.1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Status do Projeto](#status-do-projeto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitetura](#arquitetura)
5. [Instalação e Setup](#instalação-e-setup)
6. [Uso com Docker](#uso-com-docker)
7. [API Endpoints](#api-endpoints)
8. [Desenvolvimento](#desenvolvimento)
9. [Roadmap](#roadmap)
10. [Contribuindo](#contribuindo)

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

### Escopo Futuro (Roadmap)

- 🗂️ **Módulo Autenticação**: Usuários e JWT
- 👥 **Módulo Alunos**: Cadastro, histórico de treinos
- 👨‍🏫 **Módulo Profissionais**: Instrutores, faixas, especialidades
- 📚 **Módulo Turmas**: Definição de turmas, horários
- 📅 **Módulo Agendamentos**: Sistema de aulas e presença
- 📊 **Módulo Avaliações**: Avaliações físicas, evolução
- 💳 **Módulo Matriculas**: Gestão de mensalidades e contratos

---

## Status do Projeto

| Componente | Status | Descrição |
|-----------|--------|-----------|
| **Transações** | ✅ Beta | CRUD completo, filtros, paginação, relatórios |
| **Arquitetura Modular** | ✅ Pronto | Nova estrutura em place, preparada para evolução |
| **Autenticação** | 🗓️ Roadmap | Planejado para v2.0 |
| **Alunos** | 🗓️ Roadmap | Planejado para v2.0 |
| **Profissionais** | 🗓️ Roadmap | Planejado para v2.1 |
| **Turmas** | 🗓️ Roadmap | Planejado para v2.1 |
| **Testes Unitários** | 🗓️ Roadmap | Planejado para v1.5 |
| **Logging Estruturado** | 🗓️ Roadmap | Planejado para v1.5 |

---

## Stack Tecnológico

### Backend

```
Node.js 20 LTS
├── Express 5.1.0      (Framework HTTP)
├── MySQL 8.0          (Banco de dados)
├── mysql2 3.20.0      (Driver MySQL promise-based)
└── nodemon 3.1.14     (Hot-reload desenvolvimento)
```

### Infraestrutura

```
Docker & Docker Compose
├── Backend (Node.js)
├── MySQL 8.0
└── Adminer (UI para DB)
```

### Desenvolvimento

```
npm                    (Gerenciador de pacotes)
Git                    (Versionamento)
```

---

## Arquitetura

### Estrutura de Pastas

```
backend/src/
│
├── app.js                                    ← Configuração Express
├── index.js                                  ← Bootstrap / Inicialização
│
├── modules/                                  ← Módulos de Domínio
│   │
│   └── transacoes/                           ← Módulo Transações
│       ├── controllers/
│       │   └── transacaoController.js        ← Orquestra requisições
│       ├── services/
│       │   └── transacaoService.js           ← Lógica de negócio
│       ├── repositories/
│       │   └── transacaoRepository.js        ← Acesso ao BD
│       ├── routes/
│       │   └── transacaoRoutes.js            ← Definição de rotas
│       ├── middlewares/
│       │   └── validarTransacao.js           ← Validação input
│       └── module.js                         ← Entry point do módulo
│
├── shared/                                   ← Código Compartilhado
│   │
│   ├── database/
│   │   └── connection.js                     ← Pool MySQL
│   │
│   ├── middlewares/
│   │   ├── errorHandler.js                   ← Tratamento global erros
│   │   └── corsConfig.js                     ← CORS middleware
│   │
│   ├── utils/
│   │   └── asyncHandler.js                   ← Wrapper async/await
│   │
│   └── errors/
│       └── AppError.js                       ← Classe erro padrão
│
└── (pastas dos módulos futuros aqui)
    ├── autenticacao/
    ├── alunos/
    ├── profissionais/
    ├── turmas/
    └── ...
```

### Padrão de Camadas (Por Módulo)

```
Request HTTP
     ↓
┌─────────────────────────────────┐
│  Routes (transacaoRoutes.js)    │  ← Define endpoints
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Middleware                     │  ← Valida input (validarTransacao.js)
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Controller                     │  ← Orquestra (transacaoController.js)
│  (asyncHandler wrapper)         │     Extrai params, chama service, formata resposta
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Service (Business Logic)       │  ← transacaoService.js
│  Validações, regras, cálculos   │     Implementa regras de negócio
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Repository (Data Access)       │  ← transacaoRepository.js
│  SQL puro, queries              │     Acesso ao BD
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Database (Shared)              │  ← connection.js
│  Pool MySQL                     │     Gerencia conexões
└─────────────────────────────────┘
```

### Benefícios da Arquitetura

| Aspecto | Benefício |
|---------|-----------|
| **Modular por Domínio** | Fácil adicionar novos módulos (alunos, turmas, etc) |
| **Separação de Responsabilidades** | Cada camada tem responsabilidade clara |
| **Testabilidade** | Camadas isoladas = fácil testar |
| **Reutilização** | Services podem ser usados em CLI, jobs, GraphQL |
| **Escalabilidade** | Estrutura pronta para crescimento |
| **Manutenibilidade** | Código organizado, fácil de entender |

---

## Instalação e Setup

### Pré-requisitos

- **Node.js**: v20 ou superior
- **MySQL**: v8.0 ou superior
- **npm**: v10 ou superior

### Instalação Local

#### 1. Clonar Repositório

```bash
git clone <seu-repositorio>
cd controle-financeiro-backend
```

#### 2. Instalar Dependências

```bash
cd backend
npm install
```

#### 3. Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto (copiar de `.env.example`):

```bash
cp ../.env.example ../.env
```

Editar `.env` com suas credenciais:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=controlador_financeiro

# Aplicação
PORT=3000
NODE_ENV=development
```

#### 4. Criar Banco de Dados MySQL

```bash
mysql -u root -p

CREATE DATABASE controlador_financeiro 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE controlador_financeiro;

-- Rodar arquivo SQL de inicialização
source mysql-init/01-init.sql;
```

#### 5. Rodar Aplicação

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Modo produção
npm start
```

App estará disponível em: `http://localhost:3000`

---

## Uso com Docker

### Pré-requisitos

- Docker
- Docker Compose

### Iniciar com Docker Compose

```bash
# Desenvolvimento (hot-reload habilitado)
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose up -d
```

### Serviços Disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Backend** | http://localhost:3000 | API Principal |
| **Adminer** | http://localhost:8080 | UI para MySQL |
| **MySQL** | localhost:3307 | Banco de dados (porta 3307 mapeada) |

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f backend

# Parar serviços
docker-compose down

# Remover volumes (limpa BD)
docker-compose down -v

# Rebuild imagem
docker-compose build --no-cache

# Executar comando em container
docker-compose exec backend npm run dev
```

### Acessar MySQL via Adminer

Abrir: `http://localhost:8080`

```
Servidor: mysql
Usuário: root
Senha: (valor de MYSQL_ROOT_PASSWORD)
Banco: controlador_financeiro
```

---

## ⚡ Quick Start

### 1️⃣ Requisitos
- Docker e Docker Compose instalados
- OU Node.js 16+ + MySQL 8.0+

### 2️⃣ Iniciar (Docker - Recomendado)
```bash
git clone <seu-repositorio>
cd controle-financeiro-backend
docker-compose up -d
```

### 3️⃣ Testar
```bash
curl http://localhost:3000/saude
# Resposta esperada:
# {"status":"ok","mensagem":"API do controlador financeiro está funcionando"}
```

### 4️⃣ Explorar
- **API**: http://localhost:3000
- **Dados**: http://localhost:8080 (Adminer)
- **Documentação**: Veja seção [📚 Documentação da API](#documentação-da-api)

---

## 🚀 Características

- ✅ CRUD completo de transações
- ✅ Suporte a filtros avançados (tipo, descrição)
- ✅ Paginação configurável
- ✅ Ordenação por múltiplos campos
- ✅ Resumos financeiros por período
- ✅ Relatórios mensais de receitas e despesas
- ✅ Validação robusta de dados
- ✅ Tratamento centralizado de erros
- ✅ Suporte CORS para conexão com frontend
- ✅ Containerização com Docker
- ✅ Dados de exemplo automaticamente inseridos
- ✅ Health checks integrados

---

## 📋 Pré-requisitos

- Node.js 16+ ou Docker
- MySQL 8.0+
- npm ou yarn

## 🔧 Instalação Local

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd controle-financeiro-backend
```

### 2. Configure variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 3. Instale dependências
```bash
cd backend
npm install
```

### 4. Inicie o servidor
```bash
npm run dev  # Modo desenvolvimento com nodemon
npm start    # Modo produção
```

Servidor estará disponível em `http://localhost:3000`

## 🐳 Instalação com Docker (Recomendado)

### 1. Configure o arquivo .env
```bash
cp .env.example .env
# Editar com suas credenciais (já preenchido)
```

### 2. Inicie os contêineres
```bash
docker-compose up -d
```
Este comando:
- ✅ Baixa imagem pré-compilada: `wjardim/controle-financeiro-backend:1.1.0`
- ✅ Inicia MySQL 8.0 com healthcheck
- ✅ Inicia Adminer para gerenciar o banco
- ✅ Cria tabela `transacoes` automaticamente
- ✅ Insere 10 transações de exemplo
- ✅ Configura CORS e health checks

### 3. Verifique o status
```bash
docker-compose ps
```

### 4. Veja os logs
```bash
docker-compose logs backend
```
Resultado esperado:
```
✓ Servidor iniciado na porta 3000
✓ Ambiente: development
✓ Acesse: http://localhost:3000
```

### Acesso aos serviços
| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API Backend** | http://localhost:3000 | API REST (confira em `/saude`) |
| **Adminer** | http://localhost:8080 | Gerenciador MySQL via web |
| **MySQL** | localhost:3307 | Host: mysql, User: root |

### Parar os serviços
```bash
docker-compose down
```

### Remover tudo (incluindo dados)
```bash
docker-compose down -v
```

### Usar build local (desenvolvimento)
Se quiser construir a imagem localmente:
```bash
# Editar docker-compose.yml e usar:
# backend:
#   build:
#     context: ./backend
#     dockerfile: Dockerfile

docker-compose up -d --build
```

## 📚 Documentação da API

### Health Check
```http
GET /saude
```
**Resposta (200)**:
```json
{
  "status": "ok",
  "mensagem": "API do controlador financeiro está funcionando",
  "timestamp": "2026-03-20T14:30:00.000Z"
}
```

### Raiz da API
```http
GET /
```
**Resposta (200)**:
```json
{
  "mensagem": "Bem-vindo à API de Controle Financeiro",
  "versao": "1.0.0",
  "endpoints": {
    "saude": "/saude",
    "transacoes": "/transacoes",
    "documentacao": "Veja o README.md para documentação completa"
  }
}
```

---

## 💰 Endpoints de Transações

Base URL: `/transacoes`

### 1. Listar Transações
```http
GET /transacoes?pagina=1&limite=10&ordenar=id&direcao=asc&tipo=receita&descricao=salário
```

**Parâmetros de Query**:
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `pagina` | number | 1 | Número da página |
| `limite` | number | 10 | Itens por página |
| `ordenar` | string | 'id' | Campo para ordenar: `id`, `tipo`, `descricao`, `valor`, `criado_em` |
| `direcao` | string | 'asc' | `asc` ou `desc` |
| `tipo` | string | - | Filtrar por: `receita` ou `despesa` |
| `descricao` | string | - | Filtrar por descrição (busca parcial) |

**Resposta (200)**:
```json
{
  "pagina": 1,
  "limite": 10,
  "total": 25,
  "totalPaginas": 3,
  "filtros": {
    "tipo": "receita",
    "descricao": "salário"
  },
  "ordenacao": {
    "campo": "id",
    "direcao": "asc"
  },
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

---

### 2. Buscar Transação por ID
```http
GET /transacoes/:id
```

**Exemplo**:
```http
GET /transacoes/1
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

**Possíveis Erros**:
```json
// 400 - ID inválido
{
  "erro": "ID deve ser um número válido e maior que zero"
}

// 404 - Não encontrado
{
  "erro": "Transação não encontrada"
}
```

---

### 3. Criar Transação
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
| Campo | Tipo | Validação |
|-------|------|-----------|
| `tipo` | string | Deve ser `receita` ou `despesa` |
| `descricao` | string | Não pode estar vazio |
| `valor` | number | Deve ser maior que zero |

**Resposta (201)**:
```json
{
  "mensagem": "Transação criada com sucesso",
  "id": 42
}
```

**Possíveis Erros**:
```json
// 400 - Validação falhou
{
  "erro": "Campos obrigatórios: tipo, descricao, valor"
}

// 400 - Tipo inválido
{
  "erro": "Tipo deve ser receita ou despesa"
}

// 400 - Valor inválido
{
  "erro": "Valor deve ser um número maior que zero"
}
```

---

### 4. Atualizar Transação
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

**Possíveis Erros**:
```json
// 400 - ID inválido
{
  "erro": "ID deve ser um número válido e maior que zero"
}

// 404 - Não encontrado
{
  "erro": "Transação não encontrada"
}

// 400 - Validação falhou
{
  "erro": "Campos obrigatórios: tipo, descricao, valor"
}
```

---

### 5. Deletar Transação
```http
DELETE /transacoes/:id
```

**Exemplo**:
```http
DELETE /transacoes/5
```

**Resposta (200)**:
```json
{
  "mensagem": "Transação deletada com sucesso"
}
```

**Possíveis Erros**:
```json
// 400 - ID inválido
{
  "erro": "ID deve ser um número válido e maior que zero"
}

// 404 - Não encontrado
{
  "erro": "Transação não encontrada"
}
```

---

### 6. Resumo de Transações
```http
GET /transacoes/resumo?mes=3&ano=2026
```

**Parâmetros de Query**:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `mes` | number | Condicional | 1-12 (omitir para resumo geral) |
| `ano` | number | Condicional | 2000+ (omitir para resumo geral) |

**Sem filtro (resumo geral)**:
```http
GET /transacoes/resumo
```
Retorna resumo de todas as transações cadastradas.

**Com filtro (período específico)**:
```http
GET /transacoes/resumo?mes=3&ano=2026
```

**Resposta (200)**:
```json
{
  "filtro": {
    "mes": 3,
    "ano": 2026
  },
  "totalRegistros": 15,
  "totalReceitas": 3500.00,
  "totalDespesas": 1200.50,
  "saldo": 2299.50
}
```

**Possíveis Erros**:
```json
// 400 - Mês sem ano
{
  "erro": "Informe mes e ano juntos"
}

// 400 - Mês inválido
{
  "erro": "Parâmetro mes deve ser um número inteiro entre 1 e 12"
}

// 400 - Ano inválido
{
  "erro": "Parâmetro ano deve estar entre 2000 e 2027"
}

// 200 - Nenhum registro
{
  "filtro": {
    "mes": 3,
    "ano": 2026
  },
  "mensagem": "Nenhum lançamento encontrado para o período informado",
  "totalRegistros": 0,
  "totalReceitas": 0,
  "totalDespesas": 0,
  "saldo": 0
}
```

---

### 7. Resumo Mensal (Ano Completo)
```http
GET /transacoes/resumo/mensal?ano=2026
```

**Parâmetros de Query**:
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `ano` | number | Sim | 2000+ |

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
  },
  {
    "ano": 2026,
    "mes": 3,
    "nomeMes": "Março",
    "totalReceitas": 0,
    "totalDespesas": 0,
    "saldo": 0
  }
  // ... mais 9 meses
]
```

**Possíveis Erros**:
```json
// 400 - Ano obrigatório
{
  "erro": "Parâmetro ano é obrigatório"
}

// 400 - Ano inválido
{
  "erro": "Parâmetro ano deve estar entre 2000 e 2027"
}
```

---

## 🧪 Testando a API com cURL / PowerShell

### Verificar saúde da API
```bash
# cURL
curl http://localhost:3000/saude

# PowerShell
(Invoke-WebRequest -Uri http://localhost:3000/saude -UseBasicParsing).Content
```

### Listar transações
```bash
# cURL - listar primeiras 10
curl "http://localhost:3000/transacoes"

# cURL - com filtros
curl "http://localhost:3000/transacoes?pagina=1&limite=5&tipo=receita&ordenar=valor&direcao=desc"

# PowerShell
(Invoke-WebRequest -Uri "http://localhost:3000/transacoes?limite=5" -UseBasicParsing).Content | ConvertFrom-Json
```

### Criar uma transação
```bash
# cURL
curl -X POST http://localhost:3000/transacoes \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "receita",
    "descricao": "Salário mensal",
    "valor": 3500.00
  }'

# PowerShell
$body = '{"tipo":"despesa","descricao":"Aluguel","valor":1500}'
Invoke-WebRequest -Uri http://localhost:3000/transacoes `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```

### Buscar transação por ID
```bash
# cURL
curl http://localhost:3000/transacoes/1

# PowerShell
(Invoke-WebRequest -Uri http://localhost:3000/transacoes/1 -UseBasicParsing).Content
```

### Atualizar transação
```bash
# cURL
curl -X PUT http://localhost:3000/transacoes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "receita",
    "descricao": "Salário (atualizado)",
    "valor": 3800.00
  }'

# PowerShell
$body = '{"tipo":"receita","descricao":"Salário (atualizado)","valor":3800}'
Invoke-WebRequest -Uri http://localhost:3000/transacoes/1 `
  -Method PUT `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```

### Deletar transação
```bash
# cURL
curl -X DELETE http://localhost:3000/transacoes/1

# PowerShell
Invoke-WebRequest -Uri http://localhost:3000/transacoes/1 -Method DELETE -UseBasicParsing
```

### Resumo do mês
```bash
# cURL
curl "http://localhost:3000/transacoes/resumo?mes=3&ano=2026"

# PowerShell
(Invoke-WebRequest -Uri "http://localhost:3000/transacoes/resumo?mes=3&ano=2026" -UseBasicParsing).Content | ConvertFrom-Json
```

### Resumo mensal do ano
```bash
# cURL
curl "http://localhost:3000/transacoes/resumo/mensal?ano=2026"

# PowerShell
(Invoke-WebRequest -Uri "http://localhost:3000/transacoes/resumo/mensal?ano=2026" -UseBasicParsing).Content | ConvertFrom-Json | Format-Table mes, nomeMes, totalReceitas, totalDespesas, saldo
```

---

## 📁 Estrutura do Projeto

```
controle-financeiro-backend/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Servidor Express principal
│   │   ├── database.js                 # Conexão com MySQL
│   │   ├── controllers/
│   │   │   └── transactionsController.js   # Lógica das transações
│   │   ├── middlewares/
│   │   │   └── validarTransacao.js        # Validação de entrada
│   │   └── routes/
│   │       └── transactionsRoutes.js      # Definição de rotas
│   ├── Dockerfile                      # Imagem Docker do backend
│   ├── package.json                    # Dependências Node.js
│   └── .dockerignore
├── mysql-init/
│   └── 01-init.sql                     # Script de inicialização MySQL
├── docker-compose.yml                  # Orquestração de containers
├── .env                                # Variáveis de ambiente (local)
├── .env.example                        # Template de variáveis
├── .gitignore
├── README.md                           # Este arquivo
└── LICENSE
```

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| Node.js | 20+ | Runtime JavaScript |
| Express | 5.x | Framework Web |
| MySQL | 8.0 | Banco de dados |
| MySQL2 | 3.x | Driver MySQL para Node |
| Docker | Latest | Containerização |
| Docker Hub | - | Registry de imagens |
| Nodemon | 3.x | Reload automático (dev) |

## 💾 Dependências Principais

```json
{
  "dependencies": {
    "express": "^5.1.0",
    "mysql2": "^3.20.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

## 🌍 Variáveis de Ambiente

Criar arquivo `.env` baseado em `.env.example`:

```env
# Banco de Dados
DB_HOST=mysql           # Host do MySQL (mysql em Docker)
DB_USER=root            # Usuário MySQL
DB_PASSWORD=seu_usuario # Senha (mude para produção)
DB_NAME=controlador_financeiro

# Aplicação
PORT=3000              # Porta do servidor
NODE_ENV=development   # Ambiente (development/production)

# MySQL Docker
MYSQL_ROOT_PASSWORD=seu_usuario
MYSQL_DATABASE=controlador_financeiro
```

---

## 🐛 Tratamento de Erros

A API retorna respostas estruturadas para erros:

```json
// 400 - Erro de validação
{
  "erro": "Descrição do erro"
}

// 404 - Recurso não encontrado
{
  "erro": "Transação não encontrada"
}

// 500 - Erro interno do servidor
{
  "status": "erro",
  "mensagem": "Erro interno do servidor",
  "detalhe": "Mensagem do erro (apenas em desenvolvimento)"
}
```

---

## � Deployment

### Build da imagem Docker
```bash
# Build com tag
docker build -t wjardim/controle-financeiro-backend:1.1.0 ./backend

# Build via compose (para desenvolvimento com código local)
docker-compose up -d --build
```

### Executar em produção
```bash
# 1. Usar imagem pré-compilada (recomendado)
# docker-compose.yml já aponta para: wjardim/controle-financeiro-backend:1.1.0

# 2. Configurar ambiente
NODE_ENV=production

# 3. Iniciar services
docker-compose up -d

# 4. Verificar status
docker-compose logs backend
docker-compose ps
```

### Publicar imagem Docker
```bash
# 1. Build da imagem
docker build -t wjardim/controle-financeiro-backend:1.2.0 ./backend

# 2. Tag adicional (latest)
docker tag wjardim/controle-financeiro-backend:1.2.0 wjardim/controle-financeiro-backend:latest

# 3. Push para Docker Hub
docker push wjardim/controle-financeiro-backend:1.2.0
docker push wjardim/controle-financeiro-backend:latest

# 4. Atualizar docker-compose.yml com nova versão
# image: wjardim/controle-financeiro-backend:1.2.0
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o repositório
2. **Crie uma branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. **Abra um Pull Request**

### Padrões de Código
- Use nomes em **português** para variáveis e funções
- Adicione comentários para lógica complexa
- Valide entrada de dados sempre
- Retorne respostas JSON estruturadas

---

## 📞 Suporte & Contribuições

### Reporte um Bug
- Abra uma **Issue** com descrição detalhada
- Inclua logs da API: `docker-compose logs backend`
- Informe seu ambiente (OS, Node version, Docker version)

### Solicite uma Feature
- Abra uma **Discussion** ou **Issue** com o rótulo `enhancement`
- Descreva a funcionalidade desejada
- Explique a motivação

### Dúvidas Gerais
- Consulte a documentação da API na seção [📚 Documentação da API](#documentação-da-api)
- Veja exemplos práticos em [🧪 Testando a API](#testando-a-api-com-curl--powershell)

---

## � Troubleshooting

### Problema: "Table 'controlador_financeiro.transacoes' doesn't exist"
**Solução**: Reiniciar os containers para executar o script de inicialização
```bash
docker-compose down -v
docker-compose up -d
```

### Problema: "Cannot GET /saude" (404)
**Solução**: Verifique se o container backend está rodando
```bash
docker-compose ps
docker-compose logs backend
```

### Problema: Conexão recusada em MySQL
**Solução**: Verifique as variáveis de ambiente no `.env`
```bash
# Confirmar que as variáveis estão corretas
cat .env
```

### Problema: Porta 3000 já está em uso
**Solução**: Altere a porta no `.env` e no `docker-compose.yml`
```env
PORT=3001  # ou outra porta disponível
```

### Ver logs em tempo real
```bash
# Logs do backend
docker-compose logs -f backend

# Logs do MySQL
docker-compose logs -f mysql

# Todos os logs
docker-compose logs -f
```

### Resetar banco de dados
```bash
# Remove containers e volumes
docker-compose down -v

# Reinicia tudo do zero
docker-compose up -d
```

---

## 📄 Licença

ISC

---

## ✅ Status do Projeto

**Versão atual**: 1.1.0 | **Tags**: `latest`, `1.1.0` no Docker Hub

### Funcionalidades Implementadas ✅
- [x] CRUD completo de transações
- [x] Filtros avançados (tipo, descrição)
- [x] Paginação configurável
- [x] Ordenação por múltiplos campos
- [x] Resumos de transações por período
- [x] Relatórios mensais (ano completo)
- [x] Validação robusta de dados
- [x] Validação de IDs (números válidos)
- [x] Tratamento centralizado de erros
- [x] CORS habilitado para frontend
- [x] Docker Compose completo
- [x] Script de inicialização MySQL automático
- [x] Dados de exemplo (10 transações)
- [x] Documentação completa da API
- [x] Código refatorado em português
- [x] Health checks integrados
- [x] **Imagem Docker publicada em Docker Hub** 🐳
- [x] Deployment em produção pronto

### Imagem Docker
```bash
# Imagem pré-compilada disponível em:
docker pull wjardim/controle-financeiro-backend:1.1.0

# Tags disponíveis:
# - wjardim/controle-financeiro-backend:1.1.0 (versão específica)
# - wjardim/controle-financeiro-backend:latest (mais recente)
```

### Recursos Planejados 🔮
- [x] Relatórios mensais (ano completo)
- [x] Validação robusta de dados
- [x] Validação de IDs (números válidos)
- [x] Tratamento centralizado de erros
- [x] CORS habilitado
- [x] Docker Compose completo
- [x] Script de inicialização MySQL
- [x] Dados de exemplo (10 transações)
- [x] Documentação completa da API
- [x] Código refatorado em português
- [x] Health checks

### Recursos Planejados 🔮
- [ ] Autenticação com JWT
- [ ] Testes automatizados (Jest)
- [ ] Categorias de transações
- [ ] Metas financeiras
- [ ] Gráficos e dashboards
- [ ] Frontend web (React/Vue)
- [ ] Aplicativo mobile

## 📚 Referências & Recursos

- [Express.js Documentation](https://expressjs.com)
- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/mysql-en/8.0/)
- [Docker Documentation](https://docs.docker.com)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📝 Sobre

Projeto desenvolvido como sistema de controle financeiro pessoal com arquitetura RESTful, Docker containerizado e documentação completa.

### Autor
**Walla Jardim** - 2026

### Redes Sociais
- GitHub: [seu-github]
- LinkedIn: [seu-linkedin]

---

## 📄 Licença

Este projeto está licenciado sob a Licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## ⭐ Mostre seu Apoio

Se este projeto foi útil para você:
- ⭐ Dê uma star neste repositório
- 🍴 Faça um fork
- 💬 Compartilhe feedback
- 🐛 Reporte bugs
- 📝 Contribua com melhorias

---

**Desenvolvido com ❤️ usando Node.js, Express e MySQL**

**Última atualização**: 21 de Março de 2026
