// src/features/leituras/services/leituraService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  LeituraSoloDTO,
  CreateLeituraDTO,
  ValidarLeituraDTO,
  LeituraEstatisticasDTO,
  GetLeiturasFilters,
} from '../types';

class LeituraService {
  /**
   * Obtém a lista de leituras de solo com filtros avançados e isolamento RBAC
   */
  public async getLeituras(filters: GetLeiturasFilters = {}): Promise<LeituraSoloDTO[]> {
    const params: Record<string, string | number | undefined> = {};

    if (filters.parcelaId && filters.parcelaId !== 'TODOS') {
      params.parcelaId = filters.parcelaId;
    }

    if (filters.validado && filters.validado !== 'all') {
      params.validado = filters.validado;
    }

    if (filters.statusHumidade && filters.statusHumidade !== 'TODOS') {
      params.statusHumidade = filters.statusHumidade;
    }

    if (filters.agricultorId && filters.agricultorId !== 'TODOS') {
      params.agricultorId = filters.agricultorId;
    }

    if (filters.dataInicio) params.dataInicio = filters.dataInicio;
    if (filters.dataFim) params.dataFim = filters.dataFim;
    if (filters.limit) params.limit = filters.limit;

    try {
      return await api.get<LeituraSoloDTO[]>('/api/leituras', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter lista de leituras de solo.', 'GET_LEITURAS_ERROR');
    }
  }

  /**
   * Regista uma nova leitura de humidade de solo
   */
  public async createLeitura(data: CreateLeituraDTO): Promise<LeituraSoloDTO> {
    try {
      return await api.post<LeituraSoloDTO>('/api/leituras', data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao registar leitura de solo.', 'CREATE_LEITURA_ERROR');
    }
  }

  /**
   * Homologa agronomicamente uma leitura de solo
   * Apenas Técnicos SDAE vinculados ou Administradores
   */
  public async validarLeitura(id: string, data: ValidarLeituraDTO): Promise<LeituraSoloDTO> {
    try {
      return await api.patch<LeituraSoloDTO>(`/api/leituras/${id}/validar`, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao validar leitura de solo.', 'VALIDAR_LEITURA_ERROR');
    }
  }

  /**
   * Obtém os dados estatísticos agregados de humidade e validação
   */
  public async getEstatisticas(parcelaId?: string): Promise<LeituraEstatisticasDTO> {
    const params: Record<string, string | undefined> = {};
    if (parcelaId && parcelaId !== 'TODOS') {
      params.parcelaId = parcelaId;
    }

    try {
      return await api.get<LeituraEstatisticasDTO>('/api/leituras/estatisticas', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter estatísticas de leituras.', 'GET_ESTATISTICAS_ERROR');
    }
  }
}

export const leituraService = new LeituraService();
