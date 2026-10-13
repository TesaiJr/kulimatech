// src/features/culturas/hooks/useCulturas.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { culturaService } from '../services/culturaService';
import {
  CulturaListItem,
  Cultura,
  CreateCulturaInput,
  UpdateCulturaInput,
} from '../types';

export function useCulturas() {
  const [culturas, setCulturas] = useState<CulturaListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [humidadeFiltro, setHumidadeFiltro] = useState<number | undefined>(undefined);

  const fetchCulturas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await culturaService.getCulturas({
        search: searchQuery.trim() || undefined,
        humidadeIdeal: humidadeFiltro,
      });
      setCulturas(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Falha ao carregar catálogo de culturas.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, humidadeFiltro]);

  useEffect(() => {
    fetchCulturas();
  }, [fetchCulturas]);

  const criarCultura = async (data: CreateCulturaInput): Promise<Cultura> => {
    const nova = await culturaService.createCultura(data);
    await fetchCulturas();
    return nova;
  };

  const atualizarCultura = async (id: string, data: UpdateCulturaInput): Promise<Cultura> => {
    const atualizada = await culturaService.updateCultura(id, data);
    await fetchCulturas();
    return atualizada;
  };

  const eliminarCultura = async (id: string): Promise<void> => {
    await culturaService.deleteCultura(id);
    setCulturas((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    culturas,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    humidadeFiltro,
    setHumidadeFiltro,
    refresh: fetchCulturas,
    criarCultura,
    atualizarCultura,
    eliminarCultura,
  };
}
