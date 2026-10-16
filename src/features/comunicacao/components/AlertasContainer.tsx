// src/features/comunicacao/components/AlertasContainer.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Badge, Button, Alert } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { authService } from '@/features/auth/services/authService';
import { ApiError } from '@/lib/api/client';
import { comunicacaoService } from '../services/comunicacaoService';
import { AlertaDTO } from '../types';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  FileText,
  Bug,
  Check,
  ExternalLink,
  Trash2,
  Filter,
  Wifi,
  WifiOff,
} from 'lucide-react';

export interface AlertasContainerProps {
  initialAlertas?: AlertaDTO[];
  initialTotalNaoLidos?: number;
  currentUser?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
}

export function AlertasContainer({
  initialAlertas = [],
  initialTotalNaoLidos = 0,
  currentUser = null,
}: AlertasContainerProps) {
  const [alertas, setAlertas] = useState<AlertaDTO[]>(initialAlertas);
  const [totalNaoLidos, setTotalNaoLidos] = useState<number>(initialTotalNaoLidos);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroLido, setFiltroLido] = useState<string>('todos'); // 'todos' | 'nao_lidos'
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Sincronização em segundo plano (silenciosa - sem travar tela)
  const sincronizarAlertas = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);
      setError(null);

      try {
        const filters: { lido?: boolean; tipo?: string } = {};
        if (filtroLido === 'nao_lidos') filters.lido = false;
        if (filtroTipo !== 'todos') filters.tipo = filtroTipo;

        const data = await comunicacaoService.getAlertas(filters);
        setAlertas(data.alertas || []);
        setTotalNaoLidos(data.totalNaoLidos || 0);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.code === 'UNAUTHORIZED')) {
          console.warn('[Alertas] Sessão expirada:', err.message);
          setError('A sua sessão expirou. Redirecionando para a página de início de sessão...');
          return;
        }
        console.error('[Alertas] Erro ao sincronizar:', err);
        // Não apaga a tela, apenas mostra aviso se for clique manual
        if (isManual) {
          setError('Não foi possível atualizar os alertas no momento.');
        }
      } finally {
        if (isManual) setIsRefreshing(false);
      }
    },
    [filtroLido, filtroTipo]
  );

  const isFirstMount = useRef(true);

  // Se não recebemos alertas pré-carregados pelo servidor, buscar do cliente na montagem
  useEffect(() => {
    if (initialAlertas.length === 0) {
      sincronizarAlertas(false);
    }
  }, [initialAlertas.length, sincronizarAlertas]);

  // Recarregar quando filtros mudarem (apenas após a montagem inicial)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    sincronizarAlertas(false);
  }, [filtroLido, filtroTipo, sincronizarAlertas]);

  // Push Realtime via Server-Sent Events (SSE) - ZERO Polling
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

        // Evento Push de novo Alerta disparado pelo servidor
        eventSource.addEventListener('alerta', (event) => {
          try {
            const novoAlerta: AlertaDTO = JSON.parse(event.data);
            setAlertas((prev) => {
              if (prev.some((a) => a.id === novoAlerta.id)) return prev;
              return [novoAlerta, ...prev];
            });
            setTotalNaoLidos((prev) => prev + (novoAlerta.lido ? 0 : 1));
          } catch (err) {
            console.error('[SSE Alerta Error]:', err);
          }
        });

        // Evento Push de nova Mensagem
        eventSource.addEventListener('message', () => {
          sincronizarAlertas(false);
        });

        eventSource.onerror = () => {
          setIsRealtimeConnected(false);
          eventSource?.close();
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.error('[SSE Connect Error]:', err);
        setIsRealtimeConnected(false);
      }
    };

    connectSSE();

    // Sincronizar suavemente quando a aba ganha foco
    const handleFocus = () => sincronizarAlertas(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
      window.removeEventListener('focus', handleFocus);
      setIsRealtimeConnected(false);
    };
  }, [sincronizarAlertas]);

  // Marcar um alerta como lido (Otimista imediato)
  const handleMarcarLido = async (id: string) => {
    setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, lido: true } : a)));
    setTotalNaoLidos((prev) => Math.max(prev - 1, 0));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kulima:alerts-updated'));
    }

    try {
      await comunicacaoService.marcarAlertaLido(id);
    } catch (err) {
      console.error('[Alertas] Erro ao marcar como lido:', err);
    }
  };

  // Marcar todos como lidos (Otimista imediato)
  const handleMarcarTodosLidos = async () => {
    setAlertas((prev) => prev.map((a) => ({ ...a, lido: true })));
    setTotalNaoLidos(0);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kulima:alerts-updated'));
    }

    try {
      await comunicacaoService.marcarTodosAlertasLidos();
    } catch (err) {
      console.error('[Alertas] Erro ao marcar todos como lidos:', err);
      sincronizarAlertas(false);
    }
  };

  // Remover alerta (Otimista imediato)
  const handleRemoverAlerta = async (id: string) => {
    const alertaRemovido = alertas.find((a) => a.id === id);
    setAlertas((prev) => prev.filter((a) => a.id !== id));
    if (alertaRemovido && !alertaRemovido.lido) {
      setTotalNaoLidos((prev) => Math.max(prev - 1, 0));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kulima:alerts-updated'));
    }

    try {
      await comunicacaoService.removerAlerta(id);
    } catch (err) {
      console.error('[Alertas] Erro ao remover alerta:', err);
      sincronizarAlertas(false);
    }
  };

  const getAlertaVisual = (tipo: string) => {
    switch (tipo) {
      case 'HUMIDADE_CRITICA':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          badgeVariant: 'muted' as const,
          label: 'Humidade Crítica',
          borderClass: 'border-red-200 bg-red-50/30',
        };
      case 'NOVA_MENSAGEM':
        return {
          icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
          badgeVariant: 'secondary' as const,
          label: 'Nova Mensagem',
          borderClass: 'border-blue-200 bg-blue-50/20',
        };
      case 'NOVA_RECOMENDACAO':
        return {
          icon: <FileText className="w-5 h-5 text-emerald-600" />,
          badgeVariant: 'primary' as const,
          label: 'Recomendação Técnica',
          borderClass: 'border-emerald-200 bg-emerald-50/20',
        };
      case 'PRAGA_REPORTADA':
        return {
          icon: <Bug className="w-5 h-5 text-amber-600" />,
          badgeVariant: 'accent' as const,
          label: 'Praga Reportada',
          borderClass: 'border-amber-200 bg-amber-50/20',
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-secondary" />,
          badgeVariant: 'muted' as const,
          label: 'Aviso do Sistema',
          borderClass: 'border-secondary/20 bg-surface',
        };
    }
  };

  const alertasFiltrados = alertas.filter((a) => {
    if (filtroLido === 'nao_lidos' && a.lido) return false;
    if (filtroTipo !== 'todos' && a.tipo !== filtroTipo) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Painel de Alertas & Notificações"
          description="Registo em tempo real de avisos agronómicos, humidade crítica do solo, recomendações e comunicados."
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
                    <span>Conectando...</span>
                  </>
                )}
              </span>
            </div>
          }
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sincronizarAlertas(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
          {totalNaoLidos > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarcarTodosLidos}
              className="flex items-center gap-1.5 text-xs"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar todos como lidos ({totalNaoLidos})</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Atenção">
          {error}
        </Alert>
      )}

      {/* Barra de Filtros e Categorias Temáticas */}
      <div className="p-4 bg-surface border border-secondary/20 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5 px-1">
              <Filter className="w-3.5 h-3.5 text-secondary" />
              <span>Estado:</span>
            </span>

            <button
              type="button"
              onClick={() => setFiltroLido('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroLido === 'todos'
                  ? 'bg-primary text-surface shadow-xs'
                  : 'text-secondary hover:bg-muted/40 border border-secondary/15'
              }`}
            >
              Todos ({alertas.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroLido('nao_lidos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filtroLido === 'nao_lidos'
                  ? 'bg-accent text-primary shadow-xs'
                  : 'text-secondary hover:bg-muted/40 border border-secondary/15'
              }`}
            >
              <span>Não lidos</span>
              {totalNaoLidos > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {totalNaoLidos}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-secondary/70">
            Exibindo <span className="font-bold text-primary">{alertasFiltrados.length}</span> alerta(s)
          </div>
        </div>

        {/* Separador sutil */}
        <div className="h-px bg-secondary/10 w-full" />

        {/* Chips de Categorias Temáticas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'todos', label: 'Todas as Categorias', icon: Bell, count: alertas.length },
            {
              id: 'HUMIDADE_CRITICA',
              label: 'Humidade Crítica',
              icon: AlertTriangle,
              count: alertas.filter((a) => a.tipo === 'HUMIDADE_CRITICA').length,
            },
            {
              id: 'PRAGA_REPORTADA',
              label: 'Pragas',
              icon: Bug,
              count: alertas.filter((a) => a.tipo === 'PRAGA_REPORTADA').length,
            },
            {
              id: 'NOVA_RECOMENDACAO',
              label: 'Recomendações',
              icon: FileText,
              count: alertas.filter((a) => a.tipo === 'NOVA_RECOMENDACAO').length,
            },
            {
              id: 'NOVA_MENSAGEM',
              label: 'Mensagens',
              icon: MessageSquare,
              count: alertas.filter((a) => a.tipo === 'NOVA_MENSAGEM').length,
            },
            {
              id: 'SISTEMA',
              label: 'Sistema',
              icon: Bell,
              count: alertas.filter((a) => a.tipo === 'SISTEMA').length,
            },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = filtroTipo === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFiltroTipo(cat.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  isSelected
                    ? 'bg-secondary/15 text-primary border border-secondary/30 font-bold'
                    : 'text-secondary/80 hover:text-primary hover:bg-muted/30 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-accent' : 'text-secondary/60'}`} />
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-primary text-surface'
                        : 'bg-secondary/10 text-secondary'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {alertasFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-secondary/20 rounded-2xl space-y-3">
            <Bell className="w-12 h-12 text-secondary/30 mx-auto" />
            <h3 className="font-bold text-sm text-primary">Nenhum alerta encontrado</h3>
            <p className="text-xs text-secondary/70 max-w-sm mx-auto">
              Não há notificações com os filtros selecionados. O sistema gerará alertas automáticos quando ocorrerem novas leituras anómalas, recomendações ou mensagens.
            </p>
          </div>
        ) : (
          alertasFiltrados.map((alerta) => {
            const visual = getAlertaVisual(alerta.tipo);
            const dataFormatada = new Date(alerta.createdAt).toLocaleString([], {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={alerta.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  visual.borderClass
                } ${!alerta.lido ? 'shadow-sm ring-1 ring-accent/30' : 'opacity-85'}`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2.5 rounded-xl bg-surface shadow-xs border border-secondary/15 shrink-0 mt-0.5">
                    {visual.icon}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-primary">{alerta.titulo}</span>
                      <Badge variant={visual.badgeVariant} size="sm" className="text-[10px]">
                        {visual.label}
                      </Badge>
                      {!alerta.lido && (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse"
                          title="Alerta não lido"
                        />
                      )}
                    </div>

                    <p className="text-xs text-secondary/90 leading-relaxed break-words">
                      {alerta.mensagem}
                    </p>

                    <p className="text-[10px] text-secondary/60">{dataFormatada}</p>
                  </div>
                </div>

                {/* Ações do Alerta */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-secondary/10 w-full sm:w-auto justify-end">
                  {alerta.link && (
                    <Link href={alerta.link}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-[11px] h-8 px-3"
                        onClick={() => {
                          if (!alerta.lido) handleMarcarLido(alerta.id);
                        }}
                      >
                        <span>Ver Origem</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}

                  {!alerta.lido && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarcarLido(alerta.id)}
                      title="Marcar como lido"
                      className="flex items-center gap-1 text-[11px] h-8 px-2.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Lido</span>
                    </Button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoverAlerta(alerta.id)}
                    title="Eliminar notificação"
                    className="p-2 text-secondary/60 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
