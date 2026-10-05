// src/lib/api/client.ts
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from './response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = 'BAD_REQUEST', status = 400, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Cliente HTTP unificado para chamadas à API do KulimaTech.
 * Trata o formato padronizado de ApiResponse<T> e gerencia headers comuns (JWT).
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Obter token do localStorage se disponível no browser
  let authToken: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      authToken = localStorage.getItem('kulimatech_token');
    } catch {
      // Ignora erro em ambientes com restrição de storage
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  const response = await fetch(url, {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      'Falha ao comunicar com o servidor. Resposta inválida.',
      'NETWORK_OR_PARSE_ERROR',
      response.status
    );
  }

  if (!response.ok || !data.success) {
    const errorData = (data as ApiErrorResponse).error || {
      code: 'HTTP_ERROR',
      message: response.statusText || 'Ocorreu um erro na requisição.',
    };

    throw new ApiError(
      errorData.message || 'Erro inesperado.',
      errorData.code || 'UNKNOWN_ERROR',
      response.status,
      errorData.details
    );
  }

  return (data as ApiSuccessResponse<T>).data;
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { method: 'GET', ...options }),

  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { method: 'DELETE', ...options }),
};
