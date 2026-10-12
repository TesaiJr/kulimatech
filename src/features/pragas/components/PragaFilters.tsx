// src/features/pragas/components/PragaFilters.tsx
import React from 'react';
import { Search, Filter, X, Sprout } from 'lucide-react';

interface CulturaOption {
  id: string;
  nome: string;
}

interface PragaFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCulturaId: string;
  onCulturaChange: (value: string) => void;
  selectedSeveridade: string;
  onSeveridadeChange: (value: string) => void;
  culturas: CulturaOption[];
  onReset: () => void;
}

export function PragaFilters({
  searchQuery,
  onSearchChange,
  selectedCulturaId,
  onCulturaChange,
  selectedSeveridade,
  onSeveridadeChange,
  culturas,
  onReset,
}: PragaFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCulturaId !== 'TODOS' ||
    selectedSeveridade !== 'TODOS';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Barra de Pesquisa */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar praga por nome, sintomas ou métodos de combate..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors self-start md:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Seletores Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-50">
        {/* Filtro por Cultura */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sprout className="w-3 h-3 text-emerald-600" />
            Cultura Afetada
          </label>
          <select
            value={selectedCulturaId}
            onChange={(e) => onCulturaChange(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          >
            <option value="TODOS">Todas as Culturas</option>
            {culturas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Severidade Padrão */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Nível de Severidade
          </label>
          <select
            value={selectedSeveridade}
            onChange={(e) => onSeveridadeChange(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          >
            <option value="TODOS">Todas as Severidades</option>
            <option value="BAIXA">🟢 Severidade Baixa</option>
            <option value="MEDIA">🟡 Severidade Média</option>
            <option value="ALTA">🟠 Severidade Alta</option>
            <option value="CRITICA">🔴 Severidade Crítica</option>
          </select>
        </div>
      </div>
    </div>
  );
}
