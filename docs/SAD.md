# Software Architecture Document (SAD)
## VSA Analytics Health - Arquitetura Técnica

---

## 1. Introdução

### 1.1 Propósito

Este documento descreve a arquitetura de software do VSA Analytics Health, uma plataforma SaaS multi-tenant de Business Intelligence Hospitalar. Serve como referência técnica para desenvolvimento, manutenção e evolução do sistema.

### 1.2 Escopo

O documento cobre:
- Arquitetura geral e padrões adotados
- Stack tecnológico
- Modelos de dados
- Integrações
- Segurança
- Infraestrutura
- DevOps

### 1.3 Definições e Acrônimos

| Termo | Significado |
|-------|-------------|
| SaaS | Software as a Service |
| RLS | Row Level Security |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| DTO | Data Transfer Object |
| CQRS | Command Query Responsibility Segregation |

---

## 2. Visão Arquitetural

### 2.1 Diagrama de Contexto (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Master  │  │  Admin   │  │ Analyst  │  │  Viewer  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │       VSA ANALYTICS HEALTH             │
        │                                        │
        │  ┌──────────────────────────────────┐  │
        │  │      Frontend (React/Vite)       │  │
        │  └──────────────────────────────────┘  │
        │                   │                    │
        │                   ▼                    │
        │  ┌──────────────────────────────────┐  │
        │  │   Backend (Supabase/Edge Func)   │  │
        │  └──────────────────────────────────┘  │
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Wareline    │  │    Stripe     │  │  Email/SMS    │
│   (Legado)    │  │  (Pagamentos) │  │  (Notific.)   │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 2.2 Diagrama de Container (C4 Level 2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           VSA ANALYTICS HEALTH                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (SPA)                                │   │
│  │                                                                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │   Pages    │  │ Components │  │   Hooks    │  │   Stores   │ │   │
│  │  │  (Routes)  │  │  (UI/UX)   │  │  (Logic)   │  │  (Zustand) │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │   │
│  │                                                                  │   │
│  │  React 18 + TypeScript + Vite + Tailwind + shadcn/ui            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    │ HTTPS/WSS                          │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SUPABASE (BaaS)                               │   │
│  │                                                                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │    Auth    │  │  Database  │  │   Storage  │  │  Realtime  │ │   │
│  │  │   (JWT)    │  │ (Postgres) │  │    (S3)    │  │    (WS)    │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │                   Edge Functions (Deno)                      │ │   │
│  │  │                                                              │ │   │
│  │  │  • wareline-sync    • stripe-webhooks    • send-alerts      │ │   │
│  │  │  • create-checkout  • portal-session     • reports-gen      │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Padrões Arquiteturais

| Padrão | Aplicação |
|--------|-----------|
| **SPA** | Frontend React single-page application |
| **BaaS** | Backend as a Service via Supabase |
| **Multi-Tenant** | Shared database com RLS |
| **RBAC** | Controle de acesso baseado em roles |
| **Event-Driven** | Realtime subscriptions e webhooks |
| **Serverless** | Edge Functions para lógica backend |

---

## 3. Stack Tecnológico

### 3.1 Frontend

```json
{
  "runtime": "Browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)",
  "framework": "React 18.3+",
  "build": "Vite 5.0+",
  "language": "TypeScript 5.3+",
  "routing": "React Router v6",
  "state": {
    "global": "Zustand 4.4+",
    "server": "TanStack Query 5.0+",
    "forms": "React Hook Form 7.49+"
  },
  "ui": {
    "components": "shadcn/ui (Radix primitives)",
    "styling": "Tailwind CSS 3.4+",
    "icons": "Lucide React",
    "animations": "Framer Motion 11.0+"
  },
  "charts": {
    "primary": "Recharts 2.10+",
    "secondary": "Apache ECharts (opcional)"
  },
  "validation": "Zod 3.22+",
  "dates": "date-fns 3.0+",
  "tables": "TanStack Table v8"
}
```

### 3.2 Backend (Supabase)

```json
{
  "database": {
    "engine": "PostgreSQL 15+",
    "extensions": ["uuid-ossp", "pgcrypto", "pg_stat_statements"],
    "features": ["RLS", "Triggers", "Functions", "Views"]
  },
  "auth": {
    "provider": "Supabase Auth",
    "methods": ["email/password", "magic_link", "oauth"],
    "jwt": "RS256, 1h expiry"
  },
  "storage": {
    "provider": "Supabase Storage (S3-compatible)",
    "buckets": ["avatars", "logos", "exports", "imports"]
  },
  "realtime": {
    "protocol": "WebSocket",
    "features": ["postgres_changes", "broadcast", "presence"]
  },
  "functions": {
    "runtime": "Deno",
    "triggers": ["HTTP", "Webhooks", "Scheduled"]
  }
}
```

### 3.3 Integrações Externas

| Serviço | Propósito | Protocolo |
|---------|-----------|-----------|
| Stripe | Pagamentos e subscriptions | REST + Webhooks |
| Resend | Transactional emails | REST API |
| Twilio | SMS e WhatsApp | REST API |
| Wareline | Dados hospitalares | PostgreSQL direto |
| Sentry | Error tracking | SDK |
| PostHog | Product analytics | SDK |

---

## 4. Modelo de Dados

### 4.1 Diagrama ER Principal

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     tenants     │       │     users       │       │   user_roles    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ name            │  │    │ tenant_id (FK)  │◄─┼────│ user_id (FK)    │
│ subdomain       │  │    │ email           │  │    │ role (enum)     │
│ custom_domain   │  │    │ full_name       │  │    │ created_at      │
│ logo_url        │  │    │ avatar_url      │  │    └─────────────────┘
│ primary_color   │  │    │ last_login_at   │  │
│ settings (JSON) │  │    │ created_at      │  │
│ status          │  │    └─────────────────┘  │
│ created_at      │  │                         │
└─────────────────┘  │                         │
         │           │                         │
         │           │    ┌─────────────────┐  │
         │           └───►│  subscriptions  │  │
         │                ├─────────────────┤  │
         │                │ id (PK)         │  │
         └───────────────►│ tenant_id (FK)  │  │
                          │ plan_id         │  │
                          │ status          │  │
                          │ stripe_*        │  │
                          │ current_period  │  │
                          └─────────────────┘  │
                                               │
┌─────────────────┐       ┌─────────────────┐  │
│   dashboards    │       │   audit_logs    │  │
├─────────────────┤       ├─────────────────┤  │
│ id (PK)         │       │ id (PK)         │  │
│ tenant_id (FK)  │       │ tenant_id (FK)  │  │
│ name            │       │ user_id (FK)    │◄─┘
│ module          │       │ action          │
│ config (JSON)   │       │ resource        │
│ created_by (FK) │       │ resource_id     │
│ created_at      │       │ changes (JSON)  │
└─────────────────┘       │ ip_address      │
                          │ created_at      │
                          └─────────────────┘
```

### 4.2 Schema de Tenants

```sql
-- Enum de status
CREATE TYPE tenant_status AS ENUM (
  'trial',      -- Período de teste
  'active',     -- Ativo e pagante
  'suspended',  -- Suspenso por falta de pagamento
  'cancelled'   -- Cancelado permanentemente
);

-- Tabela principal de tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(63) NOT NULL UNIQUE,
  custom_domain VARCHAR(255) UNIQUE,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3b82f6',
  
  -- Configurações JSON flexíveis
  settings JSONB NOT NULL DEFAULT '{
    "timezone": "America/Sao_Paulo",
    "language": "pt-BR",
    "modules_enabled": ["dashboard", "atendimento"],
    "max_users": 5,
    "data_retention_days": 365
  }',
  
  -- Configuração Wareline
  wareline_config JSONB, -- Criptografado: host, port, database, credentials
  
  status tenant_status NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);
