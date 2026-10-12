// src/features/users/components/AtribuicaoModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CarteiraTecnicaItem, UserAdminDTO } from '../types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, UserPlus, Search, CheckSquare, Square, AlertCircle, MapPin } from 'lucide-react';

interface AtribuicaoModalProps {
  isOpen: boolean;
  tecnicos: CarteiraTecnicaItem[];
  agricultoresPendentes: UserAdminDTO[];
  defaultTecnicoId?: string | null;
  onClose: () => void;
  onSubmit: (tecnicoId: string, agricultorIds: string[]) => Promise<boolean>;
  loading: boolean;
}

export const AtribuicaoModal: React.FC<AtribuicaoModalProps> = ({
  isOpen,
  tecnicos,
  agricultoresPendentes,
  defaultTecnicoId,
  onClose,
  onSubmit,
  loading,
}) => {
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<string>('');
  const [selectedAgriIds, setSelectedAgriIds] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTecnicoId) {
      setSelectedTecnicoId(defaultTecnicoId);
    } else if (tecnicos.length > 0) {
      setSelectedTecnicoId(tecnicos[0].tecnico.id);
    }
    setSelectedAgriIds([]);
    setSearchFilter('');
    setModalError(null);
  }, [isOpen, defaultTecnicoId, tecnicos]);

  if (!isOpen) return null;

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

    const success = await onSubmit(selectedTecnicoId, selectedAgriIds);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-xl rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Vincular Carteira Técnica</h2>
              <p className="text-xs text-muted-foreground">
                Atribuição de agricultores a um extensionista do SDAE
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {modalError && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{modalError}</span>
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
      </div>
    </div>
  );
};
