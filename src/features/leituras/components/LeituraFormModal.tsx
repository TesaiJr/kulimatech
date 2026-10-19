// src/features/leituras/components/LeituraFormModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CreateLeituraDTO } from '../types';
import { HumidadeGaugeBar } from './HumidadeGaugeBar';
import { Droplets, Thermometer, FileText, AlertTriangle, Save } from 'lucide-react';

interface ParcelaOption {
  id: string;
  nome: string;
}

interface LeituraFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeituraDTO) => Promise<boolean>;
  parcelas: ParcelaOption[];
  defaultParcelaId?: string;
  loading?: boolean;
}

export function LeituraFormModal({
  isOpen,
  onClose,
  onSubmit,
  parcelas,
  defaultParcelaId,
  loading = false,
}: LeituraFormModalProps) {
  const [parcelaId, setParcelaId] = useState<string>(
    defaultParcelaId || (parcelas.length > 0 ? parcelas[0].id : '')
  );
  const [humidade, setHumidade] = useState<number>(45);
  const [temperatura, setTemperatura] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parcelaId) {
      setError('Por favor, selecione a parcela agrícola.');
      return;
    }

    if (isNaN(humidade) || humidade < 0 || humidade > 100) {
      setError('A humidade deve ser um percentual válido entre 0% e 100%.');
      return;
    }

    const payload: CreateLeituraDTO = {
      parcelaId,
      humidade: Number(humidade),
      temperatura: temperatura.trim() ? Number(temperatura) : null,
      observacoes: observacoes.trim() || null,
    };

    const success = await onSubmit(payload);
    if (success) {
      setObservacoes('');
      setTemperatura('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registar Nova Leitura de Solo"
      description="Introduza os parâmetros recolhidos no campo ou via sensor para análise agronómica."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Parcela */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Parcela Agrícola *
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

        {/* Humidade do Solo */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-emerald-600" />
              Humidade do Solo (%) *
            </label>
            <span className="text-sm font-extrabold text-emerald-700">
              {humidade}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={humidade}
              onChange={(e) => setHumidade(Number(e.target.value))}
              disabled={loading}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={humidade}
              onChange={(e) => setHumidade(Number(e.target.value))}
              disabled={loading}
              className="w-20 py-1.5 px-2.5 text-center text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Preview Dinâmico do Status */}
          <div className="mt-3">
            <HumidadeGaugeBar humidade={humidade} />
          </div>
        </div>

        {/* Temperatura (Opcional) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-gray-500" />
            Temperatura Medida (°C)
          </label>
          <input
            type="number"
            step="0.5"
            placeholder="Ex: 27.5"
            value={temperatura}
            onChange={(e) => setTemperatura(e.target.value)}
            disabled={loading}
            className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Observações de Campo */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-500" />
            Observações de Campo
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Solo com aspecto seco na camada superior; medição realizada pela manhã."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            disabled={loading}
            className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Botões do Rodapé */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 pb-1 border-t border-gray-100 flex items-center justify-end gap-2 mt-4 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'A guardar...' : 'Guardar Registo de Humidade'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