```

### 4.3 Schema de Autenticação

```sql
-- Enum de roles (tabela separada por segurança!)
CREATE TYPE app_role AS ENUM (
  'master',   -- Dono do hospital (full access)
  'admin',    -- Gerente (quase tudo)
  'analyst',  -- Analista (read + export)
  'viewer'    -- Visualizador (read only)
);

-- Tabela de roles (NUNCA no profile!)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, role)
);

-- Profiles (dados públicos do usuário)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  department VARCHAR(100),
  
  -- Preferências
  preferences JSONB DEFAULT '{}',
  
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (SECURITY DEFINER!)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter tenant_id do usuário
CREATE OR REPLACE FUNCTION get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM profiles
  WHERE id = _user_id
$$;
```

### 4.4 Schema de Dados Operacionais

```sql
-- Atendimentos (sincronizado do Wareline)
CREATE TABLE atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- IDs externos
  external_id VARCHAR(50) NOT NULL, -- numatend do Wareline
  
  -- Dados do atendimento
  data DATE NOT NULL,
  hora TIME NOT NULL,
  paciente_id VARCHAR(50),
  paciente_nome VARCHAR(255),
  profissional_id VARCHAR(50),
  profissional_nome VARCHAR(255),
  especialidade_id VARCHAR(50),
  especialidade_nome VARCHAR(100),
  convenio_id VARCHAR(50),
  convenio_nome VARCHAR(100),
  
  tipo VARCHAR(50), -- ambulatorial, emergencia, internacao
  status VARCHAR(50), -- aguardando, atendimento, finalizado
  tempo_espera_minutos INTEGER,
  valor DECIMAL(15,2),
  
  -- Metadados
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, external_id)
);

