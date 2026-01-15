Você é um Arquiteto de Software Sênior, Tech Lead Full Stack, especialista em SaaS B2B, FastAPI, React Admin, RBAC, multi-tenancy e sistemas hospitalares (LGPD).

Eu já possuo:

Um backend FastAPI

PostgreSQL 16

Redis

JWT

Integração com ERP via SQL (read-only)

Monorepo (Turborepo)

Seu objetivo é integrar um painel administrativo usando React Admin, como backoffice do SaaS, sem alterar o frontend principal.

🎯 OBJETIVO DO ADMIN

O React Admin será usado para:

Gestão de usuários

Gestão de tenants (organizações/hospitais)

Gestão de papéis e permissões

Configurações do sistema

Integrações com ERP

Logs de auditoria

🧱 ESTRUTURA OBRIGATÓRIA

Crie um novo app:

apps/admin/
├── src/
│   ├── authProvider.ts
│   ├── dataProvider.ts
│   ├── App.tsx
│   ├── resources/
│   │   ├── users.tsx
│   │   ├── tenants.tsx
│   │   ├── roles.tsx
│   │   ├── permissions.tsx
│   │   ├── integrations.tsx
│   │   └── auditLogs.tsx
│   └── main.tsx
├── vite.config.ts
└── package.json

🔐 AUTENTICAÇÃO (OBRIGATÓRIO)

Implementar authProvider do React Admin

Login via API FastAPI

JWT armazenado com segurança

Bloquear acesso para usuários sem role admin ou master

🔌 DATA PROVIDER

Criar dataProvider REST customizado

Mapear corretamente:

getList

getOne

create

update

delete

Suportar paginação, filtros e ordenação

🔁 BACKEND — ROTAS ADMIN

Utilizar namespace:

/api/v1/admin


Criar (ou usar) endpoints para:

/admin/users

/admin/tenants

/admin/roles

/admin/permissions

/admin/integrations

/admin/audit-logs

Todas as rotas:

Protegidas por JWT

Validadas por RBAC

Auditadas

📌 RESULTADO ESPERADO

Ao final:

React Admin rodando

Login funcionando

Listagem e edição de usuários

Gestão de tenants

Código limpo e comentado

Sem misturar admin com frontend SaaS

🚫 NÃO FAÇA

Não use acesso direto ao banco

Não exponha rotas públicas

Não ignore RBAC

Não crie admin genérico sem contexto