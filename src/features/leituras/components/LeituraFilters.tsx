// src/features/leituras/components/LeituraFilters.tsx
import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface ParcelaOption {
  id: string;
  nome: string;
}

interface LeituraFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedParcelaId: string;
  onParcelaChange: (value: string) => void;
  selectedValidado: 'all' | 'true' | 'false';
  onValidadoChange: (value: 'all' | 'true' | 'false') => void;
  selectedStatusHumidade: string;
  onStatusHumidadeChange: (value: string) => void;
  parcelasDisponiveis: ParcelaOption[];
  onReset: () => void;
}

export function LeituraFilters({
  searchQuery,
  onSearchChange,
  selectedParcelaId,
  onParcelaChange,
  selectedValidado,
  onValidadoChange,
  selectedStatusHumidade,
  onStatusHumidadeChange,
  parcelasDisponiveis,
  onReset,
}: LeituraFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedParcelaId !== 'TODOS' ||
    selectedValidado !== 'all' ||
    selectedStatusHumidade !== 'TODOS';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Barra de Busca Textual */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por parcela, agricultor ou observações..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-400"
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

        {/* Botão de Reset se houver filtros ativos */}
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

      {/* Linha de Seletores Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-gray-50">
        {/* Seletor de Parcela */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Parcela Agrícola
          </label>
          <select
            value={selectedParcelaId}
            onChange={(e) => onParcelaChange(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          >
            <option value="TODOS">Todas as Parcelas</option>
            {parcelasDisponiveis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Validação Técnica */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Estado de Validação
          </label>
          <select
            value={selectedValidado}
            onChange={(e) => onValidadoChange(e.target.value as 'all' | 'true' | 'false')}
            className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          >
            <option value="all">Todas as Leituras</option>
            <option value="false">⏳ Pendentes de Validação</option>
            <option value="true">✔ Validadas pelo Técnico</option>
          </select>
        </div>

        {/* Seletor de Status de Humidade */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Status de Humidade
          </label>
          <select
            value={selectedStatusHumidade}
            onChange={(e) => onStatusHumidadeChange(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          >
            <option value="TODOS">Todos os Níveis</option>
            <option value="OPTIMA">🌱 Óptima (35% a 55%)</option>
            <option value="BAIXA">🍂 Baixa (25% a 34%)</option>
            <option value="CRITICA">🚨 Crítica (&lt;25%)</option>
            <option value="EXCESSIVA">🌊 Excessiva (&gt;55%)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
