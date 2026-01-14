// Roles do sistema conforme PRD/SAD
export type AppRole = 'master' | 'admin' | 'analyst' | 'viewer';

// Status do usuário
export type UserStatus = 'active' | 'pending' | 'disabled';

// Status de integração
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

// Status de assinatura
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

// Status de fatura
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

// Usuário do tenant
export interface TenantUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: AppRole;
  department?: string;
  phone?: string;
  last_login_at?: string;
  status: UserStatus;
  created_at: string;
}

// Configurações do tenant
export interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  timezone: string;
  language: string;
  modules_enabled: string[];
  max_users: number;
  data_retention_days: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  cnpj?: string;
  phone?: string;
  email?: string;
}

// Plano de assinatura
export interface Subscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  price_monthly: number;
  features: string[];
  usage: {
    users: { current: number; limit: number };
    api_calls: { current: number; limit: number };
    storage_gb: { current: number; limit: number };
  };
}

// Fatura
export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: InvoiceStatus;
  created_at: string;
  pdf_url?: string;
}

// Integração externa
export interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'wareline' | 'whatsapp' | 'email' | 'webhook' | 'api';
  status: IntegrationStatus;
  last_sync_at?: string;
  config?: Record<string, unknown>;
  icon: string;
}

// Módulo do sistema
export interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'assistencial' | 'gerencial';
  included_in_plans: string[];
  enabled: boolean;
  path: string;
}

// Log de auditoria
export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// Preferências de notificação
export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  whatsapp_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  alert_types: {
    critical: boolean;
    warning: boolean;
    info: boolean;
  };
  frequency: 'realtime' | 'hourly' | 'daily';
}

// Permissões por recurso
export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export interface RolePermissions {
  [resource: string]: Permission[];
}
