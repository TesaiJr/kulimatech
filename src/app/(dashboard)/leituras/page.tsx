// src/app/(dashboard)/leituras/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Alert, Badge } from '@/components/ui';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { parcelaService } from '@/features/parcelas/services/parcelaService';
import {
  useLeituras,
  LeituraStatsCards,
  LeituraFilters,
  LeituraListTable,
  LeituraFormModal,
  ValidarLeituraModal,
  LeituraSoloDTO,
} from '@/features/leituras';
import {
  Plus,
  RefreshCw,
  Droplets,
  Clock,
  ListFilter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

function LeiturasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialParcelaId = searchParams.get('parcelaId') || undefined;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [parcelas, setParcelas] = useState<{ id: string; nome: string }[]>([]);

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [selectedLeituraValidar, setSelectedLeituraValidar] = useState<LeituraSoloDTO | null>(null);

  // Aba ativa: 'todas' | 'pendentes'
  const [activeTab, setActiveTab] = useState<'todas' | 'pendentes'>('todas');

  const {
    leituras,
    estatisticas,
    loading,
    actionLoading,
    error,
    refresh,
    createLeitura,
    validarLeitura,
    selectedParcelaId,
    setSelectedParcelaId,
    selectedValidado,
    setSelectedValidado,
    selectedStatusHumidade,
    setSelectedStatusHumidade,
    searchQuery,
    setSearchQuery,
  } = useLeituras(initialParcelaId);

  // Redirecionamento se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Carregar lista de parcelas para os seletores
  useEffect(() => {
    if (isAuthenticated) {
      parcelaService
        .getParcelas()
        .then((items) => {
          setParcelas(items.map((p) => ({ id: p.id, nome: p.nome })));
        })
        .catch(() => {
          // fallback silencioso
        });
    }
  }, [isAuthenticated]);

  const role: UserRole =
    user?.role === 'TECNICO'
      ? 'TECNICO_SDAE'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'AGRICULTOR';

  const roleInfo = USER_ROLES_INFO[role];
  const canValidate = role === 'TECNICO_SDAE' || role === 'ADMIN';

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  // Sincronizar aba com filtro de validação
  const handleTabChange = (tab: 'todas' | 'pendentes') => {
    setActiveTab(tab);
    if (tab === 'pendentes') {
      setSelectedValidado('false');
    } else {
      setSelectedValidado('all');
    }
  };

  const handleResetFilters = () => {
    setSelectedParcelaId('TODOS');
    setSelectedValidado('all');
    setSelectedStatusHumidade('TODOS');
    setSearchQuery('');
    setActiveTab('todas');
  };

  return (
    <DashboardLayout user={layoutUser} activeNavId="readings">
      <div className="space-y-6">
        {/* Cabeçalho da Página */}
        <PageHeader
          title="Leituras de Humidade do Solo"
          description={
            role === 'AGRICULTOR'
              ? 'Registo e acompanhamento agronómico das condições hídricas das suas parcelas.'
              : 'Validação técnica e monitorização dos níveis de humidade da carteira agrícola.'
          }
          actions={
            <div className="flex items-center gap-2">
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

              <Button
                size="sm"
                onClick={() => setIsFormModalOpen(true)}
                className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nova Leitura de Humidade
              </Button>
            </div>
          }
        />

        {/* Alerta de erro */}
        {error && (
          <Alert variant="error" title="Erro no Módulo de Leituras">
            {error}
          </Alert>
        )}

        {/* Cartões Estatísticos */}
        <LeituraStatsCards stats={estatisticas} loading={loading} />

        {/* Abas Operacionais */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => handleTabChange('todas')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'todas'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Droplets className="w-4 h-4" />
            Todas as Leituras
          </button>

          {canValidate && (
            <button
              onClick={() => handleTabChange('pendentes')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'pendentes'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              Pendentes de Validação
              {estatisticas && estatisticas.pendentesValidacao > 0 && (
                <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-amber-500 text-white">
                  {estatisticas.pendentesValidacao}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filtros e Barra de Pesquisa */}
        <LeituraFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedParcelaId={selectedParcelaId}
          onParcelaChange={setSelectedParcelaId}
          selectedValidado={selectedValidado}
          onValidadoChange={(val) => {
            setSelectedValidado(val);
            if (val === 'false') setActiveTab('pendentes');
            else if (val === 'all') setActiveTab('todas');
          }}
          selectedStatusHumidade={selectedStatusHumidade}
          onStatusHumidadeChange={setSelectedStatusHumidade}
          parcelasDisponiveis={parcelas}
          onReset={handleResetFilters}
        />

        {/* Tabela de Leituras */}
        <LeituraListTable
          leituras={leituras}
          loading={loading}
          canValidate={canValidate}
          onOpenValidarModal={(leitura) => setSelectedLeituraValidar(leitura)}
        />

        {/* Modal de Nova Leitura */}
        <LeituraFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={createLeitura}
          parcelas={parcelas}
          defaultParcelaId={selectedParcelaId !== 'TODOS' ? selectedParcelaId : undefined}
          loading={actionLoading}
        />

        {/* Modal de Validação Técnica */}
        <ValidarLeituraModal
          isOpen={!!selectedLeituraValidar}
          onClose={() => setSelectedLeituraValidar(null)}
          leitura={selectedLeituraValidar}
          onValidar={validarLeitura}
          loading={actionLoading}
        />
      </div>
    </DashboardLayout>
  );
}

export default function LeiturasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeiturasContent />
    </Suspense>
  );
}