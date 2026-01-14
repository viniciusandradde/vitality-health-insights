import { useMemo } from 'react';
import type { AppRole, Permission, RolePermissions } from '@/types/settings';

// Matriz de permissões por role
const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  master: {
    profile: ['view', 'edit'],
    organization: ['view', 'edit', 'manage'],
    team: ['view', 'create', 'edit', 'delete', 'manage'],
    modules: ['view', 'edit', 'manage'],
    integrations: ['view', 'create', 'edit', 'delete', 'manage'],
    notifications: ['view', 'edit'],
    security: ['view', 'manage'],
    billing: ['view', 'edit', 'manage'],
    audit: ['view'],
    dashboard: ['view'],
    assistencial: ['view', 'create', 'edit', 'delete'],
    gerencial: ['view', 'create', 'edit', 'delete'],
  },
  admin: {
    profile: ['view', 'edit'],
    organization: ['view', 'edit'],
    team: ['view', 'create', 'edit'],
    modules: ['view', 'edit'],
    integrations: ['view'],
    notifications: ['view', 'edit'],
    security: ['view'],
    billing: ['view'],
    audit: ['view'],
    dashboard: ['view'],
    assistencial: ['view', 'create', 'edit', 'delete'],
    gerencial: ['view', 'create', 'edit', 'delete'],
  },
  analyst: {
    profile: ['view', 'edit'],
    organization: ['view'],
    team: ['view'],
    modules: ['view'],
    integrations: [],
    notifications: ['view', 'edit'],
    security: [],
    billing: [],
    audit: [],
    dashboard: ['view'],
    assistencial: ['view', 'create', 'edit'],
    gerencial: ['view', 'create', 'edit'],
  },
  viewer: {
    profile: ['view', 'edit'],
    organization: ['view'],
    team: ['view'],
    modules: ['view'],
    integrations: [],
    notifications: ['view', 'edit'],
    security: [],
    billing: [],
    audit: [],
    dashboard: ['view'],
    assistencial: ['view'],
    gerencial: ['view'],
  },
};

// Mock do usuário atual - será substituído por autenticação real
const MOCK_CURRENT_USER = {
  id: '1',
  role: 'master' as AppRole,
  tenant_id: 'tenant-1',
};

export function useCurrentUser() {
  // TODO: Integrar com Supabase Auth
  return MOCK_CURRENT_USER;
}

export function useRole(): AppRole {
  const user = useCurrentUser();
  return user.role;
}

export function usePermissions() {
  const role = useRole();
  
  const permissions = useMemo(() => ROLE_PERMISSIONS[role], [role]);
  
  const hasPermission = (resource: string, action: Permission): boolean => {
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
  };
  
  const canView = (resource: string): boolean => hasPermission(resource, 'view');
  const canEdit = (resource: string): boolean => hasPermission(resource, 'edit');
  const canCreate = (resource: string): boolean => hasPermission(resource, 'create');
  const canDelete = (resource: string): boolean => hasPermission(resource, 'delete');
  const canManage = (resource: string): boolean => hasPermission(resource, 'manage');
  
  return {
    role,
    permissions,
    hasPermission,
    canView,
    canEdit,
    canCreate,
    canDelete,
    canManage,
  };
}

export function useCanManageUsers(): boolean {
  const { canManage, canCreate } = usePermissions();
  return canManage('team') || canCreate('team');
}

export function useCanManageSettings(): boolean {
  const { canManage, canEdit } = usePermissions();
  return canManage('organization') || canEdit('organization');
}

export function useCanManageBilling(): boolean {
  const { canManage } = usePermissions();
  return canManage('billing');
}

export function useCanManageIntegrations(): boolean {
  const { canManage } = usePermissions();
  return canManage('integrations');
}

export function useCanViewAudit(): boolean {
  const { canView } = usePermissions();
  return canView('audit');
}

// Helper para verificar se o role atual é superior ou igual a outro
export function isRoleAtLeast(currentRole: AppRole, requiredRole: AppRole): boolean {
  const roleHierarchy: AppRole[] = ['viewer', 'analyst', 'admin', 'master'];
  return roleHierarchy.indexOf(currentRole) >= roleHierarchy.indexOf(requiredRole);
}

// Labels para os roles
export const ROLE_LABELS: Record<AppRole, string> = {
  master: 'Master',
  admin: 'Administrador',
  analyst: 'Analista',
  viewer: 'Visualizador',
};

// Descrições para os roles
export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  master: 'Acesso total ao sistema, incluindo configurações de billing e integrações',
  admin: 'Gerencia usuários, módulos e configurações da organização',
  analyst: 'Acessa e edita dados dos módulos assistenciais e gerenciais',
  viewer: 'Visualiza dashboards e relatórios sem poder editar',
};
