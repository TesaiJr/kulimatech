// src/features/leituras/components/ValidarLeituraModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LeituraSoloDTO } from '../types';
import { HumidadeGaugeBar } from './HumidadeGaugeBar';
import { CheckCircle2, XCircle, FileCheck, AlertCircle } from 'lucide-react';

interface ValidarLeituraModalProps {
  isOpen: boolean;
  onClose: () => void;
  leitura: LeituraSoloDTO | null;
  onValidar: (
    id: string,
    validado: boolean,
    observacoesTecnicas?: string
  ) => Promise<boolean>;
  loading?: boolean;
}

export function ValidarLeituraModal({
  isOpen,
  onClose,
  leitura,
  onValidar,
  loading = false,
}: ValidarLeituraModalProps) {
  const [validado, setValidado] = useState<boolean>(true);
  const [observacoes, setObservacoes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leitura) {
      setValidado(leitura.validadoPorTecnico ?? true);
      setObservacoes(leitura.observacoesTecnicas || '');
    }
  }, [leitura]);

  if (!leitura) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = await onValidar(
      leitura.id,
      validado,
      observacoes.trim() || undefined
    );

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Homologação Técnica de Leitura"
      description="Emissão de parecer e validação agronómica da medição de humidade do solo."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resumo da Leitura */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Parcela:</span>
            <span className="font-bold text-gray-900">
              {leitura.parcela?.nome || 'Parcela'}
            </span>
          </div>
          {leitura.parcela?.agricultor && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Agricultor:</span>
              <span className="font-semibold text-gray-700">
                {leitura.parcela.agricultor.nome}
              </span>
            </div>
          )}
          {leitura.observacoes && (
            <div className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100">
              <span className="font-semibold text-gray-500">Nota do Agricultor: </span>
              &quot;{leitura.observacoes}&quot;
            </div>
          )}

          <HumidadeGaugeBar humidade={leitura.humidade} />
        </div>

        {/* Decisão Agronómica */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Decisão Técnica *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValidado(true)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                validado
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${validado ? 'text-emerald-600' : 'text-gray-400'}`} />
              Homologar e Aprovar
            </button>

            <button
              type="button"
              onClick={() => setValidado(false)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                !validado
                  ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <XCircle className={`w-4 h-4 ${!validado ? 'text-rose-600' : 'text-gray-400'}`} />
              Contestar Medição
            </button>
          </div>
        </div>

        {/* Parecer / Observações Técnicas */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Parecer Agronómico / Recomendações Imediatas
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Nível hídrico adequado para a fase vegetativa atual; manter o intervalo programado de rega."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            disabled={loading}
            className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-sm disabled:opacity-50 ${
              validado
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {loading ? 'A gravar...' : validado ? 'Confirmar Homologação' : 'Gravar Contestação'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
