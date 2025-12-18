/**
 * Configuração de variáveis de ambiente
 * Valida e exporta variáveis de ambiente tipadas
 */

interface EnvConfig {
  apiBaseUrl: string;
  wsUrl: string;
  appEnv: 'development' | 'production' | 'staging';
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

export const env: EnvConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8004'),
  wsUrl: getEnvVar('VITE_WS_URL', 'ws://localhost:8004/ws'),
  appEnv: (getEnvVar('VITE_APP_ENV', 'development') as EnvConfig['appEnv']) || 'development',
};

export const isDevelopment = env.appEnv === 'development';
export const isProduction = env.appEnv === 'production';

