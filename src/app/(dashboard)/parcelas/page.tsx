'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Alert, Badge } from '@/components/ui';
import { AuthUser, USER_ROLES_INFO, UserRole } from '@/types/auth';
import { can } from '@/utils/permissions';
import { authService } from '@/features/auth/services/authService';
import {
  useParcelas,
  ParcelaCard,
  ParcelaListTable,
  ParcelaFilters,
  ParcelaDeleteDialog,
  ParcelaListItem,
} from '@/features/parcelas';
import { Layers, Plus, ArrowLeft, RefreshCw, Info } from 'lucide-react';

const DEMO_USERS: Record<UserRole, AuthUser> = {
  ADMIN: {
    id: 'usr-admin-01',
    name: 'Alberto Nhantumbo',
    email: 'alberto.nhantumbo@kulimatech.gov.mz',
    role: 'ADMIN',
    province: 'Sofala',
    district: 'Sede Provincial (Beira / Nhamatanda)',
  },
  TECNICO_SDAE: {
    id: 'usr-tech-01',
    name: 'Eng. António Langa',
    email: 'antonio.langa@sdae.gov.mz',
    role: 'TECNICO_SDAE',
    province: 'Sofala',
    district: 'Nhamatanda (Posto de Tica)',
    assignedFarmerIds: ['usr-farm-01', 'usr-farm-02'],
  },
  AGRICULTOR: {
    id: 'usr-farm-01',
    name: 'Mateus Cossa',
    email: 'mateus.cossa@agri.mz',
    role: 'AGRICULTOR',
    province: 'Sofala',
    district: 'Nhamatanda (Lamego)',
    assignedTechnicianId: 'usr-tech-01',
  },
};

export default function ParcelasPage() {
  const [activeRole, setActiveRole] = useState<UserRole>('AGRICULTOR');
  const [activeNavId, setActiveNavId] = useState<string>('my-parcels');
  const [authenticatedName, setAuthenticatedName] = useState<string | null>(null);

  // Sincronização com sessão real de utilizador
  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored) {
      setAuthenticatedName(stored.nome);
      if (stored.role === 'TECNICO') {
        setActiveRole('TECNICO_SDAE');
        setActiveNavId('parcels-monitoring');
      } else if (stored.role === 'ADMIN') {
        setActiveRole('ADMIN');
      } else if (stored.role === 'AGRICULTOR') {
        setActiveRole('AGRICULTOR');
        setActiveNavId('my-parcels');
      }
    }
  }, []);

  const baseUser = DEMO_USERS[activeRole];
  const currentUser: AuthUser = {
    ...baseUser,
    name: authenticatedName && baseUser.role === activeRole ? authenticatedName : baseUser.name,
  };

  const isAgricultor = activeRole === 'AGRICULTOR';

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
    userRole: activeRole,
    userId: currentUser.id,
  });

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setActiveNavId(role === 'AGRICULTOR' ? 'my-parcels' : role === 'TECNICO_SDAE' ? 'parcels-monitoring' : 'dashboard');
  };

  return (
    <DashboardLayout user={currentUser} activeNavId={activeNavId} onSelectNavId={setActiveNavId}>
      <div className="space-y-6">
        {/* Barra Superior de Perfil & Simulador RBAC (F1 / F2) */}
        <div className="bg-gradient-to-r from-[#002626] to-[#0e4749] p-4 sm:p-5 rounded-lg shadow-md text-[#FEFAE0] border border-[#95c623]/25">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard" className="text-[11px] font-bold text-[#95c623] hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  <span>Voltar ao Painel Geral</span>
                </Link>
                <span className="text-surface/40">•</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#95c623]">
                  Módulo F2 • Gestão de Parcelas
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Parcelas Agrícolas do Distrito de Nhamatanda
              </h1>
              <p className="text-xs sm:text-sm text-[#FEFAE0]/80">
                Gira as suas parcelas ou consulte os talhões dos agricultores acompanhados na província de Sofala.
              </p>
            </div>

            {/* Alternador de Perfil Ativo */}
            <div className="flex flex-wrap items-center gap-2 bg-black/25 p-1.5 rounded-md border border-white/10">
              {(['AGRICULTOR', 'TECNICO_SDAE', 'ADMIN'] as UserRole[]).map((r) => {
                const info = USER_ROLES_INFO[r];
                const isSelected = activeRole === r;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#95c623] text-[#002626] shadow-sm scale-105'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#002626]' : 'bg-white/40'}`} />
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mensagem Informativa de Regras por Perfil */}
        {isAgricultor ? (
          <Alert variant="info" title="Visão do Agricultor">
            Está a consultar as suas parcelas registadas em Nhamatanda. Pode registar novos talhões, editar hectares ou atualizar informações de solo.
          </Alert>
        ) : activeRole === 'TECNICO_SDAE' ? (
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
              <h2 className="text-xl font-bold text-[#002626]">
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
              className="text-xs gap-1.5 bg-white hover:bg-surface border-[#8eb69b]/40 text-[#002626]"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            {can(currentUser, 'create', 'parcels') && (
              <Link href="/parcelas/novo">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="bg-[#002626] hover:bg-[#0e4749] text-white font-extrabold text-xs gap-1.5 shadow-sm rounded-md"
                >
                  <Plus className="w-4 h-4 text-[#95c623]" />
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
          userRole={activeRole}
        />

        {error && (
          <Alert variant="warning" title="Aviso de Dados">
            {error}
          </Alert>
        )}

        {/* Área de Conteúdo da Listagem */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-lg border border-[#8eb69b]/30">
            <div className="w-8 h-8 rounded-full border-2 border-[#002626] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#002626]">A carregar parcelas de Nhamatanda...</p>
          </div>
        ) : filteredCount === 0 ? (
          <div className="py-16 px-6 text-center space-y-4 bg-[#e6efe8]/40 rounded-lg border border-[#8eb69b]/40">
            <div className="w-14 h-14 rounded-md bg-[#002626] text-[#95c623] flex items-center justify-center mx-auto shadow-sm">
              <Layers className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-[#002626]">Nenhuma parcela encontrada</h3>
              <p className="text-xs text-secondary/70">
                Não foram encontradas parcelas agrícolas que correspondam aos filtros selecionados.
              </p>
            </div>
            {isAgricultor && (
              <Link href="/parcelas/novo" className="inline-block pt-2">
                <Button variant="primary" size="sm" className="bg-[#002626] text-white font-extrabold gap-2 rounded-md">
                  <Plus className="w-4 h-4 text-[#95c623]" />
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
                userRole={activeRole}
                onDelete={isAgricultor ? setDeletingParcela : undefined}
              />
            ))}
          </div>
        ) : (
          <ParcelaListTable
            parcelas={parcelas}
            userRole={activeRole}
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