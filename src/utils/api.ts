/**
 * Cliente de requisições HTTP padronizado e seguro baseado na Fetch API nativa
 */

import { RequestOptions, ApiResponse } from '@/types/api';
import { STORAGE_KEYS, APP_CONFIG } from './constants';
import { localStore } from './storage';
import { AppError } from './error';

/**
 * Constrói string de parâmetros de consulta (query string)
 */
function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Cliente HTTP unificado
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, timeout = APP_CONFIG.API_TIMEOUT_MS, token, headers, ...customConfig } = options;

  const authToken = token || localStore.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method: customConfig.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    ...customConfig,
  };

  const url = `${endpoint}${buildQueryString(params)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        `Erro ${response.status}: ${response.statusText}`;

      throw new AppError(errorMessage, response.status, data?.errors);
    }

    return {
      success: true,
      data: data as T,
      statusCode: response.status,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new AppError('Tempo limite da requisição esgotado (timeout)', 408);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(error.message || 'Erro de rede ou conexão com o servidor', 500);
  }
}

/**
 * Atalhos semânticos para os principais métodos HTTP
 */
export const http = {
  get: <T = any>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: 'DELETE' }),
};
