// src/features/auth/services/authService.ts
import { api, ApiError } from '@/lib/api/client';
import { AuthResponseData, AuthUser, UserRole } from '@/features/auth/types';
import { LoginInput, RegisterInput } from '@/features/auth/schemas/authSchemas';

const TOKEN_KEY = 'imunda_token';
const USER_KEY = 'imunda_user';

export const DEMO_CREDENTIALS: Record<
  UserRole,
  { email: string; pass: string; label: string; roleDescription: string }
> = {
  ADMIN: {
    email: 'admin@imunda.gov.mz',
    pass: 'Admin@2026',
    label: 'Administrador do Sistema',
    roleDescription: 'Gestão de utilizadores e catálogos gerais',
  },
  TECNICO: {
    email: 'tecnico.nhamatanda@sdae.gov.mz',
    pass: 'Tecnico@2026',
    label: 'Técnico SDAE (Nhamatanda)',
    roleDescription: 'Acompanhamento agronómico e validações',
  },
  AGRICULTOR: {
    email: 'agricultor.lamego@imunda.mz',
    pass: 'Agri@2026',
    label: 'Agricultor Familiar (Lamego)',
    roleDescription: 'Gestão de parcelas e leituras de solo',
  },
};

export const authService = {
  /**
   * Realiza a autenticação de utilizador através da rota POST /api/auth/login
   */
  async login(credentials: LoginInput): Promise<AuthResponseData> {
    try {
      const response = await api.post<AuthResponseData>('/api/auth/login', credentials);
      authService.saveSession(response);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erro ao tentar iniciar sessão.', 'LOGIN_FAILED');
    }
  },

  /**
   * Cria uma nova conta (Agricultor ou Técnico) através da rota POST /api/auth/register
   */
  async register(data: RegisterInput): Promise<AuthResponseData> {
    try {
      const response = await api.post<AuthResponseData>('/api/auth/register', data);
      authService.saveSession(response);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erro ao tentar criar conta.', 'REGISTER_FAILED');
    }
  },

  /**
   * Encerra a sessão do utilizador e limpa os dados locais
   */
  async logout(): Promise<void> {
    authService.clearSession();
    // Limpar cookie pelo browser caso necessário
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; Max-Age=0; path=/;';
    }
  },

  /**
   * Salva a sessão ativa no localStorage
   */
  saveSession(sessionData: AuthResponseData): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TOKEN_KEY, sessionData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(sessionData.user));
    } catch (err) {
      console.error('Falha ao salvar sessão localmente:', err);
    }
  },

  /**
   * Recupera o token de sessão do utilizador
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Recupera os dados do utilizador atualmente autenticado
   */
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const userRaw = localStorage.getItem(USER_KEY);
      return userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  /**
   * Remove os dados da sessão do localStorage
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('Falha ao limpar sessão local:', err);
    }
  },

  /**
   * Verifica se existe um utilizador autenticado
   */
  isAuthenticated(): boolean {
    return Boolean(authService.getStoredToken() && authService.getStoredUser());
  },
};
