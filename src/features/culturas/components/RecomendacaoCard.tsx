// src/features/culturas/components/RecomendacaoCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Recomendacao, StatusRecomendacao } from '../types';
import {
  FileText,
  Sprout,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Archive,
  ArrowRight,
  Droplets,
} from 'lucide-react';

interface RecomendacaoCardProps {
  recomendacao: Recomendacao;
  currentUserId?: string;
  userRole?: string;
  onMarcarAplicada?: (id: string) => Promise<void>;
  onArquivar?: (id: string) => Promise<void>;
}

export function RecomendacaoCard({
  recomendacao,
  currentUserId,
  userRole,
  onMarcarAplicada,
  onArquivar,
}: RecomendacaoCardProps) {
  const [loadingAction, setLoadingAction] = useState(false);

  const isFarmer = userRole === 'AGRICULTOR';
  const isTechnicianOrAdmin = userRole === 'TECNICO' || userRole === 'ADMIN';

  const getStatusBadge = (status: StatusRecomendacao) => {
    switch (status) {
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Pendente de Aplicação
          </span>
        );
      case 'APLICADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aplicada na Parcela
          </span>
        );
      case 'ARQUIVADA':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            Arquivada
          </span>
        );
    }
  };

  const handleMarcarAplicada = async () => {
    if (!onMarcarAplicada) return;
    setLoadingAction(true);
    try {
      await onMarcarAplicada(recomendacao.id);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleArquivar = async () => {
    if (!onArquivar) return;
    setLoadingAction(true);
    try {
      await onArquivar(recomendacao.id);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Card
      variant="surface"
      className="hover:border-accent transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Cabeçalho */}
        <CardHeader className="pb-3 border-b border-secondary/10 bg-secondary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                  {recomendacao.parcela?.nome || 'Parcela Agrícola'}
                </h4>
                {recomendacao.parcela?.agricultor && (
                  <p className="text-[11px] text-primary/70">
                    Agricultor: <strong>{recomendacao.parcela.agricultor.nome}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {getStatusBadge(recomendacao.status)}
            </div>
          </div>
        </CardHeader>

        {/* Conteúdo */}
        <CardContent className="space-y-3 pt-3.5">
          {/* Parecer do Técnico */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <p className="text-xs font-medium text-amber-950 italic leading-relaxed whitespace-pre-line">
              "{recomendacao.parecer}"
            </p>
          </div>

          {/* Cultura recomendada & Limiares */}
          {recomendacao.cultura ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/5 border border-secondary/10 text-xs">
              <span className="flex items-center gap-1.5 text-primary/80 font-medium">
                <Sprout className="w-4 h-4 text-emerald-600" />
                Cultura Orientada: <strong>{recomendacao.cultura.nome}</strong>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                <Droplets className="w-3 h-3" />
                {recomendacao.cultura.humidadeMin}% - {recomendacao.cultura.humidadeMax}%
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-primary/60 italic flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-secondary" />
              Orientação técnica geral de maneio e conservação do solo.
            </div>
          )}

          {/* Dados do Técnico e Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-secondary/10 text-xs text-primary/70">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-secondary" />
              Técnico SDAE: <strong className="text-primary">{recomendacao.tecnico.nome}</strong>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-primary/60">
              <Calendar className="w-3 h-3" />
              Emitida a {new Date(recomendacao.dataEmissao).toLocaleDateString('pt-MZ')}
            </span>
          </div>
        </CardContent>
      </div>

      {/* Rodapé de Ações */}
      <div className="p-3 bg-secondary/5 border-t border-secondary/10 flex items-center justify-between gap-2">
        {recomendacao.parcela?.id ? (
          <Link
            href={`/parcelas/${recomendacao.parcela.id}`}
            className="text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span>Ver Parcela</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {/* Botão de Aplicação pelo Agricultor */}
          {isFarmer && recomendacao.status === 'PENDENTE' && onMarcarAplicada && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={loadingAction}
              onClick={handleMarcarAplicada}
              leftIcon={<CheckCircle2 className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />}
              className="text-xs py-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {loadingAction ? 'A guardar...' : 'Marcar como Aplicada'}
            </Button>
          )}

          {/* Botão de Arquivar pelo Técnico / Admin */}
          {isTechnicianOrAdmin && recomendacao.status !== 'ARQUIVADA' && onArquivar && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingAction}
              onClick={handleArquivar}
              leftIcon={<Archive className="w-3.5 h-3.5 text-primary/60" />}
              className="text-xs py-1 h-8 text-primary/70"
            >
              Arquivar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
