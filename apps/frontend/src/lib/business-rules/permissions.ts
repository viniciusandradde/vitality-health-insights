// Regras de permissão por módulo

import type { AppRole } from '@/types/settings';

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  manage?: boolean; // Para configurações avançadas
}

// Matriz de permissões por módulo e role
const MODULE_PERMISSIONS: Record<string, Record<AppRole, ModulePermission>> = {
  atendimentos: {
    master: { view: true, create: true, edit: true, delete: true, export: true, manage: true },
    admin: { view: true, create: true, edit: true, delete: true, export: true },
    analyst: { view: true, create: true, edit: true, delete: false, export: true },
    viewer: { view: true, create: false, edit: false, delete: false, export: false },
  },
  ambulatorio: {
    master: { view: true, create: true, edit: true, delete: true, export: true, manage: true },
    admin: { view: true, create: true, edit: true, delete: true, export: true },
    analyst: { view: true, create: true, edit: true, delete: false, export: true },
    viewer: { view: true, create: false, edit: false, delete: false, export: false },
  },
  internacao: {
    master: { view: true, create: true, edit: true, delete: true, export: true, manage: true },
    admin: { view: true, create: true, edit: true, delete: true, export: true },
    analyst: { view: true, create: true, edit: true, delete: false, export: true },
    viewer: { view: true, create: false, edit: false, delete: false, export: false },
  },
  financeiro: {
    master: { view: true, create: true, edit: true, delete: true, export: true, manage: true },
    admin: { view: true, create: true, edit: true, delete: false, export: true },
    analyst: { view: true, create: false, edit: false, delete: false, export: true },
    viewer: { view: true, create: false, edit: false, delete: false, export: false },
  },
  faturamento: {
    master: { view: true, create: true, edit: true, delete: true, export: true, manage: true },
    admin: { view: true, create: true, edit: true, delete: false, export: true },
    analyst: { view: true, create: false, edit: false, delete: false, export: true },
    viewer: { view: true, create: false, edit: false, delete: false, export: false },
  },
  estoque: {
    master: { view: true, create: true, edit: true, delete: true, export: true, manage: true },
    admin: { view: true, create: true, edit: true, delete: false, export: true },
    analyst: { view: true, create: false, edit: false, delete: false, export: true },
    viewer: { view: true, create: false, edit: false, delete: false, export: false },
  },
};

/**
 * Obtém permissões para um módulo específico
 */
export function getModulePermissions(
  module: string,
  role: AppRole
): ModulePermission {
  return MODULE_PERMISSIONS[module]?.[role] || {
    view: false,
    create: false,
    edit: false,
    delete: false,
    export: false,
  };
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasModulePermission(
  module: string,
  role: AppRole,
  permission: keyof ModulePermission
): boolean {
  const permissions = getModulePermissions(module, role);
  return permissions[permission] === true;
}

/**
 * Verifica se o usuário pode visualizar um módulo
 */
export function canViewModule(module: string, role: AppRole): boolean {
  return hasModulePermission(module, role, 'view');
}

/**
 * Verifica se o usuário pode exportar dados de um módulo
 */
export function canExportModule(module: string, role: AppRole): boolean {
  return hasModulePermission(module, role, 'export');
}
