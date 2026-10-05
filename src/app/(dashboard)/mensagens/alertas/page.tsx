// src/app/(dashboard)/mensagens/alertas/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Badge, Button, Alert } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { comunicacaoService } from '@/features/comunicacao/services/comunicacaoService';
import { AlertaDTO } from '@/features/comunicacao/types';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  FileText,
  Bug,
  Info,
  Check,
  ExternalLink,
  Trash2,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function AlertasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [alertas, setAlertas] = useState<AlertaDTO[]>([]);
  const [totalNaoLidos, setTotalNaoLidos] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroLido, setFiltroLido] = useState<string>('todos'); // 'todos' | 'nao_lidos'
  const [filtroTipo, setFiltroTipo] = useState<string>('todos'); // 'todos' | 'HUMIDADE_CRITICA' | 'NOVA_MENSAGEM' | 'NOVA_RECOMENDACAO' | 'PRAGA_REPORTADA'

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

  // Carregar lista de alertas
  const carregarAlertas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: { lido?: boolean; tipo?: string } = {};
      if (filtroLido === 'nao_lidos') filters.lido = false;
      if (filtroTipo !== 'todos') filters.tipo = filtroTipo;

      const data = await comunicacaoService.getAlertas(filters);
      setAlertas(data.alertas);
      setTotalNaoLidos(data.totalNaoLidos);
    } catch (err) {
      console.error(err);
      setError('Falha ao obter alertas da API.');
    } finally {
      setLoading(false);
    }
  }, [filtroLido, filtroTipo]);

  useEffect(() => {
    if (isAuthenticated) {
      carregarAlertas();

      const interval = setInterval(() => {
        carregarAlertas();
      }, 4000);

      const handleFocus = () => {
        carregarAlertas();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isAuthenticated, carregarAlertas]);

  // Marcar um alerta como lido
  const handleMarcarLido = async (id: string) => {
    try {
      await comunicacaoService.marcarAlertaLido(id);
      setAlertas((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lido: true } : a))
      );
      setTotalNaoLidos((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
      setError('Erro ao marcar alerta como lido.');
    }
  };

  // Marcar todos como lidos
  const handleMarcarTodosLidos = async () => {
    try {
      await comunicacaoService.marcarTodosAlertasLidos();
      setAlertas((prev) => prev.map((a) => ({ ...a, lido: true })));
      setTotalNaoLidos(0);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar alertas.');
    }
  };

  // Remover alerta
  const handleRemoverAlerta = async (id: string) => {
    try {
      await comunicacaoService.removerAlerta(id);
      setAlertas((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError('Erro ao remover o alerta.');
    }
  };

  // Ícone e cores contextuais por tipo de alerta
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

  return (
    <DashboardLayout activeNavId="alerts" user={layoutUser}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Painel de Alertas & Notificações"
            description="Registo em tempo real de avisos agronómicos, humidade crítica do solo, recomendações e comunicados."
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={carregarAlertas}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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

        {/* Barra de Filtros Rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-secondary/20 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-primary flex items-center gap-1 px-2">
              <Filter className="w-3.5 h-3.5 text-secondary" />
              <span>Filtros:</span>
            </span>

            {/* Filtro de Leitura */}
            <button
              type="button"
              onClick={() => setFiltroLido('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filtroLido === 'todos'
                  ? 'bg-primary text-surface'
                  : 'text-secondary hover:bg-muted/40'
              }`}
            >
              Todos ({alertas.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroLido('nao_lidos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filtroLido === 'nao_lidos'
                  ? 'bg-accent text-primary'
                  : 'text-secondary hover:bg-muted/40'
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

          {/* Filtro por Categoria */}
          <div className="flex items-center gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-muted/20 border border-secondary/20 rounded-xl px-3 py-1.5 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="HUMIDADE_CRITICA">Humidade Crítica</option>
              <option value="NOVA_MENSAGEM">Novas Mensagens</option>
              <option value="NOVA_RECOMENDACAO">Recomendações Técnicas</option>
              <option value="PRAGA_REPORTADA">Ocorrências de Pragas</option>
              <option value="SISTEMA">Avisos do Sistema</option>
            </select>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-xs text-secondary space-y-2">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p>A sincronizar alertas...</p>
            </div>
          ) : alertas.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-secondary/20 rounded-2xl space-y-3">
              <Bell className="w-12 h-12 text-secondary/30 mx-auto" />
              <h3 className="font-bold text-sm text-primary">Nenhum alerta encontrado</h3>
              <p className="text-xs text-secondary/70 max-w-sm mx-auto">
                Não há notificações com os filtros selecionados. O sistema gerará alertas automáticos quando ocorrerem novas leituras anómalas, recomendações ou mensagens.
              </p>
            </div>
          ) : (
            alertas.map((alerta) => {
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
                          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" title="Alerta não lido" />
                        )}
                      </div>

                      <p className="text-xs text-secondary/90 leading-relaxed break-words">
                        {alerta.mensagem}
                      </p>

                      <p className="text-[10px] text-secondary/60">
                        {dataFormatada}
                      </p>
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
    </DashboardLayout>
  );
}