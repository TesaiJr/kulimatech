// src/features/pragas/services/ocorrenciaService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  OcorrenciaPragaDTO,
  CreateOcorrenciaDTO,
  ResolverOcorrenciaDTO,
  OcorrenciaEstatisticasDTO,
  GetOcorrenciasFilters,
} from '../types';

class OcorrenciaService {
  /**
   * Obtém lista de ocorrências com filtros e isolamento RBAC
   */
  public async getOcorrencias(filters: GetOcorrenciasFilters = {}): Promise<OcorrenciaPragaDTO[]> {
    const params: Record<string, string | undefined> = {};

    if (filters.status && filters.status !== 'TODOS') {
      params.status = filters.status;
    }

    if (filters.severidade && filters.severidade !== 'TODOS') {
      params.severidade = filters.severidade;
    }

    if (filters.parcelaId && filters.parcelaId !== 'TODOS') {
      params.parcelaId = filters.parcelaId;
    }

    if (filters.pragaId && filters.pragaId !== 'TODOS') {
      params.pragaId = filters.pragaId;
    }

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    try {
      return await api.get<OcorrenciaPragaDTO[]>('/api/ocorrencias', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter lista de ocorrências fitossanitárias.', 'GET_OCORRENCIAS_ERROR');
    }
  }

  /**
   * Obtém detalhes de uma ocorrência específica
   */
  public async getOcorrenciaById(id: string): Promise<OcorrenciaPragaDTO> {
    try {
      return await api.get<OcorrenciaPragaDTO>(`/api/ocorrencias/${id}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter detalhes da ocorrência.', 'GET_OCORRENCIA_BY_ID_ERROR');
    }
  }

  /**
   * Reporta nova ocorrência de praga numa parcela (Agricultor ou Técnico)
   */
  public async createOcorrencia(data: CreateOcorrenciaDTO): Promise<OcorrenciaPragaDTO> {
    try {
      return await api.post<OcorrenciaPragaDTO>('/api/ocorrencias', data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao submeter reporte de ocorrência.', 'CREATE_OCORRENCIA_ERROR');
    }
  }

  /**
   * Homologa parecer técnico e encerra a ocorrência (Técnico SDAE ou Administrador)
   */
  public async resolverOcorrencia(
    id: string,
    data: ResolverOcorrenciaDTO
  ): Promise<OcorrenciaPragaDTO> {
    try {
      return await api.patch<OcorrenciaPragaDTO>(`/api/ocorrencias/${id}/resolver`, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao emitir parecer técnico da ocorrência.', 'RESOLVER_OCORRENCIA_ERROR');
    }
  }

  /**
   * Obtém dados estatísticos consolidados de ocorrências
   */
  public async getEstatisticas(parcelaId?: string): Promise<OcorrenciaEstatisticasDTO> {
    const params: Record<string, string | undefined> = {};
    if (parcelaId && parcelaId !== 'TODOS') {
      params.parcelaId = parcelaId;
    }

    try {
      return await api.get<OcorrenciaEstatisticasDTO>('/api/ocorrencias/estatisticas', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter estatísticas de ocorrências.', 'GET_ESTATISTICAS_ERROR');
    }
  }
}

export const ocorrenciaService = new OcorrenciaService();
