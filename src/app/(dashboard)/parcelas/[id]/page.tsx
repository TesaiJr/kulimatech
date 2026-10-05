// src/app/(dashboard)/parcelas/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { parcelaService } from '@/features/parcelas/services/parcelaService';
import { ParcelaDetalhe, TipoSolo } from '@/features/parcelas/types';
import { ParcelaForm } from '@/features/parcelas/components/ParcelaForm';
import { ParcelaDeleteDialog } from '@/features/parcelas/components/ParcelaDeleteDialog';
import { EmitirRecomendacaoModal } from '@/features/culturas/components/EmitirRecomendacaoModal';
import { recomendacaoService } from '@/features/culturas/services/recomendacaoService';
import {
  MapPin,
  User,
  Activity,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  AlertCircle,
  PlusCircle,
  Thermometer,
} from 'lucide-react';

const TIPO_SOLO_LABELS: Record<TipoSolo, string> = {
  ARENOSO: 'Arenoso',
  ARGILOSO: 'Argiloso',
  FRANCO: 'Franco-Argiloso',
  MISTO: 'Misto',
  OUTRO: 'Outro',
};

const TIPO_SOLO_BADGE_STYLES: Record<TipoSolo, string> = {
  ARENOSO: 'bg-amber-100 text-amber-900 border border-amber-300',
  ARGILOSO: 'bg-orange-100 text-orange-900 border border-orange-300',
  FRANCO: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  MISTO: 'bg-teal-100 text-teal-900 border border-teal-300',
  OUTRO: 'bg-stone-100 text-stone-900 border border-stone-300',
};

