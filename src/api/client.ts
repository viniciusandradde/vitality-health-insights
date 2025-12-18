/**
 * Cliente HTTP base para requisições à API
 * Configura interceptors, tratamento de erros e retry logic
 */

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout = 30000; // 30 segundos
  private defaultRetries = 3;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async retryRequest(
    url: string,
    config: RequestConfig,
    retries: number
  ): Promise<Response> {
    try {
      return await this.fetchWithTimeout(url, config);
    } catch (error) {
      if (retries > 0) {
        // Exponential backoff
        const delay = Math.pow(2, this.defaultRetries - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(url, config, retries - 1);
      }
      throw error;
    }
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const { retries = this.defaultRetries, ...fetchConfig } = config;

    const headers = {
      ...this.getAuthHeaders(),
      ...fetchConfig.headers,
    };

    try {
      const response = await this.retryRequest(
        url,
        {
          ...fetchConfig,
          headers,
        },
        retries
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      // Se a resposta estiver vazia, retornar objeto vazio
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        error
      );
    }
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Instância singleton do cliente
import { env } from '@/config/env';

export const apiClient = new ApiClient(env.apiBaseUrl);

