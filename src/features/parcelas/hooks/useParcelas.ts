import { useState, useEffect, useMemo, useCallback } from 'react';
import { ParcelaListItem, TipoSolo } from '../types';
import { parcelaService } from '../services/parcelaService';

export type ViewMode = 'cards' | 'table';

export interface UseParcelasProps {
  userRole?: string;
  userId?: string;
}

export function useParcelas({ userRole = 'AGRICULTOR', userId = 'usr-farm-01' }: UseParcelasProps = {}) {
  const [parcelas, setParcelas] = useState<ParcelaListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSolo, setSelectedSolo] = useState<TipoSolo | 'TODOS'>('TODOS');
  const [selectedAgricultorId, setSelectedAgricultorId] = useState<string>('TODOS');

  // Modal de Exclusão
  const [deletingParcela, setDeletingParcela] = useState<ParcelaListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchParcelas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parcelaService.getParcelas(userRole, userId);
      setParcelas(data);
    } catch (err) {
      setError('Não foi possível carregar a lista de parcelas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  useEffect(() => {
    fetchParcelas();
  }, [fetchParcelas]);

  // Lista de Agricultores Únicos para Filtro do Técnico
  const agricultoresOptions = useMemo(() => {
    const map = new Map<string, string>();
    parcelas.forEach((p) => {
      if (p.agricultor) {
        map.set(p.agricultor.id, p.agricultor.nome);
      }
    });
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [parcelas]);

  // Parcelas Filtradas
  const filteredParcelas = useMemo(() => {
    return parcelas.filter((p) => {
      // Busca textual por nome ou localização
      const matchSearch =
        !searchQuery ||
        p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.localizacao && p.localizacao.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.agricultor && p.agricultor.nome.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtro por tipo de solo
      const matchSolo = selectedSolo === 'TODOS' || p.tipoSolo === selectedSolo;

      // Filtro por agricultor (para o Técnico)
      const matchAgricultor =
        selectedAgricultorId === 'TODOS' || p.agricultorId === selectedAgricultorId;

      return matchSearch && matchSolo && matchAgricultor;
    });
  }, [parcelas, searchQuery, selectedSolo, selectedAgricultorId]);

  const handleDeleteConfirm = async () => {
    if (!deletingParcela) return;
    setIsDeleting(true);
    try {
      const success = await parcelaService.deleteParcela(deletingParcela.id);
      if (success) {
        setParcelas((prev) => prev.filter((p) => p.id !== deletingParcela.id));
      } else {
        setError('Não foi possível eliminar a parcela.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar eliminar a parcela.');
    } finally {
      setIsDeleting(false);
      setDeletingParcela(null);
    }
  };

  return {
    parcelas: filteredParcelas,
    totalCount: parcelas.length,
    filteredCount: filteredParcelas.length,
    loading,
    error,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedSolo,
    setSelectedSolo,
    selectedAgricultorId,
    setSelectedAgricultorId,
    agricultoresOptions,
    deletingParcela,
    setDeletingParcela,
    isDeleting,
    handleDeleteConfirm,
    refresh: fetchParcelas,
  };
}
