/**
 * Hook para autenticação e permissões
 */

import { useAuthStore } from '@/stores/authStore';
import { useCallback } from 'react';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAccessToken,
    setLoading,
  } = useAuthStore();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
    },
    [login]
  );

  const handleRegister = useCallback(
    async (email: string, password: string, name: string, tenantId?: string) => {
      await register(email, password, name, tenantId);
    },
    [register]
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasPermission = (permission: string) => {
    // TODO: Implementar sistema de permissões quando necessário
    return isAuthenticated;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshAccessToken,
    setLoading,
    hasRole,
    hasPermission,
  };
}

