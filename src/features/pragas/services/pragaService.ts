// src/features/pragas/services/pragaService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  PragaDTO,
  CreatePragaDTO,
  UpdatePragaDTO,
  GetPragasFilters,
} from '../types';

class PragaService {
  /**
   * Obtém a lista de pragas do catálogo com suporte a filtros
   */
  public async getPragas(filters: GetPragasFilters = {}): Promise<PragaDTO[]> {
    const params: Record<string, string | undefined> = {};

    if (filters.culturaId && filters.culturaId !== 'TODOS') {
      params.culturaId = filters.culturaId;
    }

    if (filters.severidade && filters.severidade !== 'TODOS') {
      params.severidade = filters.severidade;
    }

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    try {
      return await api.get<PragaDTO[]>('/api/pragas', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter lista de pragas.', 'GET_PRAGAS_ERROR');
    }
  }

  /**
   * Obtém os detalhes de uma praga específica
   */
  public async getPragaById(id: string): Promise<PragaDTO> {
    try {
      return await api.get<PragaDTO>(`/api/pragas/${id}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter detalhes da praga.', 'GET_PRAGA_BY_ID_ERROR');
    }
  }

  /**
   * Cadastra nova praga no catálogo mestre (Administrador)
   */
  public async createPraga(data: CreatePragaDTO): Promise<PragaDTO> {
    try {
      return await api.post<PragaDTO>('/api/pragas', data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao criar praga.', 'CREATE_PRAGA_ERROR');
    }
  }

  /**
   * Atualiza uma praga existente (Administrador)
   */
  public async updatePraga(id: string, data: UpdatePragaDTO): Promise<PragaDTO> {
    try {
      return await api.put<PragaDTO>(`/api/pragas/${id}`, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao atualizar praga.', 'UPDATE_PRAGA_ERROR');
    }
  }

  /**
   * Remove uma praga do catálogo (Administrador)
   */
  public async deletePraga(id: string): Promise<void> {
    try {
      await api.delete(`/api/pragas/${id}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao remover praga.', 'DELETE_PRAGA_ERROR');
    }
  }
}

export const pragaService = new PragaService();
