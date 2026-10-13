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

let isHandlingUnauthorized = false;

function handleUnauthorizedSession(message: string) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('kulimatech_token');
    localStorage.removeItem('kulimatech_user');
    document.cookie = 'token=; Max-Age=0; path=/;';
  } catch {
    // Ignora restrições locais de storage
  }

  // Notifica ouvintes na aplicação sobre o encerramento da sessão
  window.dispatchEvent(
    new CustomEvent('kulimatech:session_expired', {
      detail: { message },
    })
  );

  const pathname = window.location.pathname;
  const isAuthRoute =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/registo') ||
    pathname.startsWith('/recuperar-senha');

  // Redireciona com segurança apenas se estiver em rota autenticada
  if (!isAuthRoute && !isHandlingUnauthorized) {
    isHandlingUnauthorized = true;
    setTimeout(() => {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth?mode=login&sessionExpired=true&returnUrl=${returnUrl}`;
    }, 200);
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

  // Trata resposta 204 No Content
  if (response.status === 204) {
    return null as unknown as T;
  }

  // Lê o corpo da resposta de forma segura para inspecionar JSON ou erros em texto/HTML
  const rawText = await response.text();
  let data: ApiResponse<T> | null = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      // Corpo não é JSON (ex.: página de erro HTML 500/404 do Next.js ou texto plano)
    }
  }

  // Se o servidor retornou status de erro HTTP (!response.ok)
  if (!response.ok) {
    const errorData = data && !data.success ? (data as ApiErrorResponse).error : null;
    const errorMessage =
      errorData?.message ||
      (rawText && !rawText.trim().startsWith('<') ? rawText.slice(0, 300) : null) ||
      `Erro no servidor (${response.status}: ${response.statusText || 'Falha na requisição'}).`;

    const errorCode = errorData?.code || `HTTP_${response.status}`;

    // Trata sessão expirada ou token inválido (401)
    if (response.status === 401 || errorCode === 'UNAUTHORIZED') {
      handleUnauthorizedSession(errorMessage);
    }

    throw new ApiError(errorMessage, errorCode, response.status, errorData?.details);
  }

  // Se status HTTP foi sucesso (2xx) mas o corpo não é JSON válido
  if (!data) {
    throw new ApiError(
      `Resposta inválida do servidor em ${endpoint} (esperado JSON).`,
      'NETWORK_OR_PARSE_ERROR',
      response.status
    );
  }

  // Se a API retornou payload padronizado com success === false
  if (!data.success) {
    const errorData = (data as ApiErrorResponse).error || {
      code: 'API_ERROR',
      message: 'Erro inesperado retornado pela API.',
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
