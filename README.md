

# 🥋 API Gestão de CT - Backend

API REST para gestão de Centros de Treinamento (CTs) de artes marciais, com controle financeiro, autenticação JWT e arquitetura multi-tenant.

---

# 🚀 Status do Projeto

- ✅ Autenticação JWT
- ✅ Multi-tenant (account_id)
- ✅ Gestão de CTs (ativar/desativar)
- ✅ Controle financeiro (receitas e despesas)
- ✅ Filtros e relatórios
- ✅ Docker configurado

---

# 🧱 Arquitetura

- Node.js + Express
- MySQL 8
- Docker + Docker Compose
- Arquitetura modular:
  - auth
  - cts
  - transacoes

---

# 🔐 Autenticação

## 📌 Cadastro

**POST** `/auth/register`

```json
{
  "nomeResponsavel": "Wallace",
  "email": "wallace@email.com",
  "senha": "123456",
  "nomeAccount": "CT Wallace",
  "tipoAccount": "ct_owner",
  "nomeCtInicial": "CT Centro"
}
````

---

## 📌 Login

**POST** `/auth/login`

```json
{
  "email": "wallace@email.com",
  "senha": "123456"
}
```

### Resposta

```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "SEU_TOKEN_JWT"
}
```

---

## 🔑 Uso do Token

Todas as rotas protegidas exigem:

```
Authorization: Bearer SEU_TOKEN
```

---

# 🏋️ CTs

Base: `/cts`

## Criar CT

**POST** `/cts`

```json
{
  "nome": "CT Zona Norte"
}
```

---

## Listar CTs

**GET** `/cts`

---

## Buscar por ID

**GET** `/cts/:id`

---

## Atualizar CT

**PUT** `/cts/:id`

```json
{
  "nome": "Novo Nome",
  "ativo": true
}
```

---

## Desativar CT

**PATCH** `/cts/:id/desativar`

---

## Ativar CT *(se implementado)*

**PATCH** `/cts/:id/ativar`

---

# 💰 Transações

Base: `/transacoes`

## Criar

**POST** `/transacoes`

```json
{
  "tipo": "receita",
  "descricao": "Mensalidade",
  "valor": 150.00,
  "ct_id": 1
}
```

> `ct_id` é opcional

---

## Listar

**GET** `/transacoes`

### Filtros:

```
?tipo=receita
?descricao=mensal
?ct_id=1
?page=1
?limit=10
```

---

## Buscar por ID

**GET** `/transacoes/:id`

---

## Atualizar

**PUT** `/transacoes/:id`

---

## Deletar

**DELETE** `/transacoes/:id`

---

## 📊 Resumo

### Geral

**GET** `/transacoes/resumo`

### Mensal

**GET** `/transacoes/resumo/mensal`

---

# 🧠 Regras de Negócio

* Cada usuário pertence a uma `account`
* Todas as operações são isoladas por `account_id`
* CTs pertencem à account
* Transações pertencem à account
* `ct_id` é opcional
* CT pode ser desativado (soft delete)

---

# 🗄️ Banco de Dados

Principais tabelas:

* `accounts`
* `users`
* `account_users`
* `cts`
* `transacoes`

---

# 🐳 Docker

## Subir ambiente

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

---

## Parar

```bash
docker compose down
```

---

## Logs

```bash
docker compose -f docker-compose.dev.yml logs -f backend
```

---

# 🧪 Testes rápidos

```bash
curl http://localhost:3000/saude
```

```bash
curl http://localhost:3000/ping
```

---

# ⚠️ Erros comuns

| Código | Motivo                          |
| ------ | ------------------------------- |
| 400    | Validação de dados              |
| 401    | Token inválido ou ausente       |
| 403    | Usuário sem vínculo com account |
| 404    | Rota não encontrada             |

---

# 📈 Roadmap

* 👤 Gestão de usuários por account
* 🧑‍🎓 Cadastro de alunos
* 📅 Agenda de aulas
* 📊 Relatórios avançados
* 💳 Integração com pagamentos

---

# 👨‍💻 Autor

Wallace 🚀

````

