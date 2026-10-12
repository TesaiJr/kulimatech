// src/features/comunicacao/hooks/useChatRealtime.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConversaResumoDTO, MensagemDTO, InterlocutorDTO } from '../types';
import { comunicacaoService } from '../services/comunicacaoService';
import { authService } from '@/features/auth/services/authService';

export interface UseChatRealtimeProps {
  initialConversas?: ConversaResumoDTO[];
  initialMensagens?: MensagemDTO[];
  initialInterlocutor?: InterlocutorDTO | null;
  currentUser?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
}

export function useChatRealtime({
  initialConversas = [],
  initialMensagens = [],
  initialInterlocutor = null,
  currentUser: initialUser = null,
}: UseChatRealtimeProps) {
  const [conversas, setConversas] = useState<ConversaResumoDTO[]>(initialConversas);
  const [selectedInterlocutor, setSelectedInterlocutor] = useState<InterlocutorDTO | null>(
    initialInterlocutor || (initialConversas.length > 0 ? initialConversas[0].interlocutor : null)
  );
  const [mensagens, setMensagens] = useState<MensagemDTO[]>(initialMensagens);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedInterlocutorRef = useRef<InterlocutorDTO | null>(selectedInterlocutor);
  selectedInterlocutorRef.current = selectedInterlocutor;

  // Recupera usuário atual do hook ou do storage local caso não tenha vindo do servidor
  const getCurrentUser = useCallback(() => {
    if (initialUser) return initialUser;
    const stored = authService.getStoredUser();
    if (stored) {
      return {
        id: stored.id,
        nome: stored.nome,
        email: stored.email,
        role: stored.role,
      };
    }
    return null;
  }, [initialUser]);

  // Se não recebemos dados iniciais pelo servidor, buscar do cliente na montagem
  useEffect(() => {
    if (initialConversas.length === 0) {
      comunicacaoService.getConversas()
        .then((data) => {
          setConversas(data);
          if (data.length > 0 && !selectedInterlocutorRef.current) {
            setSelectedInterlocutor(data[0].interlocutor);
          }
        })
        .catch((err) => {
          console.error('[Chat] Erro ao carregar conversas iniciais:', err);
        });
    }
  }, [initialConversas.length]);

  // Carregar mensagens quando o interlocutor selecionado muda
  const carregarMensagensInterlocutor = useCallback(async (interlocutorId: string) => {
    try {
      setError(null);
      const data = await comunicacaoService.getMensagens(interlocutorId);
      setMensagens(data.map((m) => ({ ...m, status: 'sent' })));

      // Zerar contagem de não lidas na lista de conversas
      setConversas((prev) =>
        prev.map((c) =>
          c.interlocutor.id === interlocutorId ? { ...c, totalNaoLidas: 0 } : c
        )
      );
    } catch (err) {
      console.error('[Chat] Erro ao carregar mensagens do interlocutor:', err);
      setError('Falha ao carregar histórico de mensagens com este interlocutor.');
    }
  }, []);

  // Selecionar interlocutor
  const selecionarInterlocutor = useCallback((interlocutor: InterlocutorDTO) => {
    setSelectedInterlocutor(interlocutor);
    carregarMensagensInterlocutor(interlocutor.id);
  }, [carregarMensagensInterlocutor]);

  // Conectar ao stream de Server-Sent Events (SSE) para Push Realtime
  useEffect(() => {
    const token = authService.getStoredToken();
    const streamUrl = `/api/mensagens/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(streamUrl);

        eventSource.addEventListener('connected', () => {
          setIsRealtimeConnected(true);
        });

        eventSource.addEventListener('message', (event) => {
          try {
            const novaMsg: MensagemDTO = JSON.parse(event.data);
            const currentUser = getCurrentUser();
            const currentSelected = selectedInterlocutorRef.current;

            // 1. Atualizar histórico de mensagens se a mensagem pertence à conversa aberta
            if (
              currentSelected &&
              (novaMsg.remetenteId === currentSelected.id ||
                (currentUser && novaMsg.remetenteId === currentUser.id && novaMsg.destinatarioId === currentSelected.id))
            ) {
              setMensagens((prev) => {
                // Verificar se já existe (ou se é substituição de mensagem otimista)
                const jaExiste = prev.some(
                  (m) =>
                    m.id === novaMsg.id ||
                    (m.status === 'sending' &&
                      m.conteudo === novaMsg.conteudo &&
                      m.remetenteId === novaMsg.remetenteId)
                );

                if (jaExiste) {
                  return prev.map((m) => {
                    if (
                      m.id === novaMsg.id ||
                      (m.status === 'sending' &&
                        m.conteudo === novaMsg.conteudo &&
                        m.remetenteId === novaMsg.remetenteId)
                    ) {
                      return { ...novaMsg, status: 'sent' };
                    }
                    return m;
                  });
                }

                return [...prev, { ...novaMsg, status: 'sent' }];
              });
            }

            // 2. Atualizar lista de conversas no sidebar
            setConversas((prev) => {
              const outroId =
                currentUser && novaMsg.remetenteId === currentUser.id
                  ? novaMsg.destinatarioId
                  : novaMsg.remetenteId;

              const conversaExistente = prev.find((c) => c.interlocutor.id === outroId);
              const ehConversaAtiva = currentSelected && currentSelected.id === outroId;

              const conversaAtualizada: ConversaResumoDTO = conversaExistente
                ? {
                    ...conversaExistente,
                    ultimaMensagem: {
                      id: novaMsg.id,
                      conteudo: novaMsg.conteudo,
                      createdAt: typeof novaMsg.createdAt === 'string' ? novaMsg.createdAt : new Date().toISOString(),
                      enviadaPorMim: currentUser ? novaMsg.remetenteId === currentUser.id : false,
                    },
                    totalNaoLidas: ehConversaAtiva
                      ? 0
                      : conversaExistente.totalNaoLidas + (currentUser && novaMsg.remetenteId === currentUser.id ? 0 : 1),
                  }
                : {
                    interlocutor: (novaMsg.remetenteId === outroId ? novaMsg.remetente : novaMsg.destinatario) || {
                      id: outroId,
                      nome: 'Utilizador',
                      email: '',
                      role: 'AGRICULTOR',
                    },
                    ultimaMensagem: {
                      id: novaMsg.id,
                      conteudo: novaMsg.conteudo,
                      createdAt: typeof novaMsg.createdAt === 'string' ? novaMsg.createdAt : new Date().toISOString(),
                      enviadaPorMim: currentUser ? novaMsg.remetenteId === currentUser.id : false,
                    },
                    totalNaoLidas: ehConversaAtiva ? 0 : 1,
                  };

              // Reordenar colocando a conversa atualizada no topo
              const outras = prev.filter((c) => c.interlocutor.id !== outroId);
              return [conversaAtualizada, ...outras];
            });
          } catch (err) {
            console.error('[SSE] Erro ao processar mensagem recebida:', err);
          }
        });

        eventSource.addEventListener('read', (event) => {
          try {
            const data = JSON.parse(event.data);
            const currentSelected = selectedInterlocutorRef.current;
            if (currentSelected && currentSelected.id === data.leitorId) {
              setMensagens((prev) =>
                prev.map((m) => (m.destinatarioId === data.leitorId ? { ...m, lida: true } : m))
              );
            }
          } catch (err) {
            console.error('[SSE] Erro ao processar confirmação de leitura:', err);
          }
        });

        eventSource.onerror = () => {
          setIsRealtimeConnected(false);
          eventSource?.close();
          // Tentar reconectar suavemente após 3 segundos
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.error('[SSE Connection Error]:', err);
        setIsRealtimeConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
      setIsRealtimeConnected(false);
    };
  }, [getCurrentUser]);

  // Envio Otimista de Mensagem (Sem loading, resposta instantânea na tela)
  const enviarMensagemOtimista = useCallback(
    async (texto: string) => {
      const conteudoLimpo = texto.trim();
      const interlocutor = selectedInterlocutorRef.current;
      const currentUser = getCurrentUser();

      if (!conteudoLimpo || !interlocutor || !currentUser) return;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 1. Mensagem Otimista na UI
      const mensagemOtimista: MensagemDTO = {
        id: tempId,
        tempId,
        remetenteId: currentUser.id,
        destinatarioId: interlocutor.id,
        conteudo: conteudoLimpo,
        lida: false,
        createdAt: new Date().toISOString(),
        status: 'sending',
        remetente: {
          id: currentUser.id,
          nome: currentUser.nome,
          email: currentUser.email,
          role: currentUser.role as any,
        },
        destinatario: interlocutor,
      };

      // Adicionar instantaneamente ao estado da tela
      setMensagens((prev) => [...prev, mensagemOtimista]);

      // Atualizar a última mensagem na lista de conversas instantaneamente
      setConversas((prev) => {
        const existente = prev.find((c) => c.interlocutor.id === interlocutor.id);
        const atualizada: ConversaResumoDTO = existente
          ? {
              ...existente,
              ultimaMensagem: {
                id: tempId,
                conteudo: conteudoLimpo,
                createdAt: mensagemOtimista.createdAt,
                enviadaPorMim: true,
              },
            }
          : {
              interlocutor,
              ultimaMensagem: {
                id: tempId,
                conteudo: conteudoLimpo,
                createdAt: mensagemOtimista.createdAt,
                enviadaPorMim: true,
              },
              totalNaoLidas: 0,
            };

        const outras = prev.filter((c) => c.interlocutor.id !== interlocutor.id);
        return [atualizada, ...outras];
      });

      // 2. Persistir no servidor em segundo plano e confirmar
      try {
        const confirmada = await comunicacaoService.enviarMensagem({
          destinatarioId: interlocutor.id,
          conteudo: conteudoLimpo,
        });

        // Substituir mensagem otimista pela mensagem real com id permanente e status 'sent'
        setMensagens((prev) =>
          prev.map((m) => (m.id === tempId ? { ...confirmada, status: 'sent' } : m))
        );
      } catch (err) {
        console.error('[Chat] Erro ao enviar mensagem:', err);
        // Marcar a mensagem com status de erro para permitir retentativa
        setMensagens((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m))
        );
      }
    },
    [getCurrentUser]
  );

  // Retentar envio de mensagem com falha
  const retentarMensagem = useCallback(
    async (mensagemFalha: MensagemDTO) => {
      const interlocutor = selectedInterlocutorRef.current;
      if (!interlocutor) return;

      // Voltar status para 'sending'
      setMensagens((prev) =>
        prev.map((m) => (m.id === mensagemFalha.id ? { ...m, status: 'sending' } : m))
      );

      try {
        const confirmada = await comunicacaoService.enviarMensagem({
          destinatarioId: interlocutor.id,
          conteudo: mensagemFalha.conteudo,
        });

        setMensagens((prev) =>
          prev.map((m) => (m.id === mensagemFalha.id ? { ...confirmada, status: 'sent' } : m))
        );
      } catch (err) {
        console.error('[Chat] Erro ao retentar envio:', err);
        setMensagens((prev) =>
          prev.map((m) => (m.id === mensagemFalha.id ? { ...m, status: 'error' } : m))
        );
      }
    },
    []
  );

  return {
    conversas,
    selectedInterlocutor,
    mensagens,
    isRealtimeConnected,
    error,
    selecionarInterlocutor,
    enviarMensagemOtimista,
    retentarMensagem,
    carregarMensagensInterlocutor,
  };
}
