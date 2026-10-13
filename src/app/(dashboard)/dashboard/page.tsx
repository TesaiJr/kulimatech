// src/app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Alert } from '@/components/ui';
import { USER_ROLES_INFO, UserRole } from '@/types/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api, ApiError } from '@/lib/api/client';
import Link from 'next/link';
import {
  Sprout,
  Activity,
  User,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  AlertTriangle,
  Users,
  MapPin,
  ClipboardList,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { WeatherCard, useMeteorologia } from '@/features/meteorologia';

interface DashboardResponse {
  role: 'ADMIN' | 'TECNICO_SDAE' | 'AGRICULTOR';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parcelas?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recomendacoesRecentes?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agricultores?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leiturasRecentes?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ocorrenciasPragas?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tecnicos?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  culturas?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pragas?: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { clima, loading: loadingClima, refresh: refreshClima } = useMeteorologia();

  const [activeNavId, setActiveNavId] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

  // Estados do formulário de leitura (Agricultor)
  const [selectedParcelaId, setSelectedParcelaId] = useState<string>('');
  const [humidadeValor, setHumidadeValor] = useState<number>(38);
  const [temperaturaValor, setTemperaturaValor] = useState<number>(26);
  const [submittingLeitura, setSubmittingLeitura] = useState<boolean>(false);

  // Buscar dados reais do dashboard no backend
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<DashboardResponse>('/api/dashboard');
      setDashboardData(data);
      if (data.parcelas && data.parcelas.length > 0 && !selectedParcelaId) {
        setSelectedParcelaId(data.parcelas[0].id);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível carregar os dados operacionais do painel.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedParcelaId]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?mode=login');
      } else {
        fetchDashboardData();
      }
    }
  }, [authLoading, isAuthenticated, router, fetchDashboardData]);

  // Submissão real de leitura de solo
  const handleSubmeterLeitura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelaId) {
      setError('Por favor, selecione uma parcela agrícola.');
      return;
    }

    setSubmittingLeitura(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.post<any>('/api/leituras', {
        parcelaId: selectedParcelaId,
        humidade: Number(humidadeValor),
        temperatura: Number(temperaturaValor),
        observacoes: 'Leitura registada via Painel do Agricultor',
      });

      setValidationSuccess(
        `Leitura de ${res.humidade}% (${res.statusHumidade}) registada com sucesso na parcela!`
      );

      // Recarregar dados para refletir medição mais recente
      await fetchDashboardData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Falha ao registar a leitura de humidade no sistema.');
      }
    } finally {
      setSubmittingLeitura(false);
    }
  };

  if (authLoading || (loading && !dashboardData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFAE0]/30">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0E4749]/30 border-t-[#0E4749] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#002626]">A carregar dados operacionais...</p>
        </div>
      </div>
    );
  }

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

  return (
    <DashboardLayout
      user={layoutUser}
      activeNavId={activeNavId}
      onSelectNavId={setActiveNavId}
    >
      {/* Banner Principal de Boas-Vindas Contextualizado com Sessão Real */}
      <div className="bg-gradient-to-r from-[#002626] to-[#0E4749] p-5 sm:p-6 rounded-3xl shadow-xl text-[#FEFAE0] border border-[#95C623]/25">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#95C623] bg-black/30 px-2.5 py-0.5 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sessão Ativa: {user?.email}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs font-bold text-white/80">
                {user?.zonaAtuacao || 'Distrito de Nhamatanda • Sofala'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Olá, {user?.nome}
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              Ambiente operacional KulimaTech com dados em tempo real para a rede agrária de Nhamatanda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-right">
              <span className="text-[10px] text-white/60 uppercase block font-semibold">Perfil Atual</span>
              <span className="text-sm font-black text-[#FEFAE0] flex items-center gap-1.5 justify-end">
                <Badge variant={roleInfo.badgeVariant} size="sm">
                  {roleInfo.label}
                </Badge>
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {validationSuccess && (
        <Alert variant="success" onClose={() => setValidationSuccess(null)}>
          {validationSuccess}
        </Alert>
      )}

      {/* ===================================================================== */}
      {/* 1. VISÃO DO ADMINISTRADOR                                             */}
      {/* ===================================================================== */}
      {role === 'ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Contas no Sistema</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalUsuarios ?? 0}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary/80">
                <span className="font-bold text-accent bg-primary px-1.5 py-0.5 rounded">
                  {dashboardData?.stats?.totalTecnicos ?? 0}
                </span>{' '}
                Técnicos SDAE
                <span className="mx-1">•</span>
                <span className="font-bold text-accent bg-primary px-1.5 py-0.5 rounded">
                  {dashboardData?.stats?.totalAgricultores ?? 0}
                </span>{' '}
                Agricultores
              </div>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Parcelas Registadas</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalParcelas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Área distrital: <strong className="text-primary">{dashboardData?.stats?.totalHectaresDistrito ?? 0} ha</strong>
              </p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Auditoria de Humidade</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.leiturasValidadas ?? 0}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-secondary/80">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Validadas de <strong>{dashboardData?.stats?.totalLeituras ?? 0}</strong> medições</span>
              </div>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Catálogos & Ocorrências</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalCulturas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Culturas • <strong>{dashboardData?.stats?.totalPragas ?? 0}</strong> Pragas • <strong>{dashboardData?.stats?.totalOcorrencias ?? 0}</strong> Reportes
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Técnicos SDAE & Carteiras Técnicas</CardTitle>
                    <CardDescription>
                      Extensão rural e agricultores atribuídos no distrito
                    </CardDescription>
                  </div>
                  <Link href="/utilizadores">
                    <Button size="sm" variant="primary">
                      Gerir Carteiras
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.tecnicos && dashboardData.tecnicos.length > 0 ? (
                    dashboardData.tecnicos.map((tec: any) => (
                      <div
                        key={tec.id}
                        className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-sm text-primary">{tec.nome}</p>
                          <p className="text-xs text-secondary/70">
                            {tec.zonaAtuacao || 'Posto Administrativo de Nhamatanda'} • {tec.email}
                          </p>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {tec.agricultoresCount} Agricultor(es)
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-primary">Nenhum técnico registado no sistema.</p>
                      <p className="text-[11px] text-secondary/70">Registe os técnicos do SDAE para iniciar a supervisão das parcelas.</p>
                      <Link href="/utilizadores">
                        <Button size="sm" variant="outline" className="mt-2">
                          Criar Conta de Técnico
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Catálogo Mestre de Culturas</CardTitle>
                    <CardDescription>
                      Culturas agrícolas de referência para Nhamatanda
                    </CardDescription>
                  </div>
                  <Link href="/culturas">
                    <Button size="sm" variant="outline">
                      Gerir Catálogo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.culturas && dashboardData.culturas.length > 0 ? (
                    dashboardData.culturas.map((cult: any) => (
                      <div
                        key={cult.id}
                        className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-sm text-primary">{cult.nome}</p>
                          <p className="text-xs text-secondary/70">
                            Ciclo: {cult.cicloDias ? `${cult.cicloDias} dias` : 'Variável'} •
                            Humidade ideal: {cult.humidadeMin}% a {cult.humidadeMax}%
                          </p>
                        </div>
                        <Badge variant="accent" size="sm">
                          Ativa
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-primary">Nenhuma cultura registada.</p>
                      <p className="text-[11px] text-secondary/70">Cadastre as culturas prioritárias (Milho, Mapira, Feijão Boer, etc.).</p>
                      <Link href="/culturas">
                        <Button size="sm" variant="outline" className="mt-2">
                          Adicionar Cultura
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. VISÃO DO TÉCNICO SDAE                                              */}
      {/* ===================================================================== */}
      {role === 'TECNICO_SDAE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Agricultores Vinculados</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalAgricultores ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">Carteira sob sua supervisão</p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Parcelas Monitoradas</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalParcelas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Área produtiva: <strong className="text-primary">{dashboardData?.stats?.totalHectares ?? 0} ha</strong>
              </p>
            </Card>

            <Card variant="surface">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary/70 uppercase">Validações de Solo</span>
                {Number(dashboardData?.stats?.validacoesPendentes) > 0 && (
                  <Badge variant="accent" size="sm">
                    Pendente
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-black text-accent mt-1">
                {dashboardData?.stats?.validacoesPendentes ?? 0}
              </p>
              <Link href="/leituras" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                <span>Validar leituras</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Card>

            <Card variant="surface">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary/70 uppercase">Ocorrências de Pragas</span>
                {Number(dashboardData?.stats?.ocorrenciasPragasCount) > 0 && (
                  <Badge variant="secondary" size="sm">
                    Atenção
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-black text-amber-600 mt-1">
                {dashboardData?.stats?.ocorrenciasPragasCount ?? 0}
              </p>
              <Link href="/pragas/ocorrencias" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline">
                <span>{dashboardData?.stats?.ocorrenciasResolvidasCount ?? 0} resolvidas • Analisar</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Card>
          </div>

          {/* Previsão Meteorológica e Recomendações Agroclimáticas Nhamatanda */}
          <WeatherCard clima={clima} loading={loadingClima} onRefresh={refreshClima} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Leituras Recentes de Humidade</CardTitle>
                    <CardDescription>
                      Medições submetidas pelos agricultores associados
                    </CardDescription>
                  </div>
                  <Link href="/leituras">
                    <Button size="sm" variant="outline">
                      Validar no Painel
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.leiturasRecentes && dashboardData.leiturasRecentes.length > 0 ? (
                    dashboardData.leiturasRecentes.map((l: any) => (
                      <div
                        key={l.id}
                        className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-sm text-primary">
                            {l.parcela?.nome} ({l.parcela?.agricultor?.nome})
                          </p>
                          <p className="text-xs text-secondary/70">
                            Solo: {l.parcela?.tipoSolo} • {new Date(l.dataLeitura).toLocaleDateString('pt-MZ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-[#002626]">{l.humidade}%</span>
                          <span className="block text-[10px] font-bold text-emerald-700">
                            {l.statusHumidade || (l.validadoPorTecnico ? 'VALIDADA' : 'PENDENTE')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-primary">Nenhuma medição recente registada.</p>
                      <p className="text-[11px] text-secondary/70">As novas leituras submetidas pelos agricultores acompanhados aparecerão aqui.</p>
                      <Link href="/leituras">
                        <Button size="sm" variant="outline" className="mt-2">
                          Consultar Histórico
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Agricultores Acompanhados</CardTitle>
                    <CardDescription>
                      Produtores sob responsabilidade agronómica
                    </CardDescription>
                  </div>
                  <Link href="/utilizadores">
                    <Button size="sm" variant="outline">
                      Ver Carteira
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.agricultores && dashboardData.agricultores.length > 0 ? (
                    dashboardData.agricultores.map((agr: any) => (
                      <div
                        key={agr.id}
                        className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-sm text-primary">{agr.nome}</p>
                          <p className="text-xs text-secondary/70">
                            {agr.zonaAtuacao || 'Nhamatanda'} • {agr.telefone || agr.email}
                          </p>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {agr.parcelas?.length || 0} Parcela(s)
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-primary">Nenhum agricultor atribuído.</p>
                      <p className="text-[11px] text-secondary/70">Solicite à administração distrital a vinculação de produtores da sua zona.</p>
                      <Link href="/utilizadores">
                        <Button size="sm" variant="primary" className="mt-2">
                          Consultar Utilizadores
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. VISÃO DO AGRICULTOR                                                */}
      {/* ===================================================================== */}
      {role === 'AGRICULTOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">As Minhas Parcelas</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalParcelas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Área Total: <strong className="text-primary">{dashboardData?.stats?.totalHectares ?? 0} ha</strong>
              </p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Humidade Atual do Solo</span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.humidadeAtual !== null
                  ? `${dashboardData?.stats?.humidadeAtual}%`
                  : 'N/D'}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    dashboardData?.stats?.statusHumidadeAtual === 'OPTIMA'
                      ? 'bg-[#95C623]'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs font-bold text-primary">
                  {dashboardData?.stats?.statusHumidadeAtual
                    ? `Nível ${dashboardData.stats.statusHumidadeAtual}`
                    : 'Aguardando 1ª Leitura'}
                </span>
              </div>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Técnico Responsável</span>
              <p className="text-base font-bold text-primary mt-1 truncate">
                {dashboardData?.stats?.tecnicoResponsavel?.nome || 'SDAE Nhamatanda'}
              </p>
              <p className="text-xs text-secondary/70">
                {dashboardData?.stats?.tecnicoResponsavel?.telefone || 'Acompanhamento Oficial'}
              </p>
            </Card>

            <Card variant="surface">
              <span className="text-xs font-bold text-secondary/70 uppercase">Recomendações Técnicas</span>
              <p className="text-3xl font-black text-accent mt-1">
                {dashboardData?.stats?.recomendacoesAtivasCount ?? 0}
              </p>
              <Link href="/recomendacoes" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                <span>Ver orientações agronómicas</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Card>
          </div>

          {/* Previsão Meteorológica e Recomendações Agroclimáticas Nhamatanda */}
          <WeatherCard clima={clima} loading={loadingClima} onRefresh={refreshClima} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário Real de Leitura de Humidade de Solo */}
            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registo de Leitura de Humidade</CardTitle>
                    <CardDescription>
                      Insira o valor medido no sensor de solo da parcela
                    </CardDescription>
                  </div>
                  <Badge variant="accent" size="sm">
                    Registo Diário
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmeterLeitura} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">
                      Selecionar Parcela
                    </label>
                    {dashboardData?.parcelas && dashboardData.parcelas.length > 0 ? (
                      <select
                        value={selectedParcelaId}
                        onChange={(e) => setSelectedParcelaId(e.target.value)}
                        className="w-full bg-white border border-secondary/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {dashboardData.parcelas.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.areaHectares} ha - {p.tipoSolo})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <MapPin className="w-4 h-4 text-amber-700" />
                          <span>Ainda não possui parcelas registadas.</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Para registar medições de humidade, é necessário primeiro cadastrar a sua parcela agrícola.
                        </p>
                        <Link href="/parcelas/novo" className="inline-block font-bold underline text-[#0E4749]">
                          + Registar Parcela Agora
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-secondary mb-1">
                        Humidade (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          required
                          value={humidadeValor}
                          onChange={(e) => setHumidadeValor(Number(e.target.value))}
                          className="w-full bg-white border border-secondary/30 rounded-xl px-3.5 py-2.5 text-base font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <span className="font-bold text-secondary">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-secondary mb-1">
                        Temp. Solo (°C)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={-10}
                          max={60}
                          step="0.5"
                          value={temperaturaValor}
                          onChange={(e) => setTemperaturaValor(Number(e.target.value))}
                          className="w-full bg-white border border-secondary/30 rounded-xl px-3.5 py-2.5 text-base font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <span className="font-bold text-secondary">°C</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={submittingLeitura || !dashboardData?.parcelas?.length}
                  >
                    {submittingLeitura ? 'A Gravar Leitura...' : 'Submeter Leitura ao SDAE'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recomendações e Parcelas Recentes */}
            <Card variant="surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>As Suas Parcelas Agrícolas</CardTitle>
                    <CardDescription>
                      Talhões registados no SDAE Nhamatanda
                    </CardDescription>
                  </div>
                  <Link href="/parcelas">
                    <Button size="sm" variant="outline">
                      Ver Todas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.parcelas && dashboardData.parcelas.length > 0 ? (
                    dashboardData.parcelas.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl border border-secondary/20 bg-surface/50 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-primary">{p.nome}</p>
                          <p className="text-xs text-secondary/70">
                            {p.areaHectares} ha • Solo {p.tipoSolo} • {p.localizacao || 'Nhamatanda'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#0E4749] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {p.ultimaLeitura ? `${p.ultimaLeitura.humidade}%` : 'Sem leitura'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-primary">Nenhuma parcela registada na sua conta.</p>
                      <p className="text-[11px] text-secondary/70">Registe o seu primeiro terreno para começar a monitorar a humidade.</p>
                      <Link href="/parcelas/novo">
                        <Button size="sm" variant="primary" className="mt-2">
                          Registar Parcela
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
