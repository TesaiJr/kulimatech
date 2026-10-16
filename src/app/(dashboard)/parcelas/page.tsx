'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button, Alert, Badge } from '@/components/ui';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  useParcelas,
  ParcelaCard,
  ParcelaListTable,
  ParcelaFilters,
  ParcelaDeleteDialog,
  ParcelaListItem,
} from '@/features/parcelas';
import { Layers, Plus, ArrowLeft, RefreshCw, Info, ShieldCheck } from 'lucide-react';

export default function ParcelasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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
  const isAgricultor = role === 'AGRICULTOR';
  const activeNavId = isAgricultor ? 'my-parcels' : role === 'TECNICO_SDAE' ? 'parcels-monitoring' : 'parcels';

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: roleInfo.label,
      }
    : undefined;

  const {
    parcelas,
    totalCount,
    filteredCount,
    loading,
    error,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedSolo,
    setSelectedSolo,
    selectedAgricultorId,
    setSelectedAgricultorId,
    agricultoresOptions,
    deletingParcela,
    setDeletingParcela,
    isDeleting,
    handleDeleteConfirm,
    refresh,
  } = useParcelas({
    userRole: role,
    userId: user?.id,
  });

  return (
    <DashboardLayout user={layoutUser} activeNavId={activeNavId}>
      <div className="space-y-6">
        {/* Barra Superior Contextualizada com Sessão Real */}
        <div className="bg-gradient-to-r from-primary to-secondary p-5 rounded-2xl shadow-md text-surface border border-accent/25">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/dashboard"
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Voltar ao Painel Geral</span>
                </Link>
                <span className="text-white/40">•</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                  Módulo de Parcelas Agrícolas
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Parcelas Agrícolas • Distrito de Nhamatanda
              </h1>
              <p className="text-xs sm:text-sm text-white/80">
                {isAgricultor
                  ? 'Gira as suas parcelas e registe as características do solo dos seus talhões em Sofala.'
                  : 'Consulte e acompanhe as parcelas dos produtores familiares cadastrados no SDAE.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-right">
                <span className="text-[10px] text-white/60 uppercase block font-semibold">Perfil Ativo</span>
                <Badge variant={roleInfo.badgeVariant} size="sm">
                  {roleInfo.label}
                </Badge>
              </div>
              {isAgricultor && (
                <Link href="/parcelas/novo">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    Nova Parcela
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem Informativa de Regras por Perfil */}
        {isAgricultor ? (
          <Alert variant="info" title="Visão do Agricultor">
            Está a consultar as suas parcelas registadas em Nhamatanda. Pode registar novos talhões, editar hectares ou atualizar informações de solo.
          </Alert>
        ) : role === 'TECNICO_SDAE' ? (
          <Alert variant="success" title="Visão do Técnico SDAE">
            Está a acompanhar as parcelas dos agricultores atribuídos à sua carteira técnica. Utilize os filtros para localizar talhões específicos de Tica ou Lamego.
          </Alert>
        ) : (
          <Alert variant="warning" title="Visão de Administrador (Sem Edição Operacional)">
            Visão consolidada do sistema. O administrador não intervém diretamente no cadastro de parcelas dos agricultores.
          </Alert>
        )}

        {/* Cabeçalho de Ações da Lista */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-primary">
                {isAgricultor ? 'As Minhas Parcelas Registadas' : 'Parcelas em Acompanhamento'}
              </h2>
              <Badge variant="accent" size="sm" className="font-mono font-bold">
                {filteredCount} de {totalCount}
              </Badge>
            </div>
            <p className="text-xs text-secondary/70">
              Total de área monitorada e caracterização agronómica do solo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              className="text-xs gap-1.5 bg-white hover:bg-surface border-muted/40 text-primary"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            {isAgricultor && (
              <Link href="/parcelas/novo">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="bg-primary hover:bg-secondary text-white font-extrabold text-xs gap-1.5 shadow-sm rounded-md"
                >
                  <Plus className="w-4 h-4 text-accent" />
                  <span>+ Nova Parcela</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Barra de Filtros & Alternador de Modo de Exibição */}
        <ParcelaFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSolo={selectedSolo}
          onSoloChange={setSelectedSolo}
          selectedAgricultorId={selectedAgricultorId}
          onAgricultorChange={setSelectedAgricultorId}
          agricultoresOptions={agricultoresOptions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          userRole={role}
        />

        {error && (
          <Alert variant="warning" title="Aviso de Dados">
            {error}
          </Alert>
        )}

        {/* Área de Conteúdo da Listagem */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-lg border border-muted/30">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-primary">A carregar parcelas de Nhamatanda...</p>
          </div>
        ) : filteredCount === 0 ? (
          <div className="py-16 px-6 text-center space-y-4 bg-muted/15 rounded-lg border border-muted/40">
            <div className="w-14 h-14 rounded-md bg-primary text-accent flex items-center justify-center mx-auto shadow-sm">
              <Layers className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-primary">Nenhuma parcela encontrada</h3>
              <p className="text-xs text-secondary/70">
                Não foram encontradas parcelas agrícolas que correspondam aos filtros selecionados.
              </p>
            </div>
            {isAgricultor && (
              <Link href="/parcelas/novo" className="inline-block pt-2">
                <Button variant="primary" size="sm" className="bg-primary text-white font-extrabold gap-2 rounded-md">
                  <Plus className="w-4 h-4 text-accent" />
                  <span>Cadastrar Primeira Parcela</span>
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {parcelas.map((parcela: ParcelaListItem) => (
              <ParcelaCard
                key={parcela.id}
                parcela={parcela}
                userRole={role}
                onDelete={isAgricultor ? setDeletingParcela : undefined}
              />
            ))}
          </div>
        ) : (
          <ParcelaListTable
            parcelas={parcelas}
            userRole={role}
            onDelete={isAgricultor ? setDeletingParcela : undefined}
          />
        )}

        {/* Modal de Confirmação de Eliminação */}
        <ParcelaDeleteDialog
          parcela={deletingParcela}
          isOpen={Boolean(deletingParcela)}
          onClose={() => setDeletingParcela(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}