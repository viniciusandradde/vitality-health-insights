/**
 * Endpoints de autenticação
 */

import { apiClient } from '../client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  tenant_id?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authApi = {
  /**
   * Login de usuário
   */
  async login(email: string, password: string): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/v1/auth/login', {
      email,
      password,
    });
  },

  /**
   * Registro de novo usuário
   */
  async register(data: RegisterRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/v1/auth/register', data);
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
  },

  /**
   * Logout de usuário
   */
  async logout(): Promise<void> {
    return apiClient.post('/api/v1/auth/logout');
  },
};

