// src/features/auth/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { AuthUser, UserRole } from '../types';
import { LoginInput, RegisterInput } from '../schemas/authSchemas';
import { ApiError } from '@/lib/api/client';

export interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginInput, redirectPath?: string) => Promise<void>;
  register: (data: RegisterInput, redirectPath?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Hook de autenticação para gestão de estado e sessões no cliente
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar estado a partir do armazenamento local
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getStoredToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const getRedirectPathForRole = (role: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return '/dashboard';
      case 'TECNICO':
        return '/dashboard';
      case 'AGRICULTOR':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const login = useCallback(
    async (credentials: LoginInput, redirectPath?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.login(credentials);
        setUser(response.user);
        setToken(response.token);

        const targetUrl = redirectPath || getRedirectPathForRole(response.user.role);
        router.push(targetUrl);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Ocorreu uma falha inesperada durante a autenticação.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterInput, redirectPath?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.register(data);
        setUser(response.user);
        setToken(response.token);

        const targetUrl = redirectPath || getRedirectPathForRole(response.user.role);
        router.push(targetUrl);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Não foi possível concluir o registo. Tente novamente.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
