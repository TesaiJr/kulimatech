// src/features/pragas/hooks/useOcorrencias.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  OcorrenciaPragaDTO,
  CreateOcorrenciaDTO,
  ResolverOcorrenciaDTO,
  OcorrenciaEstatisticasDTO,
} from '../types';
import { ocorrenciaService } from '../services/ocorrenciaService';

export function useOcorrencias(initialParcelaId?: string) {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaPragaDTO[]>([]);
  const [estatisticas, setEstatisticas] = useState<OcorrenciaEstatisticasDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [selectedSeveridade, setSelectedSeveridade] = useState<string>('TODOS');
  const [selectedParcelaId, setSelectedParcelaId] = useState<string>(initialParcelaId || 'TODOS');
  const [selectedPragaId, setSelectedPragaId] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lista, stats] = await Promise.all([
        ocorrenciaService.getOcorrencias({
          status: selectedStatus,
          severidade: selectedSeveridade,
          parcelaId: selectedParcelaId,
          pragaId: selectedPragaId,
          search: searchQuery,
        }),
        ocorrenciaService.getEstatisticas(selectedParcelaId),
      ]);
      setOcorrencias(lista);
      setEstatisticas(stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar ocorrências fitossanitárias.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedSeveridade, selectedParcelaId, selectedPragaId, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOcorrencia = async (data: CreateOcorrenciaDTO): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await ocorrenciaService.createOcorrencia(data);
      await loadData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao submeter reporte de ocorrência.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolverOcorrencia = async (
    id: string,
    data: ResolverOcorrenciaDTO
  ): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await ocorrenciaService.resolverOcorrencia(id, data);
      await loadData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar parecer técnico.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Filtragem complementar no cliente
  const filteredOcorrencias = useMemo(() => {
    if (!searchQuery.trim()) return ocorrencias;
    const q = searchQuery.toLowerCase();
    return ocorrencias.filter(
      (o) =>
        o.parcela?.nome?.toLowerCase().includes(q) ||
        o.praga?.nome?.toLowerCase().includes(q) ||
        o.agricultor?.nome?.toLowerCase().includes(q) ||
        o.descricao.toLowerCase().includes(q) ||
        o.parecerTecnico?.toLowerCase().includes(q) ||
        o.acaoRecomendada?.toLowerCase().includes(q)
    );
  }, [ocorrencias, searchQuery]);

  return {
    ocorrencias: filteredOcorrencias,
    totalCount: ocorrencias.length,
    estatisticas,
    loading,
    actionLoading,
    error,
    refresh: loadData,
    createOcorrencia: handleCreateOcorrencia,
    resolverOcorrencia: handleResolverOcorrencia,
    // Filtros
    selectedStatus,
    setSelectedStatus,
    selectedSeveridade,
    setSelectedSeveridade,
    selectedParcelaId,
    setSelectedParcelaId,
    selectedPragaId,
    setSelectedPragaId,
    searchQuery,
    setSearchQuery,
  };
}
