// src/features/leituras/hooks/useLeituras.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LeituraSoloDTO,
  CreateLeituraDTO,
  ValidarLeituraDTO,
  LeituraEstatisticasDTO,
} from '../types';
import { leituraService } from '../services/leituraService';

export function useLeituras(initialParcelaId?: string) {
  const [leituras, setLeituras] = useState<LeituraSoloDTO[]>([]);
  const [estatisticas, setEstatisticas] = useState<LeituraEstatisticasDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedParcelaId, setSelectedParcelaId] = useState<string>(initialParcelaId || 'TODOS');
  const [selectedValidado, setSelectedValidado] = useState<'all' | 'true' | 'false'>('all');
  const [selectedStatusHumidade, setSelectedStatusHumidade] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lista, stats] = await Promise.all([
        leituraService.getLeituras({
          parcelaId: selectedParcelaId,
          validado: selectedValidado,
          statusHumidade: selectedStatusHumidade,
        }),
        leituraService.getEstatisticas(selectedParcelaId),
      ]);
      setLeituras(lista);
      setEstatisticas(stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar dados de leituras.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedParcelaId, selectedValidado, selectedStatusHumidade]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateLeitura = async (data: CreateLeituraDTO): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await leituraService.createLeitura(data);
      await loadData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao registar leitura.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidarLeitura = async (
    id: string,
    validado: boolean,
    observacoesTecnicas?: string
  ): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      const dto: ValidarLeituraDTO = {
        validado,
        observacoesTecnicas: observacoesTecnicas || null,
      };
      await leituraService.validarLeitura(id, dto);
      await loadData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao validar leitura.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Filtragem no cliente por texto de busca
  const filteredLeituras = useMemo(() => {
    if (!searchQuery.trim()) return leituras;
    const q = searchQuery.toLowerCase();
    return leituras.filter((l) => {
      const nomeParcela = l.parcela?.nome?.toLowerCase() || '';
      const nomeAgricultor = l.parcela?.agricultor?.nome?.toLowerCase() || '';
      const obs = l.observacoes?.toLowerCase() || '';
      const obsTec = l.observacoesTecnicas?.toLowerCase() || '';
      return (
        nomeParcela.includes(q) ||
        nomeAgricultor.includes(q) ||
        obs.includes(q) ||
        obsTec.includes(q)
      );
    });
  }, [leituras, searchQuery]);

  return {
    leituras: filteredLeituras,
    totalCount: leituras.length,
    estatisticas,
    loading,
    actionLoading,
    error,
    refresh: loadData,
    createLeitura: handleCreateLeitura,
    validarLeitura: handleValidarLeitura,
    // Filtros
    selectedParcelaId,
    setSelectedParcelaId,
    selectedValidado,
    setSelectedValidado,
    selectedStatusHumidade,
    setSelectedStatusHumidade,
    searchQuery,
    setSearchQuery,
  };
}
