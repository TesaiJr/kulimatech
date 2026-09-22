// src/features/culturas/services/culturaService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  Cultura,
  CulturaListItem,
  CreateCulturaInput,
  UpdateCulturaInput,
  GetCulturasFilters,
} from '../types';

class CulturaService {
  /**
   * Obtém a lista de culturas do catálogo com suporte a filtros de texto e humidade
   */
  public async getCulturas(filters: GetCulturasFilters = {}): Promise<CulturaListItem[]> {
    const params: Record<string, string | number | undefined> = {};
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.humidadeIdeal !== undefined) params.humidade = filters.humidadeIdeal;

    try {
      return await api.get<CulturaListItem[]>('/api/culturas', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter lista de culturas da API.', 'GET_CULTURAS_ERROR');
    }
  }

  /**
   * Obtém os detalhes completos de uma cultura pelo ID
   */
  public async getCulturaById(id: string): Promise<Cultura | null> {
    try {
      return await api.get<Cultura>(`/api/culturas/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Falha ao obter cultura ${id}.`, 'GET_CULTURA_ERROR');
    }
  }

  /**
   * Cria uma nova cultura no catálogo (permissão ADMIN)
   */
  public async createCultura(data: CreateCulturaInput): Promise<Cultura> {
    try {
      return await api.post<Cultura>('/api/culturas', data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao cadastrar cultura no catálogo.', 'CREATE_CULTURA_ERROR');
    }
  }

  /**
   * Atualiza dados de uma cultura existente (permissão ADMIN)
   */
  public async updateCultura(id: string, data: UpdateCulturaInput): Promise<Cultura> {
    try {
      return await api.put<Cultura>(`/api/culturas/${id}`, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao atualizar dados da cultura.', 'UPDATE_CULTURA_ERROR');
    }
  }

  /**
   * Remove uma cultura do catálogo (permissão ADMIN)
   */
  public async deleteCultura(id: string): Promise<{ message: string }> {
    try {
      return await api.delete<{ message: string }>(`/api/culturas/${id}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao eliminar cultura do catálogo.', 'DELETE_CULTURA_ERROR');
    }
  }
}

export const culturaService = new CulturaService();
