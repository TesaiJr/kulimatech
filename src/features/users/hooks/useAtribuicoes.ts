// src/features/users/hooks/useAtribuicoes.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CarteiraTecnicaItem, UserAdminDTO } from '../types';
import { userService } from '../services/userService';

export function useAtribuicoes() {
  const [tecnicos, setTecnicos] = useState<CarteiraTecnicaItem[]>([]);
  const [agricultoresPendentes, setAgricultoresPendentes] = useState<UserAdminDTO[]>([]);
  const [totalPendentes, setTotalPendentes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAtribuicoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAtribuicoes();
      setTecnicos(data.tecnicos);
      setAgricultoresPendentes(data.agricultoresPendentes);
      setTotalPendentes(data.totalPendentes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar carteiras técnicas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAtribuicoes();
  }, [loadAtribuicoes]);

  const handleAtribuir = async (tecnicoId: string, agricultorIds: string[]): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await userService.atribuirCarteira({ tecnicoId, agricultorIds });
      await loadAtribuicoes();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao vincular agricultores ao técnico.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemover = async (tecnicoId: string, agricultorId: string): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await userService.removerAtribuicao(tecnicoId, agricultorId);
      await loadAtribuicoes();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao remover agricultor da carteira técnica.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    tecnicos,
    agricultoresPendentes,
    totalPendentes,
    loading,
    actionLoading,
    error,
    loadAtribuicoes,
    atribuirCarteira: handleAtribuir,
    removerAtribuicao: handleRemover,
    clearError: () => setError(null),
  };
}
