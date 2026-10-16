// src/features/culturas/hooks/useRecomendacoes.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { recomendacaoService } from '../services/recomendacaoService';
import {
  Recomendacao,
  RecomendacaoStats,
  StatusRecomendacao,
  CreateRecomendacaoInput,
} from '../types';

interface UseRecomendacoesOptions {
  initialParcelaId?: string;
}

export function useRecomendacoes(options: UseRecomendacoesOptions = {}) {
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<RecomendacaoStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [statusFiltro, setStatusFiltro] = useState<StatusRecomendacao | 'TODOS'>('TODOS');
  const [parcelaFiltro, setParcelaFiltro] = useState<string | undefined>(options.initialParcelaId);
  const [culturaFiltro, setCulturaFiltro] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lista, stats] = await Promise.all([
        recomendacaoService.getRecomendacoes({
          status: statusFiltro === 'TODOS' ? undefined : statusFiltro,
          parcelaId: parcelaFiltro || undefined,
          culturaId: culturaFiltro || undefined,
          search: searchQuery.trim() || undefined,
        }),
        recomendacaoService.getEstatisticas(parcelaFiltro),
      ]);
      setRecomendacoes(lista);
      setEstatisticas(stats);
    } catch (err: unknown) {
      console.error(err);
      setError('Falha ao carregar recomendações técnicas.');
    } finally {
      setLoading(false);
    }
  }, [statusFiltro, parcelaFiltro, culturaFiltro, searchQuery]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  /**
   * Marcar recomendação como APLICADA com atualização otimista
   */
  const marcarAplicada = async (id: string): Promise<void> => {
    // Atualização otimista
    setRecomendacoes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APLICADA' } : r))
    );
    if (estatisticas) {
      setEstatisticas({
        ...estatisticas,
        pendentes: Math.max(0, estatisticas.pendentes - 1),
        aplicadas: estatisticas.aplicadas + 1,
      });
    }

    try {
      await recomendacaoService.updateStatus(id, { status: 'APLICADA' });
    } catch (err) {
      console.error(err);
      // Reverter em caso de erro
      await fetchDados();
      throw err;
    }
  };

  /**
   * Arquivar recomendação
   */
  const arquivarRecomendacao = async (id: string): Promise<void> => {
    setRecomendacoes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'ARQUIVADA' } : r))
    );
    try {
      await recomendacaoService.updateStatus(id, { status: 'ARQUIVADA' });
      await fetchDados();
    } catch (err) {
      console.error(err);
      await fetchDados();
      throw err;
    }
  };

  /**
   * Emissão de nova recomendação
   */
  const emitirRecomendacao = async (data: CreateRecomendacaoInput): Promise<Recomendacao> => {
    const nova = await recomendacaoService.createRecomendacao(data);
    await fetchDados();
    return nova;
  };

  return {
    recomendacoes,
    estatisticas,
    loading,
    error,
    statusFiltro,
    setStatusFiltro,
    parcelaFiltro,
    setParcelaFiltro,
    culturaFiltro,
    setCulturaFiltro,
    searchQuery,
    setSearchQuery,
    refresh: fetchDados,
    marcarAplicada,
    arquivarRecomendacao,
    emitirRecomendacao,
  };
}
