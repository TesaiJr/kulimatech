// src/features/parcelas/services/parcelaService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  ParcelaListItem,
  ParcelaDetalhe,
  CreateParcelaInput,
  UpdateParcelaInput,
} from '../types';

export interface GetParcelasFilters {
  search?: string;
  tipoSolo?: string;
  agricultorId?: string;
}

class ParcelaService {
  /**
   * Obtém a lista de parcelas da API com suporte a filtros
   * O backend isola automaticamente os dados de acordo com o papel do utilizador logado (RBAC):
   * - AGRICULTOR: apenas suas parcelas
   * - TECNICO: apenas parcelas dos agricultores vinculados
   * - ADMIN: todas as parcelas
   */
  public async getParcelas(filters: GetParcelasFilters = {}): Promise<ParcelaListItem[]> {
    const params: Record<string, string | undefined> = {};
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.tipoSolo && filters.tipoSolo !== 'TODOS') params.tipoSolo = filters.tipoSolo;
    if (filters.agricultorId && filters.agricultorId !== 'TODOS') params.agricultorId = filters.agricultorId;

    try {
      return await api.get<ParcelaListItem[]>('/api/parcelas', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter lista de parcelas da API.', 'GET_PARCELAS_ERROR');
    }
  }

  /**
   * Obtém os detalhes completos de uma parcela pelo ID
   * Inclui histórico de leituras de solo, recomendações e pragas
   */
  public async getParcelaById(id: string): Promise<ParcelaDetalhe | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await api.get<any>(`/api/parcelas/${id}`);
      if (!raw) return null;

      const detalhe: ParcelaDetalhe = {
        ...raw,
        agricultor: raw.agricultor || {
          id: raw.agricultorId,
          nome: 'Agricultor Familiar',
          telefone: null,
          zonaAtuacao: null,
        },
        leiturasRecentes: raw.leituras || raw.leiturasRecentes || [],
        recomendacoesRecentes: raw.recomendacoes || raw.recomendacoesRecentes || [],
      };
      return detalhe;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter detalhes da parcela.', 'GET_PARCELA_ERROR');
    }
  }

  /**
   * Cria uma nova parcela agrícola no banco de dados
   * O backend associa automaticamente ao agricultor autenticado via token JWT
   */
  public async createParcela(input: CreateParcelaInput): Promise<ParcelaListItem> {
    try {
      return await api.post<ParcelaListItem>('/api/parcelas', input);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao criar parcela agrícola.', 'CREATE_PARCELA_ERROR');
    }
  }

  /**
   * Atualiza os dados de uma parcela existente
   */
  public async updateParcela(id: string, input: UpdateParcelaInput): Promise<ParcelaListItem> {
    try {
      return await api.put<ParcelaListItem>(`/api/parcelas/${id}`, input);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao atualizar parcela agrícola.', 'UPDATE_PARCELA_ERROR');
    }
  }

  /**
   * Remove uma parcela agrícola
   */
  public async deleteParcela(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/parcelas/${id}`);
      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao eliminar parcela agrícola.', 'DELETE_PARCELA_ERROR');
    }
  }
}

export const parcelaService = new ParcelaService();
