// src/features/users/components/AtribuicaoModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CarteiraTecnicaItem, UserAdminDTO } from '../types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, UserPlus, Search, CheckSquare, Square, AlertCircle, MapPin, CheckCircle2, ArrowRight, RotateCcw, Info, Sparkles } from 'lucide-react';

interface AtribuicaoModalProps {
  isOpen: boolean;
  tecnicos: CarteiraTecnicaItem[];
  agricultoresPendentes: UserAdminDTO[];
  defaultTecnicoId?: string | null;
  onClose: () => void;
  onSubmit: (tecnicoId: string, agricultorIds: string[]) => Promise<boolean>;
  loading: boolean;
  error?: string | null;
}

export const AtribuicaoModal: React.FC<AtribuicaoModalProps> = ({
  isOpen,
  tecnicos,
  agricultoresPendentes,
  defaultTecnicoId,
  onClose,
  onSubmit,
  loading,
  error: externalError,
}) => {
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<string>('');
  const [selectedAgriIds, setSelectedAgriIds] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<{
    tecnicoNome: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (defaultTecnicoId) {
      setSelectedTecnicoId(defaultTecnicoId);
    } else if (tecnicos.length > 0) {
      setSelectedTecnicoId(tecnicos[0].tecnico.id);
    }
    setSelectedAgriIds([]);
    setSearchFilter('');
    setModalError(null);
    setSuccessFeedback(null);
  }, [isOpen, defaultTecnicoId, tecnicos]);

  if (!isOpen) return null;

  const currentTecnico = tecnicos.find((t) => t.tecnico.id === selectedTecnicoId);

  const filteredAgricultores = agricultoresPendentes.filter(
    (a) =>
      a.nome.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (a.zonaAtuacao && a.zonaAtuacao.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const toggleSelectAll = () => {
    if (selectedAgriIds.length === filteredAgricultores.length) {
      setSelectedAgriIds([]);
    } else {
      setSelectedAgriIds(filteredAgricultores.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedAgriIds.includes(id)) {
      setSelectedAgriIds(selectedAgriIds.filter((item) => item !== id));
    } else {
      setSelectedAgriIds([...selectedAgriIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedTecnicoId) {
      setModalError('Selecione um técnico responsável.');
      return;
    }

    if (selectedAgriIds.length === 0) {
      setModalError('Selecione pelo menos um agricultor para vincular.');
      return;
    }

    try {
      const success = await onSubmit(selectedTecnicoId, selectedAgriIds);
      if (success) {
        setSuccessFeedback({
          tecnicoNome: currentTecnico?.tecnico.nome || 'Técnico SDAE',
          count: selectedAgriIds.length,
        });
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Falha ao vincular produtores.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-xl rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              successFeedback ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {successFeedback ? <CheckCircle2 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {successFeedback ? 'Atribuição Concluída com Sucesso' : 'Vincular Carteira Técnica'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {successFeedback
                  ? 'Resumo operacional e próximas orientações para o SDAE'
                  : 'Atribuição de agricultores a um extensionista do SDAE'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* TELA DE SUCESSO & INSTRUÇÕES SEGUINTES                                */}
        {/* =================================================================== */}
        {successFeedback ? (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Banner de Confirmação */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold">
                  {successFeedback.count} agricultor(es) vinculados com sucesso!
                </p>
                <p className="text-xs text-emerald-700">
                  Os produtores selecionados foram alocados à carteira técnica de supervisão de{' '}
                  <strong className="text-emerald-900">{successFeedback.tecnicoNome}</strong>.
                </p>
              </div>
            </div>

            {/* Caixa de Instruções Seguintes (Workflow SDAE) */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Instruções Seguintes & Próximos Passos
                </h3>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    1
                  </span>
                  <span>
                    <strong className="text-foreground">Notificações Emitidas:</strong> O técnico e os agricultores
                    já foram notificados automaticamente nas suas respectivas centrais de alertas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    2
                  </span>
                  <span>
                    <strong className="text-foreground">Supervisão de Campo:</strong> O técnico já visualiza
                    as parcelas, culturas e leituras destes produtores na aba <em>Carteiras Técnicas</em>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    3
                  </span>
                  <span>
                    <strong className="text-foreground">Comunicação e Apoio:</strong> Utilize o módulo de{' '}
                    <em>Chat</em> para iniciar conversas diretas ou emitir recomendações agronómicas específicas.
                  </span>
                </li>
              </ul>
            </div>

            {/* Ações pós-sucesso */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              {agricultoresPendentes.length > successFeedback.count && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuccessFeedback(null);
                    setSelectedAgriIds([]);
                  }}
                  className="w-full sm:w-auto h-9 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Vincular Mais Agricultores
                </Button>
              )}
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-9 px-4 text-xs font-semibold"
              >
                Concluir e Ver Carteira
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* FORMULÁRIO DE SELEÇÃO & FEEDBACK DE FALHA                           */
          /* =================================================================== */
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {(modalError || externalError) && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-800 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-rose-900">Falha ao processar a vinculação</p>
                    <p className="text-xs text-rose-700">{modalError || externalError}</p>
                  </div>
                </div>

                <div className="pl-6 pt-1 border-t border-rose-200/60 text-[11px] text-rose-600 space-y-1">
                  <p className="font-semibold text-rose-700">Instruções para continuar:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>As suas seleções de técnico e produtores foram mantidas salvas.</li>
                    <li>Verifique se a sua conexão está estável e clique em <strong>Tentar Novamente</strong>.</li>
                  </ul>
                </div>
              </div>
            )}

          {/* Selecionar Técnico */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Técnico Responsável do SDAE <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedTecnicoId}
              onChange={(e) => setSelectedTecnicoId(e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              {tecnicos.map((item) => (
                <option key={item.tecnico.id} value={item.tecnico.id}>
                  {item.tecnico.nome} ({item.totalAgricultores} agricultores já vinculados)
                </option>
              ))}
            </select>
          </div>

          {/* Selecionar Agricultores */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                Agricultores Disponíveis para Vinculação ({filteredAgricultores.length})
              </label>
              {filteredAgricultores.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {selectedAgriIds.length === filteredAgricultores.length
                    ? 'Desmarcar Todos'
                    : 'Marcar Todos'}
                </button>
              )}
            </div>

            {/* Barra de Pesquisa de Agricultores */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar agricultor por nome, zona..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Lista com Checkboxes */}
            <div className="border border-border rounded-lg max-h-56 overflow-y-auto divide-y divide-border bg-background">
              {filteredAgricultores.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Nenhum agricultor pendente de atribuição encontrado.
                </div>
              ) : (
                filteredAgricultores.map((agri) => {
                  const isChecked = selectedAgriIds.includes(agri.id);
                  return (
                    <div
                      key={agri.id}
                      onClick={() => toggleSelectOne(agri.id)}
                      className={`p-3 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isChecked ? 'bg-primary/10' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{agri.nome}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{agri.email}</p>
                        </div>
                      </div>
                      {agri.zonaAtuacao && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 ml-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{agri.zonaAtuacao}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedAgriIds.length} agricultor(es) selecionado(s)
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="h-9 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || selectedAgriIds.length === 0}
                className="h-9 px-4 text-xs"
              >
                {loading ? 'A vincular...' : 'Concluir Atribuição'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
    </div>
  );
};
