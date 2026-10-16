// src/features/culturas/components/CulturaFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CulturaListItem, CreateCulturaInput, UpdateCulturaInput } from '../types';
import { Sprout, AlertCircle, Save } from 'lucide-react';

interface CulturaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultura?: CulturaListItem | null; // Se fornecido, modo edição
  onSubmit: (data: CreateCulturaInput | UpdateCulturaInput) => Promise<void>;
}

export function CulturaFormModal({
  isOpen,
  onClose,
  cultura,
  onSubmit,
}: CulturaFormModalProps) {
  const isEditing = !!cultura;

  const [nome, setNome] = useState('');
  const [nomeCientifico, setNomeCientifico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [humidadeMin, setHumidadeMin] = useState<number | ''>(40);
  const [humidadeMax, setHumidadeMax] = useState<number | ''>(70);
  const [cicloDias, setCicloDias] = useState<number | ''>('');
  const [epocaPlantio, setEpocaPlantio] = useState('');
  const [cuidados, setCuidados] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cultura) {
      setNome(cultura.nome);
      setNomeCientifico(cultura.nomeCientifico || '');
      setDescricao(cultura.descricao);
      setHumidadeMin(cultura.humidadeMin);
      setHumidadeMax(cultura.humidadeMax);
      setCicloDias(cultura.cicloDias || '');
      setEpocaPlantio(cultura.epocaPlantio || '');
      setCuidados(cultura.cuidados || '');
    } else {
      setNome('');
      setNomeCientifico('');
      setDescricao('');
      setHumidadeMin(40);
      setHumidadeMax(70);
      setCicloDias('');
      setEpocaPlantio('');
      setCuidados('');
    }
    setError(null);
  }, [cultura, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setError('O nome da cultura é obrigatório.');
      return;
    }

    if (!descricao.trim() || descricao.trim().length < 10) {
      setError('A descrição técnica deve ter pelo menos 10 caracteres.');
      return;
    }

    const minNum = Number(humidadeMin);
    const maxNum = Number(humidadeMax);

    if (isNaN(minNum) || isNaN(maxNum) || minNum < 0 || maxNum > 100) {
      setError('Os limiares de humidade devem ser percentuais válidos entre 0% e 100%.');
      return;
    }

    if (minNum > maxNum) {
      setError('A humidade mínima não pode ser superior à humidade máxima.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        nomeCientifico: nomeCientifico.trim() || null,
        descricao: descricao.trim(),
        humidadeMin: minNum,
        humidadeMax: maxNum,
        cicloDias: cicloDias !== '' ? Number(cicloDias) : null,
        epocaPlantio: epocaPlantio.trim() || null,
        cuidados: cuidados.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao gravar a cultura agronómica.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Cultura: ${cultura?.nome}` : 'Cadastrar Nova Cultura Agronómica'}
      description="Manutenção de parâmetros climáticos, ciclos e limiares de humidade de solo do catálogo mestre de Nhamatanda."
      size="lg"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary">
              Nome Comum da Cultura *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Milho, Mandioca, Tomate"
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Nome Científico */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary">
              Nome Científico (Botânico)
            </label>
            <input
              type="text"
              value={nomeCientifico}
              onChange={(e) => setNomeCientifico(e.target.value)}
              placeholder="Ex: Zea mays, Solanum lycopersicum"
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary italic text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-primary">
            Descrição e Importância Agrária *
          </label>
          <textarea
            required
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Apresente as características agronómicas e importância da espécie para a segurança alimentar do distrito..."
            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Parâmetros de Humidade e Ciclo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-secondary/5 border border-secondary/15">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-primary">
              Humidade Mínima (%) *
            </label>
            <input
              type="number"
              min={0}
              max={100}
              required
              value={humidadeMin}
              onChange={(e) => setHumidadeMin(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-secondary/30 text-primary text-sm font-semibold"
            />
            <p className="text-[10px] text-primary/60">Abaixo aciona alerta de seca.</p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-primary">
              Humidade Máxima (%) *
            </label>
            <input
              type="number"
              min={0}
              max={100}
              required
              value={humidadeMax}
              onChange={(e) => setHumidadeMax(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-secondary/30 text-primary text-sm font-semibold"
            />
            <p className="text-[10px] text-primary/60">Acima aciona encharcamento.</p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-primary">
              Ciclo Vegetativo (Dias)
            </label>
            <input
              type="number"
              min={1}
              value={cicloDias}
              onChange={(e) => setCicloDias(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 90"
              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-secondary/30 text-primary text-sm"
            />
            <p className="text-[10px] text-primary/60">Da emergência à colheita.</p>
          </div>
        </div>

        {/* Época de Plantio */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-primary">
            Época Recomendada de Sementeira / Plantio em Nhamatanda
          </label>
          <input
            type="text"
            value={epocaPlantio}
            onChange={(e) => setEpocaPlantio(e.target.value)}
            placeholder="Ex: Outubro a Dezembro (1ª Época) ou Março a Maio (2ª Época)"
            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Cuidados e Dicas Técnicas */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-primary">
            Orientações de Maneio Cultural e Preparação do Solo
          </label>
          <textarea
            rows={2}
            value={cuidados}
            onChange={(e) => setCuidados(e.target.value)}
            placeholder="Recomendações técnicas de preparação de canteiros, adubação de fundo, rotação de culturas..."
            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-secondary/30 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-secondary/10">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            leftIcon={<Save className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            {loading ? 'A guardar...' : isEditing ? 'Guardar Alterações' : 'Cadastrar Cultura'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
