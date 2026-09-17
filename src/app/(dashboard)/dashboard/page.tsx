'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Alert } from '@/components/ui';
import { AuthUser, USER_ROLES_INFO, UserRole } from '@/types/auth';
import { can } from '@/utils/permissions';
import { authService } from '@/features/auth/services/authService';
import Link from 'next/link';

// Usuários de demonstração para simulação dos 3 perfis F1 (Distrito de Nhamatanda / Sofala)
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

export default function DashboardPage() {
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');
  const [activeNavId, setActiveNavId] = useState<string>('dashboard');
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [authenticatedName, setAuthenticatedName] = useState<string | null>(null);

  // Sincronizar com a sessão real do utilizador autenticado
  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored) {
      setAuthenticatedName(stored.nome);
      if (stored.role === 'TECNICO') {
        setActiveRole('TECNICO_SDAE');
      } else if (stored.role === 'ADMIN') {
        setActiveRole('ADMIN');
      } else if (stored.role === 'AGRICULTOR') {
        setActiveRole('AGRICULTOR');
      }
    }
  }, []);

  const baseUser = DEMO_USERS[activeRole];
  const currentUser: AuthUser = {
    ...baseUser,
    name: authenticatedName && baseUser.role === activeRole ? authenticatedName : baseUser.name,
  };
  const roleInfo = USER_ROLES_INFO[activeRole];

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setActiveNavId('dashboard');
    setValidationSuccess(null);
  };

  return (
    <DashboardLayout
      user={currentUser}
      activeNavId={activeNavId}
      onSelectNavId={setActiveNavId}
    >
      {/* Barra de Navegação Rápida & Simulador de Perfis (F1) */}
      <div className="bg-gradient-to-r from-secondary to-primary p-4 sm:p-5 rounded-3xl shadow-xl text-surface border border-accent/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
              >
                ← Voltar à Landing Page
              </Link>
              <span className="text-surface/40">•</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#95C623]">
                F1 • Perfis de Acesso (RBAC)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-surface tracking-tight">
              Ambiente Operacional KulimaTech • Nhamatanda
            </h1>
            <p className="text-xs sm:text-sm text-surface/80">
              Alterne o perfil ativo para experimentar a segregação de permissões e navegação contextualizada.
            </p>
          </div>

          {/* Botões de Seleção de Perfil */}
          <div className="flex flex-wrap items-center gap-2 bg-black/25 p-1.5 rounded-2xl border border-white/10">
            {(['ADMIN', 'TECNICO_SDAE', 'AGRICULTOR'] as UserRole[]).map((r) => {
              const info = USER_ROLES_INFO[r];
              const isSelected = activeRole === r;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-accent text-primary shadow-lg scale-105'
                      : 'text-surface/80 hover:text-surface hover:bg-white/10'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-surface/40'}`} />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Banner de Contexto do Perfil Atual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card variant="surface" className="h-full border-l-4 border-l-accent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary/70">
                  Perfil em Execução
                </span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <h2 className="text-2xl font-black text-primary">{roleInfo.label}</h2>
                  <Badge variant={roleInfo.badgeVariant} size="sm">
                    {activeRole}
                  </Badge>
                </div>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-secondary/60">Território / Jurisdição</span>
                <p className="text-sm font-bold text-primary">
                  {currentUser.district} • {currentUser.province}
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary/90 leading-relaxed mb-4">
              {roleInfo.description}
            </p>

            {/* Alerta de Restrição Estrita de Acordo com F1 */}
            {activeRole === 'ADMIN' && (
              <Alert variant="warning" title="Isolamento de Dados Operacionais (F1)">
                O Administrador <strong>não intervém nem visualiza directamente</strong> dados operacionais
                de parcelas agrícolas, leituras diárias de humidade, recomendações agronómicas ou mensagens entre técnicos e agricultores.
              </Alert>
            )}

            {activeRole === 'TECNICO_SDAE' && (
              <Alert variant="info" title="Escopo Distrital Restrito (SDAE Nhamatanda)">
                O Técnico SDAE acompanha <strong>exclusivamente</strong> os agricultores e parcelas formalmente
                associados à sua carteira técnica ({currentUser.assignedFarmerIds?.length || 0} agricultores na zona de {currentUser.district}).
              </Alert>
            )}

            {activeRole === 'AGRICULTOR' && (
              <Alert variant="success" title="Autonomia & Suporte Técnico">
                O Agricultor gere as suas próprias parcelas e leituras de solo, recebendo acompanhamento direto do técnico responsável credenciado ({DEMO_USERS.TECNICO_SDAE.name}).
              </Alert>
            )}
          </Card>
        </div>

        {/* Resumo da Matriz RBAC em Tempo Real */}
        <div>
          <Card variant="dark" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <h3 className="font-bold text-sm text-surface uppercase tracking-wider">
                  Auditoria de Permissões
                </h3>
                <span className="text-[10px] font-mono text-accent">Motor can()</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-surface/80">Gerir Contas & Utilizadores</span>
                  {can(currentUser, 'create', 'users') ? (
                    <Badge variant="accent" size="sm">Permitido</Badge>
                  ) : (
                    <Badge variant="muted" size="sm">Bloqueado</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-surface/80">Editar Catálogos Mestres</span>
                  {can(currentUser, 'create', 'catalogs') ? (
                    <Badge variant="accent" size="sm">Permitido</Badge>
                  ) : (
                    <Badge variant="muted" size="sm">Apenas Consulta</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-surface/80">Gerir Parcelas Agrícolas</span>
                  {can(currentUser, 'create', 'parcels') ? (
                    <Badge variant="accent" size="sm">Permitido (Próprias)</Badge>
                  ) : can(currentUser, 'read', 'parcels') ? (
                    <Badge variant="secondary" size="sm">Consulta (Associados)</Badge>
                  ) : (
                    <Badge variant="muted" size="sm">Bloqueado</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-surface/80">Validar Leituras de Humidade</span>
                  {can(currentUser, 'validate', 'moisture_readings') ? (
                    <Badge variant="accent" size="sm">Permitido</Badge>
                  ) : (
                    <Badge variant="muted" size="sm">Bloqueado</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-surface/80">Emitir Recomendações</span>
                  {can(currentUser, 'create', 'recommendations') ? (
                    <Badge variant="accent" size="sm">Permitido</Badge>
                  ) : (
                    <Badge variant="muted" size="sm">Bloqueado</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-surface/60 flex items-center justify-between">
              <span>Status RBAC:</span>
              <span className="font-mono text-accent">F1 Conforme</span>
            </div>
          </Card>
        </div>
      </div>

      {validationSuccess && (
        <Alert variant="success" onClose={() => setValidationSuccess(null)}>
          {validationSuccess}
        </Alert>
      )}

      {/* 1. VISÃO DO ADMINISTRADOR */}
      {activeRole === 'ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Contas no Sistema</span>
              <p className="text-3xl font-black text-primary mt-1">48</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary/80">
                <span className="font-bold text-accent bg-primary px-1.5 py-0.5 rounded">12</span> Técnicos SDAE
                <span className="mx-1">•</span>
                <span className="font-bold text-accent bg-primary px-1.5 py-0.5 rounded">34</span> Agricultores
              </div>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Catálogo de Culturas</span>
              <p className="text-3xl font-black text-primary mt-1">18</p>
              <p className="mt-2 text-xs text-secondary/80">Milho, Feijão Bóer, Mandioca, Tomate...</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Catálogo de Pragas</span>
              <p className="text-3xl font-black text-primary mt-1">26</p>
              <p className="mt-2 text-xs text-secondary/80">Fichas com sintomas e profilaxia</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Distrito Alvo</span>
              <p className="text-3xl font-black text-primary mt-1">Nhamatanda</p>
              <p className="mt-2 text-xs text-secondary/80">Província de Sofala • Moçambique</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestão de Utilizadores & Vínculos</CardTitle>
                    <CardDescription>
                      Atribuição de agricultores aos técnicos distritais do SDAE Nhamatanda
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="primary">
                    + Novo Utilizador
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">Eng. António Langa</p>
                      <p className="text-xs text-secondary/70">Técnico SDAE • Posto de Tica / Nhamatanda</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">2 Agricultores Vinculados</Badge>
                      <Button size="sm" variant="outline">Gerir Vínculo</Button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">Dra. Amélia Sitoe</p>
                      <p className="text-xs text-secondary/70">Técnica SDAE • Lamego / Nhamatanda</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">4 Agricultores Vinculados</Badge>
                      <Button size="sm" variant="outline">Gerir Vínculo</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Catálogos de Referência Agronómica</CardTitle>
                    <CardDescription>
                      Parametrização mestra de culturas e catálogo fitossanitário de Sofala
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="secondary">
                    + Adicionar Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">Milho (Zea mays)</p>
                      <p className="text-xs text-secondary/70">Necessidade hídrica: 500 - 800 mm • Ciclo: 120 dias</p>
                    </div>
                    <Badge variant="accent" size="sm">Cultura Base</Badge>
                  </div>

                  <div className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">Lagarta-do-funil (Spodoptera frugiperda)</p>
                      <p className="text-xs text-secondary/70">Ficha técnica fitossanitária com medidas integradas</p>
                    </div>
                    <Badge variant="secondary" size="sm">Praga Crítica</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. VISÃO DO TÉCNICO SDAE */}
      {activeRole === 'TECNICO_SDAE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Agricultores Associados</span>
              <p className="text-3xl font-black text-primary mt-1">2</p>
              <p className="mt-2 text-xs text-secondary/80">Distrito de Nhamatanda</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Parcelas Monitoradas</span>
              <p className="text-3xl font-black text-primary mt-1">4</p>
              <p className="mt-2 text-xs text-secondary/80">Área total: 6.8 hectares</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Validações Pendentes</span>
              <p className="text-3xl font-black text-accent mt-1">1</p>
              <p className="mt-2 text-xs text-secondary/80">Leitura de humidade do solo</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Ocorrências de Pragas</span>
              <p className="text-3xl font-black text-yellow-600 mt-1">1</p>
              <p className="mt-2 text-xs text-secondary/80">Reporte em análise (Lamego)</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="surface">
              <CardHeader>
                <CardTitle>Fila de Validação: Humidade do Solo</CardTitle>
                <CardDescription>
                  Leituras submetidas pelos agricultores associados que requerem parecer técnico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-2xl border border-secondary/20 bg-surface/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">Mateus Cossa (Parcela Lamego 1)</p>
                      <p className="text-xs text-secondary/70">Cultura: Tomate • Solo Franco-Argiloso</p>
                    </div>
                    <Badge variant="accent" size="sm">Pendente</Badge>
                  </div>

                  <div className="p-3 bg-white/40 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-secondary/70 block">Leitura Registada</span>
                      <span className="font-black text-base text-primary">38% (Humidade Adequada)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-secondary/70 block">Data/Hora</span>
                      <span className="font-semibold text-primary">Hoje, 07:30</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setValidationSuccess('Leitura de 38% validada com sucesso pelo Técnico SDAE.')}
                    >
                      Validar Leitura
                    </Button>
                    <Button size="sm" variant="outline">
                      Emitir Ajuste de Rega
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="surface">
              <CardHeader>
                <CardTitle>Ocorrências de Pragas Reportadas</CardTitle>
                <CardDescription>
                  Suspeitas fitossanitárias submetidas para acompanhamento técnico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">Suspeita: Lagarta nas folhas do Milho</p>
                      <p className="text-xs text-secondary/70">Reportado por Mateus Cossa • Parcela Lamego 2</p>
                    </div>
                    <Badge variant="secondary" size="sm">Aguardando Orientação</Badge>
                  </div>

                  <p className="text-xs text-secondary/90 bg-white/50 p-2.5 rounded-lg italic">
                    "Identifiquei folhas perfuradas no centro do cartucho em Nhamatanda."
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setValidationSuccess('Orientação técnica enviada ao agricultor Mateus Cossa.')}
                    >
                      Responder ao Agricultor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 3. VISÃO DO AGRICULTOR */}
      {activeRole === 'AGRICULTOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">As Minhas Parcelas</span>
              <p className="text-3xl font-black text-primary mt-1">2</p>
              <p className="mt-2 text-xs text-secondary/80">Lamego 1 (2.5 ha) e Lamego 2 (1.0 ha)</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Humidade Atual do Solo</span>
              <p className="text-3xl font-black text-primary mt-1">38%</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-primary">Nível Óptimo para Tomate</span>
              </div>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Técnico Responsável</span>
              <p className="text-lg font-bold text-primary mt-1">Eng. António Langa</p>
              <p className="text-xs text-secondary/70">SDAE Nhamatanda</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Recomendações Ativas</span>
              <p className="text-3xl font-black text-accent mt-1">1</p>
              <p className="mt-2 text-xs text-secondary/80">Rega matinal de 45 min</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registo de Leitura de Humidade</CardTitle>
                    <CardDescription>
                      Insira o valor medido no sensor ou teste manual de punho
                    </CardDescription>
                  </div>
                  <Badge variant="accent" size="sm">Diário</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      Selecionar Parcela
                    </label>
                    <select className="w-full bg-white border border-secondary/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent">
                      <option>Parcela Lamego 1 (2.5 ha - Tomate)</option>
                      <option>Parcela Lamego 2 (1.0 ha - Milho)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      Teor de Humidade (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        defaultValue={38}
                        min={0}
                        max={100}
                        className="flex-1 bg-white border border-secondary/30 rounded-xl px-3.5 py-2.5 text-base font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <span className="font-bold text-secondary">%</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setValidationSuccess('Leitura de humidade registada com sucesso e enviada para validação do Eng. António Langa.')}
                  >
                    Submeter Leitura ao SDAE
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recomendações Técnicas Recebidas</CardTitle>
                    <CardDescription>
                      Orientações emitidas pelo Eng. António Langa (SDAE Nhamatanda)
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" size="sm">Ativa</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-2xl border border-secondary/20 bg-surface/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent bg-primary px-2 py-0.5 rounded">
                      Manejo de Rega
                    </span>
                    <span className="text-xs text-secondary/60">Emitida ontem às 15:40</span>
                  </div>

                  <p className="text-sm font-semibold text-primary">
                    "Com as temperaturas altas previstas para o distrito de Nhamatanda, efetuar a rega preferencialmente entre as 06:00 e as 07:30 da manhã, mantendo 45 minutos por sector."
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-secondary/10 text-xs">
                    <span className="text-secondary/70">Parcela: Lamego 1</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setValidationSuccess('Recomendação confirmada como implementada no campo.')}
                    >
                      Confirmar Aplicação
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
