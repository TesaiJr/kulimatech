// src/features/pragas/components/OcorrenciaFormModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CreateOcorrenciaDTO, SeveridadePraga, PragaDTO } from '../types';
import { Bug, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';

interface ParcelaOption {
  id: string;
  nome: string;
}

interface OcorrenciaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOcorrenciaDTO) => Promise<boolean>;
  parcelas: ParcelaOption[];
  pragas: PragaDTO[];
  defaultPragaId?: string;
  loading?: boolean;
}

export function OcorrenciaFormModal({
  isOpen,
  onClose,
  onSubmit,
  parcelas,
  pragas,
  defaultPragaId,
  loading = false,
}: OcorrenciaFormModalProps) {
  const [parcelaId, setParcelaId] = useState<string>(
    parcelas.length > 0 ? parcelas[0].id : ''
  );
  const [pragaId, setPragaId] = useState<string>(defaultPragaId || '');
  const [severidade, setSeveridade] = useState<SeveridadePraga>(SeveridadePraga.MEDIA);
  const [descricao, setDescricao] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parcelaId) {
      setError('Por favor, selecione a parcela agrícola afetada.');
      return;
    }

    if (!descricao.trim() || descricao.trim().length < 5) {
      setError('Por favor, descreva os sintomas observados (mínimo de 5 caracteres).');
      return;
    }

    const payload: CreateOcorrenciaDTO = {
      parcelaId,
      pragaId: pragaId || undefined,
      descricao: descricao.trim(),
      severidade,
      fotoUrl: fotoUrl.trim() || undefined,
    };

    const success = await onSubmit(payload);
    if (success) {
      setDescricao('');
      setFotoUrl('');
      setPragaId('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar Ocorrência Fitossanitária"
      description="Informe o técnico supervisor sobre pragas ou sintomas anómalos detetados na parcela."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Parcela Agrícola */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Parcela Agrícola Afetada *
          </label>
          <select
            value={parcelaId}
            onChange={(e) => setParcelaId(e.target.value)}
            disabled={loading}
            className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            required
          >
            <option value="">Selecione a parcela...</option>
            {parcelas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Praga Suspeita (Opcional) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Bug className="w-4 h-4 text-emerald-600" />
            Praga / Doença Suspeita (Opcional)
          </label>
          <select
            value={pragaId}
            onChange={(e) => setPragaId(e.target.value)}
            disabled={loading}
            className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          >
            <option value="">Não sei identificar / Outro problema</option>
            {pragas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} {p.cultura ? `(${p.cultura.nome})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Severidade Observada */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Severidade Observada *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 'BAIXA', label: 'Baixa', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
              { val: 'MEDIA', label: 'Média', color: 'text-amber-700 bg-amber-50 border-amber-300' },
              { val: 'ALTA', label: 'Alta', color: 'text-orange-700 bg-orange-50 border-orange-300' },
              { val: 'CRITICA', label: 'Crítica', color: 'text-rose-700 bg-rose-50 border-rose-300' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setSeveridade(item.val as SeveridadePraga)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                  severidade === item.val
                    ? `${item.color} shadow-xs ring-2 ring-emerald-500`
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição dos Sintomas */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-500" />
            Descrição dos Danos e Sintomas Observados *
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Folhas do milho furadas com lagartas escuras visíveis no cartucho da planta."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            disabled={loading}
            className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            required
          />
        </div>

        {/* URL da Foto (Opcional) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            Link da Foto / Registro Visual (Opcional)
          </label>
          <input
            type="url"
            placeholder="Ex: https://..."
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            disabled={loading}
            className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Rodapé com Botões */}
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
            {loading ? 'A submeter...' : 'Submeter Ocorrência'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
