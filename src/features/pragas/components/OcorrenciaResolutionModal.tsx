// src/features/pragas/components/OcorrenciaResolutionModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { OcorrenciaPragaDTO, StatusOcorrencia, ResolverOcorrenciaDTO } from '../types';
import { Bug, FileCheck, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface OcorrenciaResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ocorrencia: OcorrenciaPragaDTO | null;
  onResolve: (id: string, data: ResolverOcorrenciaDTO) => Promise<boolean>;
  loading?: boolean;
}

export function OcorrenciaResolutionModal({
  isOpen,
  onClose,
  ocorrencia,
  onResolve,
  loading = false,
}: OcorrenciaResolutionModalProps) {
  const [status, setStatus] = useState<StatusOcorrencia>(StatusOcorrencia.RESOLVIDA);
  const [parecerTecnico, setParecerTecnico] = useState<string>('');
  const [acaoRecomendada, setAcaoRecomendada] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ocorrencia) {
      setStatus(ocorrencia.status === 'ABERTA' ? StatusOcorrencia.RESOLVIDA : ocorrencia.status);
      setParecerTecnico(ocorrencia.parecerTecnico || '');
      setAcaoRecomendada(ocorrencia.acaoRecomendada || '');
    }
  }, [ocorrencia]);

  if (!ocorrencia) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parecerTecnico.trim() || parecerTecnico.trim().length < 5) {
      setError('Por favor, elabore o parecer técnico detalhado (mínimo de 5 caracteres).');
      return;
    }

    const payload: ResolverOcorrenciaDTO = {
      status,
      parecerTecnico: parecerTecnico.trim(),
      acaoRecomendada: acaoRecomendada.trim() || undefined,
    };

    const success = await onResolve(ocorrencia.id, payload);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Parecer Técnico e Resolução"
      description="Análise agronómica de ocorrência fitossanitária pelo extensionista do SDAE."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resumo da Ocorrência */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Parcela:</span>
            <span className="font-bold text-gray-900">{ocorrencia.parcela?.nome}</span>
          </div>
          {ocorrencia.agricultor && (
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Agricultor:</span>
              <span className="font-semibold text-gray-800">{ocorrencia.agricultor.nome}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Praga Suspeita:</span>
            <span className="font-semibold text-emerald-800">
              {ocorrencia.praga?.nome || 'Não identificada pelo produtor'}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-200/60 mt-2">
            <span className="text-gray-500 font-bold block mb-1">Danos Reportados:</span>
            <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 leading-relaxed italic">
              &quot;{ocorrencia.descricao}&quot;
            </p>
          </div>
        </div>

        {/* Estado da Resolução */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Estado da Resolução *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus(StatusOcorrencia.RESOLVIDA)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                status === StatusOcorrencia.RESOLVIDA
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${status === StatusOcorrencia.RESOLVIDA ? 'text-emerald-600' : 'text-gray-400'}`} />
              Concluir e Resolver
            </button>

            <button
              type="button"
              onClick={() => setStatus(StatusOcorrencia.EM_ANALISE)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                status === StatusOcorrencia.EM_ANALISE
                  ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Clock className={`w-4 h-4 ${status === StatusOcorrencia.EM_ANALISE ? 'text-blue-600' : 'text-gray-400'}`} />
              Manter em Análise
            </button>
          </div>
        </div>

        {/* Parecer Técnico */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Parecer Técnico / Diagnóstico Agronómico *
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Identificado ataque inicial de Lagarta do Funil (Spodoptera frugiperda). Infestação localizada em cerca de 15% das plantas."
            value={parecerTecnico}
            onChange={(e) => setParecerTecnico(e.target.value)}
            disabled={loading}
            className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            required
          />
        </div>

        {/* Ação Recomendada */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Ações e Medidas de Controlo Recomendadas
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Aplicação de extrato de nim nas folhas atacadas ao final da tarde ou bioinseticida autorizado."
            value={acaoRecomendada}
            onChange={(e) => setAcaoRecomendada(e.target.value)}
            disabled={loading}
            className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? 'A gravar...' : 'Gravar Parecer e Notificar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
