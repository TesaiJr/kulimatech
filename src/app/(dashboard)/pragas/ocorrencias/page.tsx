// src/app/(dashboard)/pragas/ocorrencias/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Alert, Badge } from '@/components/ui';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { parcelaService } from '@/features/parcelas/services/parcelaService';
import { pragaService } from '@/features/pragas/services/pragaService';
import {
  useOcorrencias,
  OcorrenciaStatsCards,
  OcorrenciaListTable,
  OcorrenciaFormModal,
  OcorrenciaResolutionModal,
  OcorrenciaPragaDTO,
  PragaDTO,
} from '@/features/pragas';
import {
  Bug,
  Plus,
  RefreshCw,
  Search,
  X,
  BookOpen,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';

function OcorrenciasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialParcelaId = searchParams.get('parcelaId') || undefined;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [parcelas, setParcelas] = useState<{ id: string; nome: string }[]>([]);
  const [pragas, setPragas] = useState<PragaDTO[]>([]);

  // Modais
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedOcorrenciaResolve, setSelectedOcorrenciaResolve] =
    useState<OcorrenciaPragaDTO | null>(null);

  // Aba ativa: 'TODOS' | 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA'
  const [activeTab, setActiveTab] = useState<string>('TODOS');

  const {
    ocorrencias,
    estatisticas,
    loading,
    actionLoading,
    error,
    refresh,
    createOcorrencia,
    resolverOcorrencia,
    selectedStatus,
    setSelectedStatus,
    selectedSeveridade,
    setSelectedSeveridade,
    selectedParcelaId,
    setSelectedParcelaId,
    searchQuery,
    setSearchQuery,
  } = useOcorrencias(initialParcelaId);

  // Redirecionamento se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Carregar dados de apoio (parcelas e pragas)
  useEffect(() => {
    if (isAuthenticated) {
      parcelaService
        .getParcelas()
        .then((items) => setParcelas(items.map((p) => ({ id: p.id, nome: p.nome }))))
        .catch(() => {});

      pragaService
        .getPragas()
        .then((items) => setPragas(items))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const role: UserRole =
    user?.role === 'TECNICO'
      ? 'TECNICO_SDAE'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'AGRICULTOR';

  const roleInfo = USER_ROLES_INFO[role];
  const canResolve = role === 'TECNICO_SDAE' || role === 'ADMIN';

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    setSelectedStatus(status);
  };

  const handleResetFilters = () => {
    setSelectedParcelaId('TODOS');
    setSelectedSeveridade('TODOS');
    setSelectedStatus('TODOS');
    setSearchQuery('');
    setActiveTab('TODOS');
  };

  return (
    <DashboardLayout user={layoutUser} activeNavId="pests">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <PageHeader
          title="Gestão de Ocorrências Fitossanitárias"
          description={
            role === 'AGRICULTOR'
              ? 'Reporte sintomas ou pragas observadas nas suas parcelas para assistência rápida do SDAE.'
              : 'Triagem agronómica, diagnóstico no campo e resolução de ocorrências fitossanitárias.'
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>

              <Link href="/pragas">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Catálogo de Pragas
                </Button>
              </Link>

              <Button
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Nova Ocorrência
              </Button>
            </div>
          }
        />

        {/* Alerta de erro */}
        {error && (
          <Alert variant="error" title="Erro em Ocorrências">
            {error}
          </Alert>
        )}

        {/* Cartões de Estatísticas */}
        <OcorrenciaStatsCards stats={estatisticas} loading={loading} />

        {/* Abas de Status Operacional */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {[
            { id: 'TODOS', label: 'Todas as Ocorrências', icon: Bug, count: estatisticas?.total },
            {
              id: 'ABERTA',
              label: 'Abertas',
              icon: AlertTriangle,
              count: estatisticas?.abertas,
              badgeClass: 'bg-amber-500 text-white',
            },
            {
              id: 'EM_ANALISE',
              label: 'Em Análise',
              icon: Clock,
              count: estatisticas?.emAnalise,
              badgeClass: 'bg-blue-500 text-white',
            },
            {
              id: 'RESOLVIDA',
              label: 'Resolvidas',
              icon: CheckCircle2,
              count: estatisticas?.resolvidas,
              badgeClass: 'bg-emerald-600 text-white',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-extrabold rounded-full ${
                      tab.badgeClass || 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por parcela, agricultor, praga ou parecer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors self-start md:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              Limpar Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-50">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Parcela Agrícola
              </label>
              <select
                value={selectedParcelaId}
                onChange={(e) => setSelectedParcelaId(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
              >
                <option value="TODOS">Todas as Parcelas</option>
                {parcelas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Severidade
              </label>
              <select
                value={selectedSeveridade}
                onChange={(e) => setSelectedSeveridade(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
              >
                <option value="TODOS">Todas as Severidades</option>
                <option value="BAIXA">🟢 Baixa</option>
                <option value="MEDIA">🟡 Média</option>
                <option value="ALTA">🟠 Alta</option>
                <option value="CRITICA">🔴 Crítica</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Ocorrências */}
        <OcorrenciaListTable
          ocorrencias={ocorrencias}
          loading={loading}
          canResolve={canResolve}
          onOpenResolveModal={(oco) => setSelectedOcorrenciaResolve(oco)}
        />

        {/* Modal de Reporte de Ocorrência */}
        <OcorrenciaFormModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={createOcorrencia}
          parcelas={parcelas}
          pragas={pragas}
          loading={actionLoading}
        />

        {/* Modal de Resolução e Parecer do Técnico */}
        <OcorrenciaResolutionModal
          isOpen={!!selectedOcorrenciaResolve}
          onClose={() => setSelectedOcorrenciaResolve(null)}
          ocorrencia={selectedOcorrenciaResolve}
          onResolve={resolverOcorrencia}
          loading={actionLoading}
        />
      </div>
    </DashboardLayout>
  );
}

export default function OcorrenciasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OcorrenciasContent />
    </Suspense>
  );
}