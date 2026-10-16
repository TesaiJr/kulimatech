// src/features/pragas/hooks/usePragas.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PragaDTO, CreatePragaDTO, UpdatePragaDTO } from '../types';
import { pragaService } from '../services/pragaService';

export function usePragas(initialCulturaId?: string) {
  const [pragas, setPragas] = useState<PragaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedCulturaId, setSelectedCulturaId] = useState<string>(initialCulturaId || 'TODOS');
  const [selectedSeveridade, setSelectedSeveridade] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadPragas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pragaService.getPragas({
        culturaId: selectedCulturaId,
        severidade: selectedSeveridade,
        search: searchQuery,
      });
      setPragas(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar catálogo de pragas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedCulturaId, selectedSeveridade, searchQuery]);

  useEffect(() => {
    loadPragas();
  }, [loadPragas]);

  const handleCreatePraga = async (data: CreatePragaDTO): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await pragaService.createPraga(data);
      await loadPragas();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar praga.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePraga = async (id: string, data: UpdatePragaDTO): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await pragaService.updatePraga(id, data);
      await loadPragas();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar praga.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePraga = async (id: string): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await pragaService.deletePraga(id);
      await loadPragas();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover praga.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Filtragem complementar no cliente
  const filteredPragas = useMemo(() => {
    if (!searchQuery.trim()) return pragas;
    const q = searchQuery.toLowerCase();
    return pragas.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.nomeCientifico?.toLowerCase().includes(q) ||
        p.descricao.toLowerCase().includes(q) ||
        p.sintomas.toLowerCase().includes(q) ||
        p.metodosCombate.toLowerCase().includes(q) ||
        p.cultura?.nome.toLowerCase().includes(q)
    );
  }, [pragas, searchQuery]);

  return {
    pragas: filteredPragas,
    totalCount: pragas.length,
    loading,
    actionLoading,
    error,
    refresh: loadPragas,
    createPraga: handleCreatePraga,
    updatePraga: handleUpdatePraga,
    deletePraga: handleDeletePraga,
    // Filtros
    selectedCulturaId,
    setSelectedCulturaId,
    selectedSeveridade,
    setSelectedSeveridade,
    searchQuery,
    setSearchQuery,
  };
}
