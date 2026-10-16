// src/features/culturas/components/RecomendacaoFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { culturaService } from '../services/culturaService';
import { recomendacaoService } from '../services/recomendacaoService';
import { parcelaService } from '@/features/parcelas/services/parcelaService';
import { CulturaListItem, CreateRecomendacaoInput } from '../types';
import { ParcelaListItem } from '@/features/parcelas/types';
import { FileText, Sprout, Send, AlertCircle, MapPin } from 'lucide-react';

interface RecomendacaoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelaId?: string;
  parcelaNome?: string;
  onSuccess?: () => void;
  onSubmitCustom?: (data: CreateRecomendacaoInput) => Promise<void>;
}

export function RecomendacaoFormModal({
  isOpen,
  onClose,
  parcelaId: fixedParcelaId,
  parcelaNome: fixedParcelaNome,
  onSuccess,
  onSubmitCustom,
}: RecomendacaoFormModalProps) {
  const [parcelas, setParcelas] = useState<ParcelaListItem[]>([]);
  const [culturas, setCulturas] = useState<CulturaListItem[]>([]);

  const [selectedParcelaId, setSelectedParcelaId] = useState<string>(fixedParcelaId || '');
  const [selectedCulturaId, setSelectedCulturaId] = useState<string>('');
  const [parecer, setParecer] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      setError(null);

      // Carregar culturas e (se necessário) parcelas
      const promises: Promise<unknown>[] = [
        culturaService.getCulturas().then((c) => setCulturas(c)),
      ];

      if (!fixedParcelaId) {
        promises.push(
          parcelaService.getParcelas().then((p) => {
            setParcelas(p);
            if (p.length > 0 && !selectedParcelaId) {
              setSelectedParcelaId(p[0].id);
            }
          })
        );
      } else {
        setSelectedParcelaId(fixedParcelaId);
      }

      Promise.all(promises)
        .catch(() => setError('Não foi possível carregar os dados de apoio do sistema.'))
        .finally(() => setLoadingData(false));
    } else {
      setSelectedCulturaId('');
      setParecer('');
      setError(null);
    }
  }, [isOpen, fixedParcelaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalParcelaId = fixedParcelaId || selectedParcelaId;

    if (!finalParcelaId) {
      setError('Selecione uma parcela agrícola para associar a recomendação.');
      return;
    }

    if (!parecer.trim() || parecer.trim().length < 10) {
      setError('O parecer técnico agronómico deve conter pelo menos 10 caracteres explicativos.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: CreateRecomendacaoInput = {
      parcelaId: finalParcelaId,
      culturaId: selectedCulturaId ? selectedCulturaId : null,
      parecer: parecer.trim(),
    };

    try {
      if (onSubmitCustom) {
        await onSubmitCustom(payload);
      } else {
        await recomendacaoService.createRecomendacao(payload);
      }
      onSuccess?.();
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
      title="Emitir Orientação / Recomendação Técnica"
      description={
        fixedParcelaNome
          ? `Prescrever orientação agronómica para a parcela ${fixedParcelaNome}`
          : 'Prescrever recomendação técnica para um agricultor acompanhado pelo SDAE'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <Alert variant="error">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        {/* Seleção de Parcela (se não estiver fixada) */}
        {!fixedParcelaId && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary" />
              Parcela Agrícola Supervisionada *
            </label>
            <select
              required
              value={selectedParcelaId}
              onChange={(e) => setSelectedParcelaId(e.target.value)}
              disabled={loadingData}
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {parcelas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.agricultor?.nome || 'Agricultor Familiar'} ({p.areaHectares} ha)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seleção de Cultura */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-primary flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            Cultura Agronómica Orientada (Opcional)
          </label>
          <select
            value={selectedCulturaId}
            onChange={(e) => setSelectedCulturaId(e.target.value)}
            disabled={loadingData}
            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Orientação Geral de Maneio / Solo (Sem cultura específica)</option>
            {culturas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.nomeCientifico ? `(${c.nomeCientifico})` : ''} — Humidade Ideal: {c.humidadeMin}% a {c.humidadeMax}%
              </option>
            ))}
          </select>
        </div>

        {/* Parecer Técnico */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-primary flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            Parecer Técnico e Recomendações de Campo *
          </label>
          <textarea
            required
            rows={4}
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            placeholder="Ex: Considerando a leitura de humidade abaixo do ideal (32%), recomenda-se reforçar a rega matinal ou aplicar cobertura morta (mulching) para reduzir a evaporação..."
            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-primary/60">
            <span>Mínimo 10 carateres. Seja claro para apoiar o agricultor.</span>
            <span>{parecer.length} caracteres</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-secondary/10">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || loadingData}
            leftIcon={<Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            {loading ? 'A emitir...' : 'Emitir Recomendação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
