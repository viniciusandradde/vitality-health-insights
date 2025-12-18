/**
 * Store Zustand para autenticação
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/api/endpoints/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, tenantId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
      },

      setRefreshToken: (refreshToken) => {
        set({ refreshToken });
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        } else {
          localStorage.removeItem('refresh_token');
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(email, password);
          
          // Decodificar token JWT para obter informações do usuário
          // TODO: Implementar decodificação JWT ou buscar usuário da API
          const user: User = {
            id: 'temp-id', // Será substituído quando buscar do backend
            email,
          };

          set({
            user,
            token: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, tenantId?: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({
            email,
            password,
            name,
            tenant_id: tenantId,
          });

          const user: User = {
            id: 'temp-id',
            email,
            name,
            tenantId,
          };

          set({
            user,
            token: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Error logging out:', error);
        } finally {
          set(initialState);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.refreshToken(refreshToken);
          set({
            token: response.access_token,
            refreshToken: response.refresh_token,
          });
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        } catch (error) {
          // Se refresh falhar, fazer logout
          get().logout();
          throw error;
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

