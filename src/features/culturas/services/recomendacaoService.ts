// src/features/culturas/services/recomendacaoService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  Recomendacao,
  CreateRecomendacaoInput,
  UpdateStatusRecomendacaoInput,
  GetRecomendacoesFilters,
} from '../types';

class RecomendacaoService {
  /**
   * Obtém a lista de recomendações técnicas com isolamento por RBAC
   */
  public async getRecomendacoes(filters: GetRecomendacoesFilters = {}): Promise<Recomendacao[]> {
    const params: Record<string, string | undefined> = {};
    if (filters.parcelaId) params.parcelaId = filters.parcelaId;
    if (filters.status) params.status = filters.status;
    if (filters.culturaId) params.culturaId = filters.culturaId;

    try {
      return await api.get<Recomendacao[]>('/api/recomendacoes', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter lista de recomendações técnicas.', 'GET_RECOMENDACOES_ERROR');
    }
  }

  /**
   * Obtém os detalhes de uma recomendação específica por ID
   */
  public async getRecomendacaoById(id: string): Promise<Recomendacao | null> {
    try {
      return await api.get<Recomendacao>(`/api/recomendacoes/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Falha ao obter recomendação ${id}.`, 'GET_RECOMENDACAO_ERROR');
    }
  }

  /**
   * Emite uma nova recomendação técnica para uma parcela (Técnico / Admin)
   */
  public async createRecomendacao(data: CreateRecomendacaoInput): Promise<Recomendacao> {
    try {
      return await api.post<Recomendacao>('/api/recomendacoes', data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao emitir recomendação técnica.', 'CREATE_RECOMENDACAO_ERROR');
    }
  }

  /**
   * Atualiza o estado da recomendação (ex: agricultor marca como APLICADA)
   */
  public async updateStatus(id: string, data: UpdateStatusRecomendacaoInput): Promise<Recomendacao> {
    try {
      return await api.patch<Recomendacao>(`/api/recomendacoes/${id}`, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao atualizar status da recomendação técnica.', 'UPDATE_RECOMENDACAO_STATUS_ERROR');
    }
  }
}

export const recomendacaoService = new RecomendacaoService();
