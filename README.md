# VSA Analytics Health - Monorepo

Plataforma SaaS multi-tenant de Business Intelligence para hospitais.

## Estrutura do Projeto

```
vsa-analytics-health/
├── apps/
│   ├── frontend/          # React + Vite + TypeScript
│   └── backend/           # FastAPI + PostgreSQL
├── packages/
│   └── shared/            # Tipos compartilhados
├── docker/                # Docker Compose
└── scripts/               # Scripts utilitários
```

## Status da Implementação

### ✅ Concluído

1. **Estrutura Monorepo**
   - pnpm-workspace configurado
   - Frontend movido para `apps/frontend`
   - Backend criado em `apps/backend`
   - Package shared criado

2. **Docker**
   - PostgreSQL 16 configurado
   - Redis configurado
   - Docker Compose para desenvolvimento e produção

3. **Backend Core**
   - FastAPI configurado
   - SQLAlchemy com async
   - JWT authentication
   - Redis cache
   - Middleware de tenant
   - Configurações centralizadas

4. **Modelos de Banco**
   - Tenant, User, Role
   - Subscription, Plan, Invoice
   - AuditLog
   - Atendimento, Internacao, Leito (assistencial)
   - Estrutura para modelos gerenciais

5. **Migrations**
   - Alembic configurado
   - Estrutura de migrations pronta

6. **Autenticação**
   - Login, Register
   - Refresh token
   - Forgot/Reset password
   - Verify email
   - Get current user
   - Logout

### 🚧 Em Progresso / Pendente

- Rotas Admin SaaS (tenants, users, plans, billing, audit)
- Rotas Dashboard (KPIs, gráficos)
- Rotas Assistencial (12 módulos)
- Rotas Gerencial (7 módulos)
- Rotas Settings (configurações)
- Integração Frontend
- Testes e Documentação

## Como Usar

### Pré-requisitos

- Node.js 18+
- pnpm 10+
- Python 3.12+
- Docker & Docker Compose

### Instalação

```bash
# Instalar dependências
pnpm install

# Instalar dependências Python do backend
cd apps/backend
pip install -r requirements.txt
```

### Desenvolvimento

```bash
# Iniciar Docker (PostgreSQL + Redis)
pnpm docker:up

# Backend (porta 8000)
cd apps/backend
pnpm dev

# Frontend (porta 8080)
cd apps/frontend
pnpm dev
```

### Migrations

```bash
cd apps/backend

# Criar nova migration
pnpm migrate:create "descricao"

# Aplicar migrations
pnpm migrate
```

## Estrutura de API

### Autenticação

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/forgot-password` - Solicitar reset
- `POST /api/v1/auth/reset-password` - Resetar senha
- `POST /api/v1/auth/verify-email` - Verificar email
- `GET /api/v1/auth/me` - Usuário atual
- `POST /api/v1/auth/logout` - Logout

## Próximos Passos

1. Implementar rotas Admin SaaS
2. Implementar rotas Dashboard
3. Implementar rotas Assistencial
4. Implementar rotas Gerencial
5. Implementar rotas Settings
6. Integrar frontend com backend
7. Adicionar testes
8. Documentação OpenAPI

## Tecnologias

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis
- **DevOps**: Docker, Docker Compose