export default function ParcelaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const parcelaId = params?.id as string;

  const role = user?.role || 'AGRICULTOR';
  const isTechnicianOrAdmin = role === 'TECNICO' || role === 'ADMIN';

  const layoutUser = user
    ? {
        name: user.nome,
        email: user.email,
        role: user.role === 'TECNICO' ? 'TECNICO_SDAE' : user.role,
      }
    : undefined;

  const [parcela, setParcela] = useState<ParcelaDetalhe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Dialog de Exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Modal de Recomendação Técnica
  const [isRecomendacaoModalOpen, setIsRecomendacaoModalOpen] = useState<boolean>(false);
  const [updatingRecId, setUpdatingRecId] = useState<string | null>(null);

  const fetchParcela = useCallback(async () => {
    if (!parcelaId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await parcelaService.getParcelaById(parcelaId);
      if (!data) {
        setError('Parcela agrícola não encontrada.');
      } else {
        setParcela(data);
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu uma falha ao carregar os detalhes da parcela.');
    } finally {
      setLoading(false);
    }
  }, [parcelaId]);

  useEffect(() => {
    fetchParcela();
  }, [fetchParcela]);

  const handleDelete = async () => {
    if (!parcela) return;
    setIsDeleting(true);
    try {
      await parcelaService.deleteParcela(parcela.id);
      router.push('/parcelas');
    } catch (err) {
      setError('Não foi possível eliminar a parcela.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeNavId="parcelas" user={layoutUser}>
        <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
          <div className="h-10 bg-surface rounded-xl w-1/3" />
          <div className="h-64 bg-surface rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !parcela) {
    return (
      <DashboardLayout activeNavId="parcelas" user={layoutUser}>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <Card variant="surface" className="p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-primary mb-2">Parcela Indisponível</h2>
            <p className="text-sm text-primary/70 mb-6">{error || 'A parcela solicitada não existe.'}</p>
            <Link href="/parcelas">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Voltar à Lista de Parcelas
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNavId="parcelas" user={layoutUser}>
      {/* Cabeçalho da Página */}
      <PageHeader
        title={parcela.nome}
        description={`Exploração agrícola em ${parcela.localizacao || 'Nhamatanda'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parcelas', href: '/parcelas' },
          { label: parcela.nome, href: `/parcelas/${parcela.id}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/parcelas">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Voltar
              </Button>
            </Link>

            <Button
              variant={isEditing ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setIsEditing((prev) => !prev)}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              {isEditing ? 'Cancelar Edição' : 'Editar Parcela'}
            </Button>

            {(user?.role === 'AGRICULTOR' || user?.role === 'ADMIN') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 hover:bg-red-50"
                title="Eliminar Parcela"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        }
      />

      {/* Modo de Edição Inline ou Exibição de Detalhes */}
      {isEditing ? (
        <div className="max-w-3xl mx-auto">
          <Card variant="surface" className="border border-[#8eb69b]/40">
            <h3 className="text-lg font-bold text-primary mb-4 border-b border-[#8eb69b]/30 pb-2">
              Editar Dados da Parcela
            </h3>
            <ParcelaForm
              initialData={parcela}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => {
                setIsEditing(false);
                fetchParcela();
              }}
            />
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card de Ficha Técnica Principal */}
          <Card variant="surface" className="border-l-4 border-l-accent p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/60">
                  Especificações da Parcela
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      TIPO_SOLO_BADGE_STYLES[parcela.tipoSolo]
                    }`}
                  >
                    Solo {TIPO_SOLO_LABELS[parcela.tipoSolo]}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-primary/60 block">Área Cultivada</span>
                  <p className="text-3xl font-black text-primary">
                    {parcela.areaHectares} <span className="text-sm font-normal">hectares</span>
                  </p>
                </div>
              </div>

              {/* Localização & GPS */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/60">
                  Localização Georreferenciada
                </span>
                <p className="text-sm font-semibold text-primary flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>{parcela.localizacao || 'Sem descrição cadastrada'}</span>
                </p>

                <div className="pt-2">
                  <span className="text-xs text-primary/60 block">Coordenadas GPS</span>
                  <p className="text-xs font-mono font-bold text-primary">
                    {parcela.latitude && parcela.longitude
                      ? `Lat: ${parcela.latitude} | Lng: ${parcela.longitude}`
                      : 'Nenhuma coordenada gravada'}
                  </p>
                </div>
              </div>

              {/* Produtor Responsável */}
              <div className="space-y-2 bg-[#e6efe8]/60 p-4 rounded-2xl border border-[#8eb69b]/30">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/70">
                  Produtor Responsável
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent text-primary font-bold flex items-center justify-center text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary">{parcela.agricultor.nome}</p>
                    <p className="text-xs text-primary/70">
                      {parcela.agricultor.zonaAtuacao || 'Nhamatanda'} • {parcela.agricultor.telefone || 'Sem telefone'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Duas Colunas: Leituras e Recomendações Recentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Leituras de Humidade de Solo */}
            <Card variant="surface">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Leituras de Humidade Recentes
                  </CardTitle>
                  <CardDescription>
                    Histórico de sensor e medições de campo
                  </CardDescription>
                </div>

                <Link href="/leituras">
                  <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Nova Leitura
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parcela.leiturasRecentes.map((leitura) => (
                    <div
                      key={leitura.id}
                      className="p-3.5 rounded-xl border border-[#8eb69b]/30 bg-[#e6efe8]/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-primary">
                            {leitura.humidade}%
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {leitura.statusHumidade || 'Adequada'}
                          </span>
                        </div>
                        {leitura.temperatura && (
                          <span className="text-xs text-primary/70 flex items-center gap-1 mt-1">
                            <Thermometer className="w-3 h-3 text-amber-600" />
                            {leitura.temperatura}°C (Temp. Solo)
                          </span>
                        )}
                      </div>

                      <div className="text-right text-xs text-primary/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leitura.dataLeitura).toLocaleDateString('pt-MZ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. Recomendações Agronómicas */}
            <Card variant="surface">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Recomendações Agronómicas
                  </CardTitle>
                  <CardDescription>
                    Orientações emitidas pelos técnicos do SDAE
                  </CardDescription>
                </div>

                {isTechnicianOrAdmin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsRecomendacaoModalOpen(true)}
                  >
                    Emitir Recomendação
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parcela.recomendacoesRecentes.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl border border-secondary/20 bg-surface flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-secondary">
                          {rec.tecnico.nome}
                        </span>
                        <Badge variant="accent" size="sm">
                          {rec.status}
                        </Badge>
                      </div>

                      <p className="text-xs font-medium text-primary italic">
                        "{rec.parecer}"
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-secondary/10 text-[11px] text-primary/60">
                        <span>Cultura: {rec.cultura?.nome || 'Geral'}</span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(rec.dataEmissao).toLocaleDateString('pt-MZ')}</span>
                          {user?.role === 'AGRICULTOR' && rec.status === 'PENDENTE' && (
                            <button
                              type="button"
                              disabled={updatingRecId === rec.id}
                              onClick={async () => {
                                setUpdatingRecId(rec.id);
                                try {
                                  await recomendacaoService.updateStatus(rec.id, { status: 'APLICADA' });
                                  fetchParcela();
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setUpdatingRecId(null);
                                }
                              }}
                              className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors"
                            >
                              {updatingRecId === rec.id ? 'A guardar...' : 'Marcar Aplicada'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <ParcelaDeleteDialog
        parcela={parcela}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Modal de Emissão de Recomendação Técnica */}
      <EmitirRecomendacaoModal
        isOpen={isRecomendacaoModalOpen}
        onClose={() => setIsRecomendacaoModalOpen(false)}
        parcelaId={parcela.id}
        parcelaNome={parcela.nome}
        onSuccess={fetchParcela}
      />
    </DashboardLayout>
  );
}