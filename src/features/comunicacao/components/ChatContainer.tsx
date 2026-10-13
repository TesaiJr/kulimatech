// src/features/comunicacao/components/ChatContainer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  Search,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { ConversaResumoDTO, MensagemDTO, InterlocutorDTO } from '../types';
import { useChatRealtime } from '../hooks/useChatRealtime';

function formatHora(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  } catch {
    return '';
  }
}

export interface ChatContainerProps {
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

export function ChatContainer({
  initialConversas = [],
  initialMensagens = [],
  initialInterlocutor = null,
  currentUser = null,
}: ChatContainerProps) {
  const {
    conversas,
    selectedInterlocutor,
    mensagens,
    isRealtimeConnected,
    error,
    selecionarInterlocutor,
    enviarMensagemOtimista,
    retentarMensagem,
  } = useChatRealtime({
    initialConversas,
    initialMensagens,
    initialInterlocutor,
    currentUser,
  });

  const [texto, setTexto] = useState<string>('');
  const [searchContact, setSearchContact] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para a mensagem mais recente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !selectedInterlocutor) return;

    const msgToSend = texto;
    setTexto(''); // Limpa imediatamente a caixa de texto (Otimista)
    enviarMensagemOtimista(msgToSend);

    // Foco de volta no input
    inputRef.current?.focus();
  };

  const conversasFiltradas = conversas.filter(
    (c) =>
      c.interlocutor.nome.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.interlocutor.email.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Mensagens & Comunicação Direta"
          description="Canal oficial em tempo real entre Agricultores e Técnicos do SDAE Nhamatanda."
          badge={
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                  isRealtimeConnected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isRealtimeConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Em tempo real</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>A reconectar...</span>
                  </>
                )}
              </span>
            </div>
          }
        />
        <div className="flex items-center gap-2">
          <Link href="/mensagens/alertas">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
              <Bell className="w-4 h-4 text-secondary" />
              <span>Centro de Alertas</span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Painel do Chat (2 Colunas: Lista de Contatos + Janela de Mensagens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Coluna 1: Lista de Interlocutores (4 Colunas) */}
        <Card className="lg:col-span-4 flex flex-col h-full overflow-hidden border-secondary/20 shadow-md">
          <div className="p-4 border-b border-secondary/15 space-y-3 bg-surface">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-primary flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-secondary" />
                <span>Conversas Ativas</span>
              </h2>
              <span className="text-[11px] font-mono text-muted">
                {conversas.length} {conversas.length === 1 ? 'contacto' : 'contactos'}
              </span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Pesquisar contacto..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-muted/30 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-secondary/10 bg-surface/50">
            {conversasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Nenhum contacto encontrado</p>
                <p className="text-[11px] mt-1 opacity-70">
                  {searchContact
                    ? 'Tente outro termo de pesquisa'
                    : 'Apenas contactos com vínculo técnico aparecem aqui.'}
                </p>
              </div>
            ) : (
              conversasFiltradas.map((conv) => {
                const isSelected = selectedInterlocutor?.id === conv.interlocutor.id;
                const isTecnico = conv.interlocutor.role === 'TECNICO';

                return (
                  <button
                    key={conv.interlocutor.id}
                    type="button"
                    onClick={() => selecionarInterlocutor(conv.interlocutor)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-secondary/10 border-l-4 border-secondary'
                        : 'hover:bg-muted/10'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                          isTecnico
                            ? 'bg-secondary text-surface'
                            : 'bg-accent text-primary'
                        }`}
                      >
                        {conv.interlocutor.nome.charAt(0).toUpperCase()}
                      </div>
                      {conv.totalNaoLidas > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-surface">
                          {conv.totalNaoLidas}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-extrabold text-primary truncate">
                          {conv.interlocutor.nome}
                        </p>
                        {conv.ultimaMensagem && (
                          <span className="text-[10px] text-muted whitespace-nowrap">
                            {formatHora(conv.ultimaMensagem.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant={isTecnico ? 'accent' : 'secondary'}
                          size="sm"
                          className="text-[9px] py-0 px-1"
                        >
                          {isTecnico ? 'Técnico SDAE' : 'Agricultor'}
                        </Badge>
                        {conv.interlocutor.zonaAtuacao && (
                          <span className="text-[10px] text-muted truncate">
                            · {conv.interlocutor.zonaAtuacao}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted truncate mt-1">
                        {conv.ultimaMensagem ? (
                          <>
                            {conv.ultimaMensagem.enviadaPorMim && (
                              <span className="font-semibold text-primary/70">Você: </span>
                            )}
                            {conv.ultimaMensagem.conteudo}
                          </>
                        ) : (
                          <span className="italic opacity-70">Nenhuma mensagem recente</span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Coluna 2: Janela da Conversa Ativa (8 Colunas) */}
        <Card className="lg:col-span-8 flex flex-col h-full overflow-hidden border-secondary/20 shadow-md">
          {selectedInterlocutor ? (
            <>
              {/* Header do Chat Ativo */}
              <div className="p-3.5 px-5 border-b border-secondary/15 flex items-center justify-between bg-surface">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                      selectedInterlocutor.role === 'TECNICO'
                        ? 'bg-secondary text-surface'
                        : 'bg-accent text-primary'
                    }`}
                  >
                    {selectedInterlocutor.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-primary">
                        {selectedInterlocutor.nome}
                      </h3>
                      <Badge
                        variant={selectedInterlocutor.role === 'TECNICO' ? 'accent' : 'secondary'}
                        size="sm"
                      >
                        {selectedInterlocutor.role === 'TECNICO' ? 'Técnico SDAE' : 'Agricultor Familiar'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5">
                      {selectedInterlocutor.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-secondary" />
                          {selectedInterlocutor.telefone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-secondary" />
                        {selectedInterlocutor.zonaAtuacao || 'Distrito de Nhamatanda'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-mono text-muted uppercase">
                    Canal Criptografado (TLS)
                  </span>
                </div>
              </div>

              {/* Mensagens da Conversa (Scrollable) */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#FAF8F5]">
                {mensagens.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted">
                    <MessageSquare className="w-12 h-12 text-secondary/30 mb-2" />
                    <h4 className="font-bold text-sm text-primary">Início da Conversação</h4>
                    <p className="text-xs max-w-sm mt-1">
                      Envie uma mensagem abaixo para iniciar a assistência técnica e orientações agronómicas.
                    </p>
                  </div>
                ) : (
                  mensagens.map((msg) => {
                    const enviadaPorMim = currentUser
                      ? msg.remetenteId === currentUser.id
                      : msg.destinatarioId === selectedInterlocutor.id;

                    const isSending = msg.status === 'sending';
                    const isError = msg.status === 'error';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${enviadaPorMim ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm transition-all ${
                            enviadaPorMim
                              ? isError
                                ? 'bg-red-50 text-red-900 border border-red-300 rounded-br-none'
                                : 'bg-secondary text-surface rounded-br-none'
                              : 'bg-surface text-primary border border-secondary/15 rounded-bl-none'
                          }`}
                        >
                          {/* Conteúdo */}
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>

                          {/* Rodapé da Mensagem (Hora e Indicador de Envio Otimista) */}
                          <div
                            className={`flex items-center gap-1.5 justify-end mt-1 text-[10px] ${
                              enviadaPorMim
                                ? isError
                                  ? 'text-red-700'
                                  : 'text-surface/70'
                                : 'text-muted'
                            }`}
                          >
                            <span>
                              {formatHora(msg.createdAt)}
                            </span>

                            {enviadaPorMim && (
                              <span>
                                {isSending ? (
                                  <Clock className="w-3 h-3 text-surface/60 animate-pulse" />
                                ) : isError ? (
                                  <button
                                    type="button"
                                    onClick={() => retentarMensagem(msg)}
                                    title="Erro ao enviar. Clique para tentar novamente."
                                    className="flex items-center gap-0.5 text-red-600 font-bold hover:underline"
                                  >
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Tentar de novo</span>
                                  </button>
                                ) : msg.lida ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-accent" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-surface/60" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulário de Envio (Otimista / Sem loading) */}
              <form
                onSubmit={handleSubmit}
                className="p-3 sm:p-4 bg-surface border-t border-secondary/15 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Escreva uma mensagem para ${selectedInterlocutor.nome}...`}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-muted/10 border border-muted/30 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                <Button
                  type="submit"
                  disabled={!texto.trim()}
                  className="rounded-xl px-4 py-2.5 flex items-center gap-2 bg-secondary text-surface hover:bg-secondary/90 transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted">
              <MessageSquare className="w-16 h-16 text-secondary/30 mb-3" />
              <h3 className="font-extrabold text-base text-primary">Nenhuma conversa selecionada</h3>
              <p className="text-xs max-w-sm mt-1">
                Selecione um agricultor ou técnico da lista ao lado para aceder ao canal de comunicação oficial.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