-- RLS
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON atendimentos
  FOR ALL
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Índices para performance
CREATE INDEX idx_atendimentos_tenant_data ON atendimentos(tenant_id, data);
CREATE INDEX idx_atendimentos_tenant_status ON atendimentos(tenant_id, status);
CREATE INDEX idx_atendimentos_especialidade ON atendimentos(tenant_id, especialidade_id);
```

### 4.5 Schema de Alertas

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuração do alerta
  metric VARCHAR(100) NOT NULL, -- taxa_ocupacao_uti, tempo_espera_ps
  condition VARCHAR(20) NOT NULL, -- >, <, >=, <=, ==
  threshold DECIMAL(15,4) NOT NULL,
  
  -- Canais de notificação
  channels TEXT[] NOT NULL DEFAULT ARRAY['email'],
  recipients TEXT[] NOT NULL, -- emails, phones
  
  -- Controle
  active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  cooldown_minutes INTEGER DEFAULT 60, -- Evita spam
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de alertas disparados
CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  
  metric_value DECIMAL(15,4) NOT NULL,
  threshold DECIMAL(15,4) NOT NULL,
  channels_notified TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. Arquitetura de Segurança

### 5.1 Modelo de Autenticação

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUXO DE AUTENTICAÇÃO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Login Request                                               │
│     ┌──────────┐        ┌──────────┐        ┌──────────┐       │
│     │  Client  │──────► │ Supabase │──────► │ Postgres │       │
│     │  (SPA)   │        │   Auth   │        │  (auth)  │       │
│     └──────────┘        └──────────┘        └──────────┘       │
│                               │                                 │
│  2. JWT Generation            │                                 │
│     ┌─────────────────────────┴─────────────────────────┐      │
│     │  JWT Payload:                                      │      │
│     │  {                                                 │      │
│     │    "sub": "user-uuid",                            │      │
│     │    "email": "user@hospital.com",                  │      │
│     │    "role": "authenticated",                       │      │
│     │    "app_metadata": {                              │      │
│     │      "tenant_id": "tenant-uuid"                   │      │
│     │    },                                             │      │
│     │    "exp": 1234567890                              │      │
│     │  }                                                 │      │
│     └───────────────────────────────────────────────────┘      │
│                                                                 │
│  3. Request with JWT                                            │
│     ┌──────────┐        ┌──────────┐        ┌──────────┐       │
│     │  Client  │──JWT──►│ Supabase │──RLS──►│ Postgres │       │
│     │  (SPA)   │◄─data──│   API    │◄───────│  (data)  │       │
│     └──────────┘        └──────────┘        └──────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Row Level Security (RLS)

```sql
-- Template de política RLS para todas as tabelas

-- 1. Habilitar RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- 2. Política de leitura (SELECT)
CREATE POLICY "Users can only read their tenant data"
ON {table_name}
FOR SELECT
TO authenticated
USING (
  tenant_id = get_user_tenant_id(auth.uid())
);

-- 3. Política de escrita (INSERT)
CREATE POLICY "Users can only insert into their tenant"
ON {table_name}
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid())
);

-- 4. Política de atualização (UPDATE)
CREATE POLICY "Users can only update their tenant data"
ON {table_name}
FOR UPDATE
TO authenticated
USING (
  tenant_id = get_user_tenant_id(auth.uid())
)
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid())
);

