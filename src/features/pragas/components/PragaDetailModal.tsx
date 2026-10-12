// src/features/pragas/components/PragaDetailModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { PragaDTO } from '../types';
import { Bug, Sprout, AlertTriangle, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

interface PragaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  praga: PragaDTO | null;
  onReportarOcorrencia?: (praga: PragaDTO) => void;
}

export function PragaDetailModal({
  isOpen,
  onClose,
  praga,
  onReportarOcorrencia,
}: PragaDetailModalProps) {
  if (!praga) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={praga.nome}
      description={praga.nomeCientifico ? `Nome científico: ${praga.nomeCientifico}` : undefined}
      size="lg"
    >
      <div className="space-y-5 pt-2">
        {/* Metadados Básicos */}
        <div className="flex flex-wrap items-center gap-2">
          {praga.cultura && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Sprout className="w-3.5 h-3.5" />
              Cultura Afetada: {praga.cultura.nome}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Severidade Típica: {praga.severidadePadrao}
          </span>
        </div>

        {/* Descrição Geral */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Descrição da Praga / Patógeno
          </h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
            {praga.descricao}
          </p>
        </div>

        {/* Sintomas no Campo */}
        <div>
          <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Sintomas e Danos Visíveis no Campo
          </h4>
          <div className="text-sm text-gray-800 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 leading-relaxed whitespace-pre-line">
            {praga.sintomas}
          </div>
        </div>

        {/* Métodos de Combate e Prevenção */}
        <div>
          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Medidas Integradas de Manejo e Combate (MIP)
          </h4>
          <div className="text-sm text-gray-800 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 leading-relaxed whitespace-pre-line">
            {praga.metodosCombate}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Fechar Ficha
          </button>

          {onReportarOcorrencia && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReportarOcorrencia(praga);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
            >
              Reportar Ocorrência Desta Praga
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
