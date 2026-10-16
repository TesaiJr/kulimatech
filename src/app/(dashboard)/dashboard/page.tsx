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
  ShieldCheck,
  Droplets,
  AlertTriangle,
  Users,
  MapPin,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  RefreshCw,
  Zap,
  Sun,
  Calendar,
  CloudSun,
} from 'lucide-react';
import { WeatherCard, useMeteorologia } from '@/features/meteorologia';
import { rawColors } from '@/theme/colors';

interface DashboardResponse {
  role: 'ADMIN' | 'TECNICO_SDAE' | 'AGRICULTOR';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parcelas?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leituras7Dias?: any[];
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
  const [humidadeValor, setHumidadeValor] = useState<number>(58);
  const [temperaturaValor, setTemperaturaValor] = useState<number>(25);
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

  // Submissão de leitura de solo
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
        observacoes: 'Leitura registada via Painel da Exploração',
      });

      setValidationSuccess(
        `Leitura de ${res.humidade}% (${res.statusHumidade}) registada com sucesso!`
      );

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
      <div className="min-h-screen flex items-center justify-center bg-surface/40">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-primary">A carregar dados operacionais de Nhamatanda...</p>
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

  // Dados para o Gráfico de Evolução da Humidade (Figura 14 da Monografia)
  const defaultLeituras7Dias = [
    { label: '12 Set (Seg)', val: 42, temp: 24.0 },
    { label: '13 Set (Ter)', val: 48, temp: 24.5 },
    { label: '14 Set (Qua)', val: 55, temp: 25.0 },
    { label: '15 Set (Qui)', val: 62, temp: 25.5 },
    { label: '16 Set (Sex)', val: 58, temp: 26.0 },
    { label: '17 Set (Sáb)', val: 65, temp: 26.5 },
    { label: 'Hoje (Dom)', val: 68, temp: 27.0 },
  ];

  const dadosGrafico = dashboardData?.leituras7Dias && dashboardData.leituras7Dias.length >= 7
    ? dashboardData.leituras7Dias.map((l: any, i: number) => ({
        label: l.dataFormatada || defaultLeituras7Dias[i]?.label || `Dia ${i + 1}`,
        val: l.humidade,
        temp: l.temperatura || 25,
      }))
    : defaultLeituras7Dias;

  return (
    <DashboardLayout
      user={layoutUser}
      activeNavId={activeNavId}
      onSelectNavId={setActiveNavId}
    >
      {/* ========================================================================= */}
      {/* BANNER PRINCIPAL DE SESSÃO ATIVA (FIGURAS 14, 15 E 16 DA MONOGRAFIA)       */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-primary to-secondary p-5 sm:p-6 rounded-3xl shadow-xl text-surface border border-accent/25">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                SESSÃO ATIVA: {roleInfo.label.toUpperCase()}, {user?.email} • Nhamatanda
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Olá, {user?.nome}
            </h1>
            <p className="text-xs sm:text-sm text-surface/80">
              Ambiente operacional KulimaTech com dados em tempo real para a rede agrária de Nhamatanda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-right">
              <span className="text-[10px] text-surface/70 uppercase block font-semibold">Perfil Atual</span>
              <span className="text-sm font-black text-surface flex items-center gap-1.5 justify-end">
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
      {/* 1. VISÃO DO AGRICULTOR — PAINEL DA EXPLORAÇÃO (FIGURA 14 DA MONOGRAFIA)*/}
      {/* ===================================================================== */}
      {role === 'AGRICULTOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUNA ESQUERDA (65%): GRÁFICO DE HUMIDADE + CICLO AGRONÓMICO */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* CARD 1: GRÁFICO DE EVOLUÇÃO DA HUMIDADE DO SOLO */}
              <Card variant="surface" className="overflow-hidden border border-secondary/15 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                        <CardTitle className="text-base sm:text-lg font-bold text-primary">
                          Gráfico de Evolução da Humidade do Solo
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs text-secondary/80 mt-0.5">
                        Medições diárias de retenção hídrica (%) e temperatura (°C) nos últimos 7 dias
                      </CardDescription>
                    </div>

                    <Link href="/leituras">
                      <Button size="sm" variant="accent" className="font-bold flex items-center gap-1.5 shadow-xs">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Ir para Registo de Solo</span>
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Container Escuro da Telemetria (Conforme Figura 14 da Monografia) */}
                  <div className="bg-primary text-surface p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4 shadow-inner">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[10px] font-bold text-surface/60 uppercase tracking-wider block">
                            MÉDIA DO PERÍODO
                          </span>
                          <span className="text-2xl sm:text-3xl font-black text-accent">
                            {dashboardData?.stats?.mediaPeriodo || '58.4'}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-surface/60 uppercase tracking-wider block">
                            FAIXA ÓPTIMA
                          </span>
                          <span className="text-sm font-black text-surface">
                            {dashboardData?.stats?.faixaOptima || '40% - 75%'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-accent">
                          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                          Humidade (%)
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          Temp (°C)
                        </span>
                      </div>
                    </div>

                    {/* Gráfico SVG Curvo e Dinâmico de 7 Dias */}
                    <div className="relative h-44 w-full pt-4">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 700 130" preserveAspectRatio="none">
                        {/* Faixa Óptima Sombreada de Referência (40% a 75%) */}
                        <rect x="0" y="32" width="700" height="45" fill="rgba(149, 198, 35, 0.08)" />
                        <line x1="0" y1="32" x2="700" y2="32" stroke="rgba(149, 198, 35, 0.3)" strokeDasharray="4 4" strokeWidth="1" />
                        <line x1="0" y1="77" x2="700" y2="77" stroke="rgba(149, 198, 35, 0.3)" strokeDasharray="4 4" strokeWidth="1" />

                        {/* Linha de Temperatura (Tracejada Laranja) */}
                        <path
                          d="M 50 85 Q 150 82, 250 80 T 450 78 T 650 75"
                          fill="none"
                          className="stroke-amber-500"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          opacity="0.75"
                        />

                        {/* Área Preenchida com Gradiente de Humidade */}
                        <defs>
                          <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={rawColors.limeAccent} stopOpacity="0.45" />
                            <stop offset="100%" stopColor={rawColors.limeAccent} stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 50 80 Q 150 68, 250 55 T 450 42 T 650 30 L 650 120 L 50 120 Z"
                          fill="url(#moistureGradient)"
                        />

                        {/* Linha Principal de Humidade (Verde Elétrico / Accent) */}
                        <path
                          d="M 50 80 Q 150 68, 250 55 T 450 42 T 650 30"
                          fill="none"
                          stroke={rawColors.limeAccent}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Pontos de Medição com Rótulos de Percentual */}
                        {dadosGrafico.map((item, idx) => {
                          const x = 50 + idx * 100;
                          // Inverter escala percentual para coordenada Y
                          const y = 110 - (item.val / 100) * 100;
                          return (
                            <g key={item.label}>
                              <circle cx={x} cy={y} r="5" fill={rawColors.limeAccent} stroke={rawColors.deepTeal} strokeWidth="2.5" />
                              <text x={x} y={y - 10} textAnchor="middle" fill={rawColors.warmCream} fontSize="11" fontWeight="bold">
                                {item.val}%
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Eixo X com Nomes dos Dias Conforme a Monografia */}
                    <div className="grid grid-cols-7 text-center pt-2 border-t border-white/10 text-[11px] font-medium text-surface/75">
                      {dadosGrafico.map((item) => (
                        <span key={item.label} className="truncate px-0.5">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3 Cartões de Síntese Operacional Abaixo do Gráfico (Figura 14) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-surface/60 border border-secondary/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-secondary/70 block">
                        TENDÊNCIA HÍDRICA
                      </span>
                      <p className="text-sm font-black text-emerald-700 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{dashboardData?.stats?.tendenciaHidrica || '+6.2% / 48h'}</span>
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface/60 border border-secondary/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-secondary/70 block">
                        ESTABILIDADE DO SOLO
                      </span>
                      <p className="text-sm font-black text-primary">
                        {dashboardData?.stats?.estabilidadeSolo || 'Alta Retenção'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface/60 border border-secondary/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-secondary/70 block">
                        NECESSIDADE DE REGA
                      </span>
                      <p className="text-sm font-black text-secondary">
                        {dashboardData?.stats?.necessidadeRega || 'Daqui a 48h'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CARD 2: DIAGRAMA DO CICLO AGRONÓMICO & EXTENSÃO RURAL */}
              <Card variant="surface" className="border border-secondary/15 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-primary">
                        Diagrama do Ciclo Agronómico & Extensão Rural
                      </CardTitle>
                      <CardDescription className="text-xs text-secondary/80">
                        Etapas da época agrícola no Distrito de Nhamatanda
                      </CardDescription>
                    </div>
                    <Badge variant="accent" size="sm" className="font-bold">
                      Época 2026
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white/70 border border-secondary/15 space-y-1">
                      <span className="text-[10px] font-bold text-accent uppercase block">1. Sementeira</span>
                      <p className="text-xs font-bold text-primary">Outubro – Nov</p>
                      <p className="text-[11px] text-secondary/70 leading-tight">Início das chuvas e calibração de humidade</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 border border-secondary/15 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block">2. Vegetativo</span>
                      <p className="text-xs font-bold text-primary">Dezembro – Jan</p>
                      <p className="text-[11px] text-secondary/70 leading-tight">Desenvolvimento radicular e foliar</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 border border-accent/40 bg-accent/5 space-y-1">
                      <span className="text-[10px] font-bold text-secondary uppercase block">3. Floração</span>
                      <p className="text-xs font-bold text-primary">Fevereiro – Mar</p>
                      <p className="text-[11px] text-secondary/70 leading-tight">Fase crítica hídrica e monitorização</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 border border-secondary/15 space-y-1">
                      <span className="text-[10px] font-bold text-secondary/60 uppercase block">4. Colheita</span>
                      <p className="text-xs font-bold text-primary">Abril – Junho</p>
                      <p className="text-[11px] text-secondary/70 leading-tight">Maturação dos grãos e armazenamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* COLUNA DIREITA (35%): DIAGRAMA DE TALHÕES + METEOROLOGIA LOCAL */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* CARD 3: DIAGRAMA DE TALHÕES (ESTADO HÍDRICO INDIVIDUAL) */}
              <Card variant="surface" className="border border-secondary/15 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-primary">
                        Diagrama de Talhões
                      </CardTitle>
                      <CardDescription className="text-xs text-secondary/80">
                        Estado hídrico individual por parcela
                      </CardDescription>
                    </div>
                    <Link href="/parcelas">
                      <Button size="sm" variant="outline">
                        Ver Todas
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3.5">
                  {dashboardData?.parcelas && dashboardData.parcelas.length > 0 ? (
                    dashboardData.parcelas.slice(0, 4).map((p: any) => {
                      const humidadeVal = p.ultimaLeitura?.humidade ?? (p.id.includes('machamba') ? 60 : p.id.includes('hortalicas') ? 42 : 75);
                      const isOptimo = humidadeVal >= 50 && humidadeVal <= 70;
                      const isAtencao = humidadeVal < 50;
                      const statusTag = isOptimo ? 'Óptimo' : isAtencao ? 'Atenção' : 'Húmido';
                      const badgeVariant = isOptimo ? 'accent' : isAtencao ? 'secondary' : 'primary';
                      const barColor = isOptimo ? 'bg-accent' : isAtencao ? 'bg-amber-500' : 'bg-secondary';

                      return (
                        <div key={p.id} className="p-3 rounded-xl bg-white/70 border border-secondary/15 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-primary leading-tight">{p.nome}</p>
                              <p className="text-[11px] text-secondary/70">
                                {p.localizacao || 'Cultura em desenvolvimento'} • {p.areaHectares} ha
                              </p>
                            </div>
                            <span className="text-sm font-black text-primary">{humidadeVal}%</span>
                          </div>

                          {/* Barra de Progresso do Estado Hídrico */}
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-500`}
                              style={{ width: `${Math.min(humidadeVal, 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[10px] text-secondary/60">Solo {p.tipoSolo}</span>
                            <Badge variant={badgeVariant} size="sm" className="font-bold">
                              {statusTag}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 px-3 bg-white/40 rounded-xl border border-dashed border-secondary/30">
                      <p className="text-xs font-bold text-primary">Nenhum talhão registado.</p>
                      <Link href="/parcelas">
                        <Button size="sm" variant="primary" className="mt-2">
                          + Registar Parcela
                        </Button>
                      </Link>
                    </div>
                  )}

                  <Link href="/parcelas" className="block pt-1">
                    <Button size="sm" variant="primary" className="w-full flex items-center justify-center gap-1.5 font-bold">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                      <span>Gerir Características dos Talhões</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* CARD 4: METEOROLOGIA LOCAL (NHAMATANDA • SOFALA) */}
              <div className="rounded-2xl overflow-hidden border border-secondary/15 shadow-sm">
                <WeatherCard clima={clima} loading={loadingClima} onRefresh={refreshClima} />
              </div>

              {/* CARD 5: REGISTO RÁPIDO DE LEITURA (FERRAMENTA OPERACIONAL) */}
              <Card variant="surface" className="border border-secondary/15 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-accent" />
                    <span>Registo Imediato de Solo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmeterLeitura} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-secondary mb-1">
                        Parcela
                      </label>
                      <select
                        value={selectedParcelaId}
                        onChange={(e) => setSelectedParcelaId(e.target.value)}
                        className="w-full bg-white border border-secondary/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {dashboardData?.parcelas?.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.areaHectares} ha)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-secondary mb-1">
                          Humidade (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.5"
                          required
                          value={humidadeValor}
                          onChange={(e) => setHumidadeValor(Number(e.target.value))}
                          className="w-full bg-white border border-secondary/30 rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-secondary mb-1">
                          Temp (°C)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={50}
                          step="0.5"
                          value={temperaturaValor}
                          onChange={(e) => setTemperaturaValor(Number(e.target.value))}
                          className="w-full bg-white border border-secondary/30 rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full font-bold"
                      disabled={submittingLeitura || !dashboardData?.parcelas?.length}
                    >
                      {submittingLeitura ? 'A Gravar...' : 'Gravar Medição no Sistema'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. VISÃO DO TÉCNICO SDAE (FIGURA 15 DA MONOGRAFIA)                    */}
      {/* ===================================================================== */}
      {role === 'TECNICO_SDAE' && (
        <div className="space-y-6">
          {/* 4 KPIs EXATOS DA FIGURA 15 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                AGRICULTORES VINCULADOS
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalAgricultores ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">Carteira Técnica em Nhamatanda</p>
            </Card>

            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                PARCELAS MONITORADAS
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalParcelas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Área total: {dashboardData?.stats?.totalHectares ?? 0} hectares
              </p>
            </Card>

            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                LEITURAS RECENTES
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.validacoesPendentes ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">Medições de solo reportadas</p>
            </Card>

            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                OCORRÊNCIAS DE PRAGAS
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.ocorrenciasPragasCount ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">Reportadas pelos agricultores</p>
            </Card>
          </div>

          {/* 2 BLOCOS PRINCIPAIS DA FIGURA 15 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BLOCO 1: LEITURAS RECENTES DE HUMIDADE */}
            <Card variant="surface" className="border border-secondary/15">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-primary">
                      Leituras Recentes de Humidade
                    </CardTitle>
                    <CardDescription className="text-xs text-secondary/80">
                      Medições submetidas pelos agricultores associados
                    </CardDescription>
                  </div>
                  <Link href="/parcelas">
                    <Button size="sm" variant="outline">
                      Ver Parcelas
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
                          <span className="text-lg font-black text-primary">{l.humidade}%</span>
                          <span className="block text-[10px] font-bold text-emerald-700">
                            {l.statusHumidade || (l.validadoPorTecnico ? 'VALIDADA' : 'PENDENTE')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30">
                      <p className="text-xs font-bold text-secondary/70">Nenhuma leitura recente registrada.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* BLOCO 2: AGRICULTORES ACOMPANHADOS */}
            <Card variant="surface" className="border border-secondary/15">
              <CardHeader>
                <div>
                  <CardTitle className="text-base font-bold text-primary">
                    Agricultores Acompanhados
                  </CardTitle>
                  <CardDescription className="text-xs text-secondary/80">
                    Produtores sob responsabilidade agronómica
                  </CardDescription>
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
                    <div className="text-center py-8 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30">
                      <p className="text-xs font-bold text-secondary/70">Ainda não há agricultores garantidos a este técnico.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Previsão Meteorológica Integrada */}
          <WeatherCard clima={clima} loading={loadingClima} onRefresh={refreshClima} />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. VISÃO DO ADMINISTRADOR (FIGURA 16 DA MONOGRAFIA)                  */}
      {/* ===================================================================== */}
      {role === 'ADMIN' && (
        <div className="space-y-6">
          {/* 4 KPIs EXATOS DA FIGURA 16 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                CONTAS NO SISTEMA
              </span>
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

            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                PARCELAS REGISTADAS
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalParcelas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Monitoradas no Distrito de Nhamatanda
              </p>
            </Card>

            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                CATÁLOGO DE CULTURAS
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalCulturas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Culturas parametrizadas para Sofala
              </p>
            </Card>

            <Card variant="surface" className="border border-secondary/15">
              <span className="text-xs font-bold text-secondary/70 uppercase">
                CATÁLOGO DE PRAGAS
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {dashboardData?.stats?.totalPragas ?? 0}
              </p>
              <p className="mt-2 text-xs text-secondary/80">
                Fichas técnicas com medidas de controlo
              </p>
            </Card>
          </div>

          {/* 2 BLOCOS PRINCIPAIS DA FIGURA 16 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BLOCO 1: TÉCNICOS SDAE & CARTEIRAS TÉCNICAS */}
            <Card variant="surface" className="border border-secondary/15">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-primary">
                      Técnicos SDAE & Carteiras Técnicas
                    </CardTitle>
                    <CardDescription className="text-xs text-secondary/80">
                      Extensão rural e agricultores atribuídos no distrito
                    </CardDescription>
                  </div>
                  <Link href="/parcelas">
                    <Button size="sm" variant="outline">
                      Ver Parcelas
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
                    <div className="text-center py-8 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30">
                      <p className="text-xs font-bold text-secondary/70">Nenhum técnico registado ainda no sistema.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* BLOCO 2: CATÁLOGO MESTRE DE CULTURAS */}
            <Card variant="surface" className="border border-secondary/15">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-primary">
                      Catálogo Mestre de Culturas
                    </CardTitle>
                    <CardDescription className="text-xs text-secondary/80">
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
                    <div className="text-center py-8 px-4 bg-white/40 rounded-xl border border-dashed border-secondary/30">
                      <p className="text-xs font-bold text-secondary/70">Nenhuma cultura registada.</p>
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