-- 5. Política de deleção (DELETE) - apenas admins
CREATE POLICY "Only admins can delete"
ON {table_name}
FOR DELETE
TO authenticated
USING (
  tenant_id = get_user_tenant_id(auth.uid())
  AND has_role(auth.uid(), 'admin')
);
```

### 5.3 RBAC - Role-Based Access Control

```typescript
// Definição de permissões por role
const PERMISSIONS = {
  master: {
    dashboard: ['read', 'create', 'update', 'delete'],
    atendimentos: ['read', 'export'],
    faturamento: ['read', 'export'],
    usuarios: ['read', 'create', 'update', 'delete'],
    configuracoes: ['read', 'update'],
    billing: ['read', 'update'],
  },
  
  admin: {
    dashboard: ['read', 'create', 'update'],
    atendimentos: ['read', 'export'],
    faturamento: ['read', 'export'],
    usuarios: ['read', 'create', 'update'],
    configuracoes: ['read', 'update'],
    billing: ['read'],
  },
  
  analyst: {
    dashboard: ['read'],
    atendimentos: ['read', 'export'],
    faturamento: ['read', 'export'],
    usuarios: [],
    configuracoes: [],
    billing: [],
  },
  
  viewer: {
    dashboard: ['read'],
    atendimentos: ['read'],
    faturamento: ['read'],
    usuarios: [],
    configuracoes: [],
    billing: [],
  },
} as const;

// Hook de verificação no frontend
function usePermission(resource: string, action: string): boolean {
  const { user } = useAuth();
  const role = user?.role;
  
  if (!role) return false;
  
  const permissions = PERMISSIONS[role]?.[resource] || [];
  return permissions.includes(action);
}
```

### 5.4 Headers de Segurança

```typescript
// Configuração de headers (Edge Function ou middleware)
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com",
  ].join('; '),
};
```

---

## 6. Arquitetura de Integração

### 6.1 Integração Wareline

```
┌─────────────────────────────────────────────────────────────────┐
│                    SINCRONIZAÇÃO WARELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐      ┌────────────────┐     ┌────────────┐ │
│  │   Scheduler    │      │  Edge Function │     │  Wareline  │ │
│  │  (pg_cron)     │─────►│ wareline-sync  │────►│ PostgreSQL │ │
│  │  (15 min)      │      │                │     │            │ │
│  └────────────────┘      └────────────────┘     └────────────┘ │
│                                 │                      │        │
│                                 │ Transform            │ Query  │
│                                 ▼                      │        │
│                          ┌────────────────┐            │        │
│                          │   Data ETL     │◄───────────┘        │
│                          │                │                     │
│                          │ • Limpar       │                     │
│                          │ • Validar      │                     │
│                          │ • Enriquecer   │                     │
│                          └────────────────┘                     │
│                                 │                               │
│                                 │ Upsert                        │
│                                 ▼                               │
│                          ┌────────────────┐                     │
│                          │   Supabase     │                     │
│                          │   PostgreSQL   │                     │
│                          └────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Edge Function: wareline-sync

