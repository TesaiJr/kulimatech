// src/features/culturas/components/EmitirRecomendacaoModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { culturaService } from '../services/culturaService';
import { recomendacaoService } from '../services/recomendacaoService';
import { CulturaListItem } from '../types';
import { FileText, Sprout, Send, AlertCircle } from 'lucide-react';

interface EmitirRecomendacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelaId: string;
  parcelaNome: string;
  onSuccess: () => void;
}

export function EmitirRecomendacaoModal({
  isOpen,
  onClose,
  parcelaId,
  parcelaNome,
  onSuccess,
}: EmitirRecomendacaoModalProps) {
  const [culturas, setCulturas] = useState<CulturaListItem[]>([]);
  const [selectedCulturaId, setSelectedCulturaId] = useState<string>('');
  const [parecer, setParecer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCulturas, setLoadingCulturas] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingCulturas(true);
      setError(null);
      culturaService
        .getCulturas()
        .then((data) => setCulturas(data))
        .catch(() => setError('Não foi possível carregar o catálogo de culturas.'))
        .finally(() => setLoadingCulturas(false));
    } else {
      // Resetar form ao fechar
      setSelectedCulturaId('');
      setParecer('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parecer.trim() || parecer.trim().length < 10) {
      setError('O parecer técnico deve conter pelo menos 10 caracteres explicativos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await recomendacaoService.createRecomendacao({
        parcelaId,
        culturaId: selectedCulturaId ? selectedCulturaId : null,
        parecer: parecer.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const errorMsg =
        err instanceof Error ? err.message : 'Falha ao emitir recomendação técnica.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emitir Parecer / Recomendação Técnica"
      description={`Definir orientação técnica agronómica para a parcela ${parcelaNome}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <Alert variant="error">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        {/* Seleção de Cultura do Catálogo */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-primary flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            Cultura Agronómica Sugerida (Opcional)
          </label>
          <select
            value={selectedCulturaId}
            onChange={(e) => setSelectedCulturaId(e.target.value)}
            disabled={loadingCulturas || loading}
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-secondary/30 text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
          >
            <option value="">Recomendação Geral (Sem cultura específica)</option>
            {culturas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.nomeCientifico ? `(${c.nomeCientifico})` : ''} — Ideal: {c.humidadeMin}% a {c.humidadeMax}%
              </option>
            ))}
          </select>
          <p className="text-xs text-primary/70">
            {loadingCulturas
              ? 'A carregar catálogo de culturas...'
              : 'Selecione a cultura ideal para as condições e solo desta parcela.'}
          </p>
        </div>

        {/* Parecer Técnico */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-primary flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-600" />
            Parecer e Orientações Técnicas *
          </label>
          <textarea
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Ex: Recomendamos iniciar a adubação de cobertura e suspender a irrigação suplementar durante 48h devido ao índice de humidade satisfatório..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-secondary/30 text-primary placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm resize-none"
          />
          <p className="text-xs text-primary/70">
            Mínimo de 10 caracteres. Esta orientação será imediatamente notificada ao agricultor.
          </p>
        </div>

        {/* Rodapé / Botões */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Emitir e Notificar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
