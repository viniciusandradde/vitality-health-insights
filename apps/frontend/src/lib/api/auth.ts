/**
 * Servicos de autenticacao
 */
import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", payload);
  },
};