```typescript
// supabase/functions/wareline-sync/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

interface SyncRequest {
  tenant_id: string;
  module: 'atendimentos' | 'internacoes' | 'faturamento';
  since?: string; // ISO date
}

serve(async (req: Request) => {
  try {
    const { tenant_id, module, since } = await req.json() as SyncRequest;
    
    // 1. Obter configuração Wareline do tenant
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: tenant } = await supabase
      .from('tenants')
      .select('wareline_config')
      .eq('id', tenant_id)
      .single();
    
    if (!tenant?.wareline_config) {
      return new Response(
        JSON.stringify({ error: 'Wareline não configurado' }),
        { status: 400 }
      );
    }
    
    // 2. Conectar ao Wareline (descriptografar config)
    const warelinePool = new Pool({
      ...decryptConfig(tenant.wareline_config),
      tls: { enabled: true },
    }, 3);
    
    // 3. Executar sync baseado no módulo
    let syncedCount = 0;
    
    switch (module) {
      case 'atendimentos':
        syncedCount = await syncAtendimentos(
          warelinePool, 
          supabase, 
          tenant_id, 
          since
        );
        break;
      // ... outros módulos
    }
    
    // 4. Registrar sync no log
    await supabase.from('sync_logs').insert({
      tenant_id,
      module,
      records_synced: syncedCount,
      status: 'success',
    });
    
    return new Response(
      JSON.stringify({ success: true, synced: syncedCount }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Sync error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function syncAtendimentos(
  wareline: Pool,
  supabase: any,
  tenantId: string,
  since?: string
): Promise<number> {
  const client = await wareline.connect();
  
  try {
    const sinceDate = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    const result = await client.queryObject`
      SELECT 
        numatend as external_id,
        datatend as data,
        horatend as hora,
        codpac as paciente_id,
        nompac as paciente_nome,
        codprest as profissional_id,
        nomprest as profissional_nome,
        codesp as especialidade_id,
        nomesp as especialidade_nome,
        codconv as convenio_id,
        nomconv as convenio_nome,
        tipoatend as tipo,
        situacao as status,
        valor_total as valor
      FROM arqatend
      LEFT JOIN arqpac ON arqatend.codpac = arqpac.codigo
      LEFT JOIN arqprest ON arqatend.codprest = arqprest.codigo
      LEFT JOIN arqesp ON arqatend.codesp = arqesp.codigo
      LEFT JOIN arqconv ON arqatend.codconv = arqconv.codigo
      WHERE datatend >= ${sinceDate}
    `;
    
    if (result.rows.length === 0) return 0;
    
    // Transform para formato Supabase
    const records = result.rows.map((row: any) => ({
      tenant_id: tenantId,
      ...row,
      synced_at: new Date().toISOString(),
    }));
    
    // Upsert em batches de 1000
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await supabase
        .from('atendimentos')
        .upsert(batch, { onConflict: 'tenant_id,external_id' });
    }
    
    return records.length;
    
  } finally {
    client.release();
  }
}
```

### 6.3 Integração Stripe

```typescript
// supabase/functions/stripe-webhooks/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          stripe_subscription_id: session.subscription,
          current_period_start: new Date().toISOString(),
        })
        .eq('stripe_customer_id', session.customer);
      
      await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('stripe_customer_id', session.customer);
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id);
      
      await supabase
        .from('tenants')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id);
      
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Notificar cliente
      await sendPaymentFailedEmail(invoice.customer_email!);
      
      // Suspender após 3 tentativas
      if (invoice.attempt_count >= 3) {
        await supabase
          .from('tenants')
          .update({ status: 'suspended' })
          .eq('stripe_customer_id', invoice.customer);
      }
      
      break;
    }
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## 7. Arquitetura Frontend

### 7.1 Estrutura de Diretórios

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── AppSidebar.tsx
│   │   └── Header.tsx
│   ├── dashboard/             # Dashboard components
│   │   ├── KPICard.tsx
│   │   ├── ChartCard.tsx
│   │   ├── GaugeChart.tsx
│   │   └── Charts.tsx
│   ├── auth/                  # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── common/                # Shared components
│       ├── DataTable.tsx
│       ├── EmptyState.tsx
│       └── LoadingSkeleton.tsx
│
├── pages/                     # Route pages
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── modules/
│       ├── Atendimentos.tsx
│       ├── Internacao.tsx
│       └── Faturamento.tsx
│
├── hooks/                     # Custom hooks
│   ├── useAuth.ts
│   ├── useTenant.ts
│   ├── usePermission.ts
│   └── useKPIs.ts
│
├── stores/                    # Zustand stores
│   ├── authStore.ts
│   ├── sidebarStore.ts
│   └── filterStore.ts
│
├── lib/                       # Utilities
│   ├── supabase.ts
│   ├── utils.ts
│   └── constants.ts
│
├── types/                     # TypeScript types
│   ├── auth.ts
│   ├── tenant.ts
│   ├── navigation.ts
│   └── database.ts
│
├── config/                    # Configuration
│   ├── navigation.ts
│   └── permissions.ts
│
└── styles/                    # Global styles
    └── index.css
```

### 7.2 Padrão de Componentes

