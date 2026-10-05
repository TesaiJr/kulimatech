// src/app/(dashboard)/mensagens/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Badge, Button, Alert, Input } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { comunicacaoService } from '@/features/comunicacao/services/comunicacaoService';
import { ConversaResumoDTO, MensagemDTO, InterlocutorDTO } from '@/features/comunicacao/types';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  Search,
  RefreshCw,
  Bell,
  Check,
  CheckCheck,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

export default function MensagensPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [conversas, setConversas] = useState<ConversaResumoDTO[]>([]);
  const [selectedInterlocutor, setSelectedInterlocutor] = useState<InterlocutorDTO | null>(null);
  const [mensagens, setMensagens] = useState<MensagemDTO[]>([]);
  const [novoTexto, setNovoTexto] = useState<string>('');
  const [searchContact, setSearchContact] = useState<string>('');

  const [loadingConversas, setLoadingConversas] = useState<boolean>(true);
  const [loadingMensagens, setLoadingMensagens] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirecionamento se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [authLoading, isAuthenticated, router]);

  const role: UserRole =
    user?.role === 'TECNICO'
      ? 'TECNICO_SDAE'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'AGRICULTOR';

  const roleInfo = USER_ROLES_INFO[role];
  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  // Carregar lista de conversas
  const carregarConversas = useCallback(async (autoSelectId?: string) => {
    try {
      setError(null);
      const data = await comunicacaoService.getConversas();
      setConversas(data);

      if (data.length > 0) {
        if (autoSelectId) {
          const target = data.find((c) => c.interlocutor.id === autoSelectId);
          if (target) {
            setSelectedInterlocutor(target.interlocutor);
            return;
          }
        }
        setSelectedInterlocutor((prev) => prev || data[0].interlocutor);
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar as conversas. Verifique a conexão com o servidor.');
    } finally {
      setLoadingConversas(false);
    }
  }, []);

  // Carregar mensagens da conversa selecionada
  const carregarMensagens = useCallback(async (interlocutorId: string, silencioso = false) => {
    if (!silencioso) setLoadingMensagens(true);
    try {
      const data = await comunicacaoService.getMensagens(interlocutorId);
      setMensagens(data);
    } catch (err) {
      console.error(err);
      if (!silencioso) {
        setError('Falha ao obter histórico de mensagens com o interlocutor.');
      }
    } finally {
      if (!silencioso) setLoadingMensagens(false);
    }
  }, []);

  // Inicialização
  useEffect(() => {
    if (isAuthenticated) {
      const paramInterlocutor = searchParams.get('interlocutorId') || undefined;
      carregarConversas(paramInterlocutor);
    }
  }, [isAuthenticated, carregarConversas, searchParams]);

  // Carregar mensagens ao trocar interlocutor
  useEffect(() => {
    if (selectedInterlocutor) {
      carregarMensagens(selectedInterlocutor.id);
    }
  }, [selectedInterlocutor, carregarMensagens]);

  // Polling em tempo real a cada 2.5 segundos para chat ativo e conversas
  useEffect(() => {
    if (!selectedInterlocutor) return;

    const interval = setInterval(() => {
      carregarMensagens(selectedInterlocutor.id, true);
    }, 2500);

    const convInterval = setInterval(() => {
      carregarConversas(selectedInterlocutor.id);
    }, 5000);

    const handleFocus = () => {
      carregarMensagens(selectedInterlocutor.id, true);
      carregarConversas(selectedInterlocutor.id);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      clearInterval(convInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedInterlocutor, carregarMensagens, carregarConversas]);

  // Scroll para o fim da conversa
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Enviar nova mensagem
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !selectedInterlocutor || enviando) return;

    setEnviando(true);
    setError(null);

    try {
      const msgEnviada = await comunicacaoService.enviarMensagem({
        destinatarioId: selectedInterlocutor.id,
        conteudo: novoTexto.trim(),
      });

      setMensagens((prev) => [...prev, msgEnviada]);
      setNovoTexto('');

      // Atualizar lista de conversas
      carregarConversas(selectedInterlocutor.id);
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar a mensagem. Certifique-se de que o vínculo técnico está ativo.');
    } finally {
      setEnviando(false);
    }
  };

  const conversasFiltradas = conversas.filter((c) =>
    c.interlocutor.nome.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.interlocutor.email.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <DashboardLayout activeNavId="messages" user={layoutUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Mensagens & Comunicação Direta"
            description="Canal oficial de assistência técnica agronómica entre Agricultores e Técnicos do SDAE Nhamatanda."
          />
          <div className="flex items-center gap-2">
            <Link href="/mensagens/alertas">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                <Bell className="w-4 h-4 text-accent" />
                <span>Painel de Alertas</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Atenção">
            {error}
          </Alert>
        )}

        {/* Layout do Chat: 2 Colunas (Lista de Interlocutores + Painel de Conversa) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] h-[calc(100vh-280px)]">
          {/* Coluna Esquerda: Lista de Conversas / Contatos (4 colunas) */}
          <div className="lg:col-span-4 flex flex-col h-full bg-surface border border-secondary/20 rounded-2xl overflow-hidden shadow-sm">
            {/* Cabeçalho da Lista */}
            <div className="p-4 border-b border-secondary/15 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm text-primary">Conversas Vinculadas</span>
                </div>
                <button
                  type="button"
                  onClick={() => carregarConversas(selectedInterlocutor?.id)}
                  title="Atualizar conversas"
                  className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Barra de pesquisa de contato */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60" />
                <input
                  type="text"
                  placeholder="Pesquisar interlocutor..."
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  className="w-full bg-surface border border-secondary/20 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent text-primary placeholder:text-secondary/50"
                />
              </div>
            </div>

            {/* Lista com scroll */}
            <div className="flex-1 overflow-y-auto divide-y divide-secondary/10">
              {loadingConversas ? (
                <div className="p-6 text-center text-xs text-secondary space-y-2">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>A carregar interlocutores...</p>
                </div>
              ) : conversasFiltradas.length === 0 ? (
                <div className="p-8 text-center text-xs text-secondary/70 space-y-3">
                  <UserIcon className="w-10 h-10 text-secondary/40 mx-auto" />
                  <p className="font-medium text-primary/80">Nenhum vínculo localizado</p>
                  <p className="text-[11px] leading-relaxed">
                    {user?.role === 'AGRICULTOR'
                      ? 'Ainda não possui um técnico do SDAE associado à sua exploração agrícola.'
                      : 'Nenhum agricultor atribuído sob a sua supervisão técnica no momento.'}
                  </p>
                </div>
              ) : (
                conversasFiltradas.map((conv) => {
                  const isSelected = selectedInterlocutor?.id === conv.interlocutor.id;
                  return (
                    <button
                      key={conv.interlocutor.id}
                      type="button"
                      onClick={() => setSelectedInterlocutor(conv.interlocutor)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-accent/10 border-l-4 border-accent'
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-secondary/20">
                        {conv.interlocutor.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-xs font-bold text-primary truncate">
                            {conv.interlocutor.nome}
                          </p>
                          {conv.totalNaoLidas > 0 && (
                            <span className="bg-accent text-primary font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                              {conv.totalNaoLidas}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-secondary/80 font-medium truncate mb-1">
                          {conv.interlocutor.role === 'TECNICO' ? 'Técnico SDAE' : 'Agricultor'}
                          {conv.interlocutor.zonaAtuacao ? ` • ${conv.interlocutor.zonaAtuacao}` : ''}
                        </p>
                        <p className="text-[11px] text-secondary/60 truncate">
                          {conv.ultimaMensagem
                            ? `${conv.ultimaMensagem.enviadaPorMim ? 'Você: ' : ''}${conv.ultimaMensagem.conteudo}`
                            : 'Nenhuma mensagem trocada ainda.'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Janela de Conversa Ativa (8 colunas) */}
          <div className="lg:col-span-8 flex flex-col h-full bg-surface border border-secondary/20 rounded-2xl overflow-hidden shadow-sm">
            {selectedInterlocutor ? (
              <>
                {/* Topo do Chat: Detalhes do Interlocutor */}
                <div className="p-4 border-b border-secondary/15 bg-muted/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm border border-accent/30">
                      {selectedInterlocutor.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-primary">{selectedInterlocutor.nome}</h2>
                        <Badge variant="accent" size="sm" className="text-[10px]">
                          {selectedInterlocutor.role === 'TECNICO' ? 'Técnico Oficial' : 'Agricultor'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-secondary/70 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedInterlocutor.email}
                        </span>
                        {selectedInterlocutor.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedInterlocutor.telefone}
                          </span>
                        )}
                        {selectedInterlocutor.zonaAtuacao && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {selectedInterlocutor.zonaAtuacao}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Tempo Real</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        carregarMensagens(selectedInterlocutor.id);
                        carregarConversas(selectedInterlocutor.id);
                      }}
                      title="Sincronizar mensagens agora"
                      className="p-2 text-secondary hover:text-primary rounded-xl hover:bg-muted/40 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Corpo do Chat: Mensagens com Scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
                  {loadingMensagens ? (
                    <div className="flex items-center justify-center h-full text-xs text-secondary gap-2">
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <span>A carregar mensagens...</span>
                    </div>
                  ) : mensagens.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-secondary space-y-2">
                      <MessageSquare className="w-12 h-12 text-secondary/30" />
                      <p className="font-semibold text-xs text-primary">Inicie uma nova conversa</p>
                      <p className="text-[11px] max-w-sm">
                        Envie uma mensagem abaixo para tirar dúvidas técnicas sobre sementeira, rega, pragas ou agendamento de visita de campo.
                      </p>
                    </div>
                  ) : (
                    mensagens.map((msg) => {
                      const enviadaPorMim = msg.remetenteId === user?.id;
                      const hora = new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const dataFormatada = new Date(msg.createdAt).toLocaleDateString([], {
                        day: '2-digit',
                        month: 'short',
                      });

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${enviadaPorMim ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                              enviadaPorMim
                                ? 'bg-primary text-surface rounded-br-none'
                                : 'bg-surface border border-secondary/20 text-primary rounded-bl-none'
                            }`}
                          >
                            <p className="break-words whitespace-pre-wrap">{msg.conteudo}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                enviadaPorMim ? 'text-surface/70' : 'text-secondary/60'
                              }`}
                            >
                              <span>
                                {dataFormatada} {hora}
                              </span>
                              {enviadaPorMim && (
                                msg.lida ? (
                                  <span aria-label="Lida pelo destinatário">
                                    <CheckCheck className="w-3.5 h-3.5 text-accent" />
                                  </span>
                                ) : (
                                  <span aria-label="Enviada">
                                    <Check className="w-3.5 h-3.5 text-surface/50" />
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Barra Inferior de Envio de Mensagem */}
                <form
                  onSubmit={handleEnviarMensagem}
                  className="p-3 border-t border-secondary/15 bg-surface flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Escreva a sua mensagem agronómica aqui..."
                    value={novoTexto}
                    onChange={(e) => setNovoTexto(e.target.value)}
                    disabled={enviando}
                    className="flex-1 bg-muted/30 border border-secondary/20 rounded-xl px-4 py-2.5 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!novoTexto.trim() || enviando}
                    className="flex items-center gap-1.5 px-4 h-10"
                  >
                    {enviando ? (
                      <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Enviar</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-secondary space-y-3">
                <MessageSquare className="w-12 h-12 text-secondary/30" />
                <h3 className="font-bold text-sm text-primary">Selecione uma conversa</h3>
                <p className="text-xs max-w-sm text-secondary/70">
                  Escolha um interlocutor na lista lateral para visualizar o histórico de mensagens e tirar dúvidas técnicas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}