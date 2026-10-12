// src/features/users/services/userService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  UserAdminDTO,
  CreateUserInput,
  UpdateUserInput,
  AtribuicoesResponseData,
  AtribuicaoPayload,
} from '../types';

class UserService {
  /**
   * Obtém lista de utilizadores com suporte a filtros e isolamento RBAC
   */
  public async getUsers(filters: { role?: string; status?: string; search?: string } = {}): Promise<UserAdminDTO[]> {
    const params: Record<string, string | undefined> = {};
    if (filters.role && filters.role !== 'ALL') params.role = filters.role;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    try {
      return await api.get<UserAdminDTO[]>('/api/users', { params });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao carregar lista de utilizadores.', 'GET_USERS_ERROR');
    }
  }

  /**
   * Obtém detalhes de um utilizador específico pelo ID
   */
  public async getUserById(id: string): Promise<UserAdminDTO> {
    try {
      return await api.get<UserAdminDTO>(`/api/users/${id}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter detalhes do utilizador.', 'GET_USER_ERROR');
    }
  }

  /**
   * Cria novo utilizador institucional (Apenas ADMIN)
   */
  public async createUser(data: CreateUserInput): Promise<UserAdminDTO> {
    try {
      return await api.post<UserAdminDTO>('/api/users', data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao cadastrar utilizador.', 'CREATE_USER_ERROR');
    }
  }

  /**
   * Atualiza dados cadastrais ou status de um utilizador (Apenas ADMIN)
   */
  public async updateUser(id: string, data: UpdateUserInput): Promise<UserAdminDTO> {
    try {
      return await api.patch<UserAdminDTO>(`/api/users/${id}`, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao atualizar utilizador.', 'UPDATE_USER_ERROR');
    }
  }

  /**
   * Obtém carteiras técnicas e agricultores pendentes de atribuição (Apenas ADMIN)
   */
  public async getAtribuicoes(): Promise<AtribuicoesResponseData> {
    try {
      return await api.get<AtribuicoesResponseData>('/api/users/atribuicoes');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao carregar carteiras técnicas.', 'GET_ATRIBUICOES_ERROR');
    }
  }

  /**
   * Atribui agricultores a um técnico do SDAE (Apenas ADMIN)
   */
  public async atribuirCarteira(payload: AtribuicaoPayload): Promise<{ message: string; tecnicoId: string; agricultoresAtribuidos: number }> {
    try {
      return await api.post<{ message: string; tecnicoId: string; agricultoresAtribuidos: number }>(
        '/api/users/atribuicoes',
        payload
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao atribuir agricultores ao técnico.', 'ATRIBUIR_CARTEIRA_ERROR');
    }
  }

  /**
   * Remove a atribuição entre técnico e agricultor (Apenas ADMIN)
   */
  public async removerAtribuicao(tecnicoId: string, agricultorId: string): Promise<{ message: string }> {
    try {
      return await api.delete<{ message: string }>(
        `/api/users/atribuicoes?tecnicoId=${encodeURIComponent(tecnicoId)}&agricultorId=${encodeURIComponent(agricultorId)}`
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao remover atribuição técnica.', 'REMOVER_ATRIBUICAO_ERROR');
    }
  }
}

export const userService = new UserService();