```typescript
// Padrão para componentes de página
// src/pages/modules/Atendimentos.tsx

import { useQuery } from '@tanstack/react-query';
import { useAtendimentos } from '@/hooks/useAtendimentos';
import { usePermission } from '@/hooks/usePermission';
import { KPICard, ChartCard } from '@/components/dashboard';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function AtendimentosPage() {
  // Hooks
  const canExport = usePermission('atendimentos', 'export');
  const { kpis, chartData, tableData, isLoading, filters, setFilters } = useAtendimentos();
  
  // Loading state
  if (isLoading) {
    return <AtendimentosSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Atendimentos</h1>
          <p className="text-muted-foreground">
            Análise em tempo real dos atendimentos
          </p>
        </div>
        
        {canExport && (
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        )}
      </div>
      
      {/* Filtros */}
      <FiltersBar filters={filters} onChange={setFilters} />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Atendimentos Hoje"
          value={kpis.atendimentosHoje}
          icon="Users"
          trend={kpis.tendenciaAtendimentos}
        />
        {/* ... mais KPIs */}
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Atendimentos por Hora"
          type="area"
          data={chartData.porHora}
        />
        <ChartCard
          title="Top Especialidades"
          type="bar"
          data={chartData.topEspecialidades}
        />
      </div>
      
      {/* Tabela */}
      <DataTable
        columns={columns}
        data={tableData}
        pagination
        search
      />
    </div>
  );
}
```

### 7.3 Gerenciamento de Estado

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  tenantId: string | null;
  role: 'master' | 'admin' | 'analyst' | 'viewer' | null;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      tenantId: null,
      role: null,
      isLoading: true,
      
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('tenant_id')
              .eq('id', session.user.id)
              .single();
            
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            
            set({
              user: session.user,
              session,
              tenantId: profile?.tenant_id,
              role: roleData?.role,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth init error:', error);
          set({ isLoading: false });
        }
      },
      
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        await get().initialize();
      },
      
      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          tenantId: null,
          role: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        tenantId: state.tenantId,
      }),
    }
  )
);
```

---

## 8. Performance e Otimização

### 8.1 Estratégias de Cache

```typescript
// React Query - Configuração global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutos
      gcTime: 30 * 60 * 1000,       // 30 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Caching agressivo para dados estáticos
const { data: especialidades } = useQuery({
  queryKey: ['especialidades', tenantId],
  queryFn: fetchEspecialidades,
  staleTime: Infinity, // Nunca refetch automático
  gcTime: 24 * 60 * 60 * 1000, // 24 horas
});

// Realtime para dados críticos
const { data: kpis } = useQuery({
  queryKey: ['kpis', 'dashboard', tenantId],
  queryFn: fetchDashboardKPIs,
  refetchInterval: 30 * 1000, // 30 segundos
});
```

### 8.2 Code Splitting

```typescript
// Lazy loading de páginas
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Atendimentos = lazy(() => import('@/pages/modules/Atendimentos'));
const Faturamento = lazy(() => import('@/pages/modules/Faturamento'));

// Routes com Suspense
<Routes>
  <Route
    path="/"
    element={
      <Suspense fallback={<PageSkeleton />}>
        <Dashboard />
      </Suspense>
    }
  />
</Routes>
```

### 8.3 Índices de Banco de Dados

```sql
-- Índices para queries frequentes

-- Atendimentos por data (mais comum)
CREATE INDEX CONCURRENTLY idx_atendimentos_tenant_data 
ON atendimentos(tenant_id, data DESC);

-- Filtro por status
CREATE INDEX CONCURRENTLY idx_atendimentos_status 
ON atendimentos(tenant_id, status) 
WHERE status IN ('aguardando', 'atendimento');

-- Agregações por especialidade
CREATE INDEX CONCURRENTLY idx_atendimentos_especialidade 
ON atendimentos(tenant_id, especialidade_id, data);

-- Full-text search em pacientes
CREATE INDEX CONCURRENTLY idx_atendimentos_paciente_nome 
ON atendimentos USING gin(to_tsvector('portuguese', paciente_nome));
```

### 8.4 Otimização de Queries

```sql
-- View materializada para KPIs do dashboard
CREATE MATERIALIZED VIEW mv_dashboard_kpis AS
SELECT 
  tenant_id,
  COUNT(*) FILTER (WHERE data = CURRENT_DATE) as atendimentos_hoje,
  AVG(tempo_espera_minutos) FILTER (WHERE data = CURRENT_DATE) as tempo_medio_espera,
  COUNT(*) FILTER (WHERE status = 'aguardando') as aguardando,
  SUM(valor) FILTER (WHERE data >= CURRENT_DATE - INTERVAL '30 days') as faturamento_30d
FROM atendimentos
GROUP BY tenant_id;

-- Refresh automático via pg_cron
SELECT cron.schedule(
  'refresh-dashboard-kpis',
  '*/5 * * * *', -- A cada 5 minutos
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_kpis'
);
```

---

## 9. Observabilidade

### 9.1 Logging

```typescript
// Estrutura de logs
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;
  tenant_id?: string;
  user_id?: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
}

