// src/features/comunicacao/services/comunicacaoService.ts
import { api, ApiError } from '@/lib/api/client';
import {
  ConversaResumoDTO,
  MensagemDTO,
  EnviarMensagemInput,
  AlertasResponseDTO,
  AlertaDTO,
} from '../types';

class ComunicacaoService {
  /**
   * Obtém a lista de conversas ativas com os interlocutores vinculados
   */
  public async getConversas(): Promise<ConversaResumoDTO[]> {
    try {
      return await api.get<ConversaResumoDTO[]>('/api/mensagens');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter lista de conversas.', 'GET_CONVERSAS_ERROR');
    }
  }

  /**
   * Obtém o histórico de mensagens trocadas com um interlocutor específico e marca como lidas
   */
  public async getMensagens(interlocutorId: string): Promise<MensagemDTO[]> {
    try {
      return await api.get<MensagemDTO[]>('/api/mensagens', {
        params: { interlocutorId },
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter histórico de mensagens.', 'GET_MENSAGENS_ERROR');
    }
  }

  /**
   * Envia uma nova mensagem direta para um interlocutor vinculado
   */
  public async enviarMensagem(data: EnviarMensagemInput): Promise<MensagemDTO> {
    try {
      return await api.post<MensagemDTO>('/api/mensagens', data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao enviar mensagem.', 'SEND_MENSAGEM_ERROR');
    }
  }

  /**
   * Consulta os alertas do utilizador autenticado com suporte a filtros
   */
  public async getAlertas(filters: { lido?: boolean; tipo?: string; limite?: number } = {}): Promise<AlertasResponseDTO> {
    try {
      return await api.get<AlertasResponseDTO>('/api/alertas', {
        params: filters as Record<string, string | number | boolean | undefined>,
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao obter notificações e alertas.', 'GET_ALERTAS_ERROR');
    }
  }

  /**
   * Marca um alerta individual como lido
   */
  public async marcarAlertaLido(id: string): Promise<AlertaDTO> {
    try {
      return await api.patch<AlertaDTO>(`/api/alertas/${id}`, { lido: true });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao marcar alerta como lido.', 'MARK_ALERTA_ERROR');
    }
  }

  /**
   * Marca todos os alertas pendentes como lidos
   */
  public async marcarTodosAlertasLidos(): Promise<{ marcadosComoLidos: number }> {
    try {
      return await api.patch<{ marcadosComoLidos: number }>('/api/alertas', {});
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao atualizar alertas.', 'MARK_ALL_ALERTAS_ERROR');
    }
  }

  /**
   * Remove um alerta específico
   */
  public async removerAlerta(id: string): Promise<{ message: string }> {
    try {
      return await api.delete<{ message: string }>(`/api/alertas/${id}`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Falha ao remover alerta.', 'DELETE_ALERTA_ERROR');
    }
  }
}

export const comunicacaoService = new ComunicacaoService();