// Logger centralizado
const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'frontend',
      message,
      context,
    }));
  },
  
  error: (error: Error, context?: Record<string, any>) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      service: 'frontend',
      message: error.message,
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    }));
    
    // Enviar para Sentry
    Sentry.captureException(error, { extra: context });
  },
};
```

### 9.2 Métricas

```typescript
// Métricas de performance
const metrics = {
  // Page load time
  pageLoad: (pageName: string, duration: number) => {
    posthog.capture('page_load', {
      page: pageName,
      duration_ms: duration,
    });
  },
  
  // API call time
  apiCall: (endpoint: string, duration: number, status: number) => {
    posthog.capture('api_call', {
      endpoint,
      duration_ms: duration,
      status_code: status,
    });
  },
  
  // User action
  userAction: (action: string, properties?: Record<string, any>) => {
    posthog.capture(action, properties);
  },
};
```

### 9.3 Alertas de Sistema

```typescript
// Configuração de alertas no Sentry
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 0.1,
  
  // Session replay para debugging
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  
  // Ignorar erros conhecidos
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
```

---

## 10. Deploy e Infraestrutura

### 10.1 Ambientes

| Ambiente | URL | Branch | Supabase |
|----------|-----|--------|----------|
| Development | localhost:5173 | feature/* | Local |
| Staging | staging.vsahealth.app | develop | staging project |
| Production | app.vsahealth.app | main | production project |

### 10.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Lovable Staging
        run: |
          # Deploy automático via Lovable

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Lovable Production
        run: |
          # Deploy automático via Lovable
```

### 10.3 Variáveis de Ambiente

```bash
# .env.example

# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (publishable key - pode estar no código)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx

# Analytics
VITE_POSTHOG_KEY=phc_xxxx
VITE_SENTRY_DSN=https://xxxx@sentry.io/xxxx

# Feature flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=true
```

---

## 11. Decisões Arquiteturais (ADRs)

### ADR-001: Multi-Tenancy com RLS

**Status**: Aceito  
**Contexto**: Precisamos isolar dados de múltiplos hospitais  
**Decisão**: Usar banco compartilhado com Row Level Security  
**Consequências**:
- ✅ Menor custo operacional
- ✅ Fácil manutenção e backups
- ✅ Escalabilidade horizontal
- ⚠️ Requer cuidado com policies RLS
- ⚠️ Queries precisam ser otimizadas

### ADR-002: Roles em Tabela Separada

**Status**: Aceito  
**Contexto**: RBAC para controle de acesso  
**Decisão**: Armazenar roles em tabela `user_roles`, NUNCA no profile  
**Consequências**:
- ✅ Previne privilege escalation
- ✅ Flexibilidade para múltiplos roles por usuário
- ✅ Auditoria de mudanças de role
- ⚠️ Join adicional nas queries

### ADR-003: Zustand para Estado Global

**Status**: Aceito  
**Contexto**: Gerenciamento de estado no frontend  
**Decisão**: Usar Zustand ao invés de Redux ou Context  
**Consequências**:
- ✅ API simples e intuitiva
- ✅ Bundle size pequeno (~1KB)
- ✅ Suporte a middleware (persist, devtools)
- ✅ Sem boilerplate

### ADR-004: React Query para Server State

**Status**: Aceito  
**Contexto**: Sincronização de dados do servidor  
**Decisão**: Usar TanStack Query para cache e fetching  
**Consequências**:
- ✅ Cache automático e inteligente
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ DevTools excelentes

### ADR-005: Edge Functions para Backend Logic

**Status**: Aceito  
**Contexto**: Lógica server-side (webhooks, integrações)  
**Decisão**: Usar Supabase Edge Functions (Deno)  
**Consequências**:
- ✅ Cold start rápido (~50ms)
- ✅ Deploy automático
- ✅ Integrado com Supabase
- ⚠️ Runtime Deno (diferente de Node)

---

## 12. Referências

### Documentação Oficial
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

### Padrões e Práticas
- [The Twelve-Factor App](https://12factor.net/)
- [OWASP Security Guidelines](https://owasp.org/)
- [LGPD Compliance](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

*Documento versionado. Última atualização: Janeiro 2026*  
*Versão: 1.0*
