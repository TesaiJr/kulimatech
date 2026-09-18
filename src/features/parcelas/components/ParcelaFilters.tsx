import React from 'react';
import { ViewMode } from '../hooks/useParcelas';
import { TipoSolo } from '../types';
import { Search, Filter, LayoutGrid, List as ListIcon, User } from 'lucide-react';
import { Button } from '@/components/ui';

export interface ParcelaFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSolo: TipoSolo | 'TODOS';
  onSoloChange: (value: TipoSolo | 'TODOS') => void;
  selectedAgricultorId?: string;
  onAgricultorChange?: (value: string) => void;
  agricultoresOptions?: { id: string; nome: string }[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  userRole?: string;
}

export function ParcelaFilters({
  searchQuery,
  onSearchChange,
  selectedSolo,
  onSoloChange,
  selectedAgricultorId = 'TODOS',
  onAgricultorChange,
  agricultoresOptions = [],
  viewMode,
  onViewModeChange,
  userRole = 'AGRICULTOR',
}: ParcelaFiltersProps) {
  const isTecnico = userRole === 'TECNICO_SDAE' || userRole === 'TECNICO';

  return (
    <div className="bg-[#e6efe8] p-4 rounded-lg border border-[#8eb69b]/40 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Pesquisa por Texto */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-secondary/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por nome da parcela, localização ou produtor..."
            className="w-full bg-white border border-[#8eb69b]/50 rounded-md pl-9 pr-3.5 py-2 text-xs font-semibold text-[#002626] placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-[#95c623]"
          />
        </div>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Tipo de Solo */}
          <div className="flex items-center gap-1.5 bg-white border border-[#8eb69b]/50 rounded-md px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#0e4749]" />
            <select
              value={selectedSolo}
              onChange={(e) => onSoloChange(e.target.value as TipoSolo | 'TODOS')}
              className="bg-transparent font-semibold text-[#002626] focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos os Solos</option>
              <option value="ARENOSO">Arenoso</option>
              <option value="ARGILOSO">Argiloso</option>
              <option value="FRANCO">Franco-Argiloso</option>
              <option value="MISTO">Misto</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          {/* Seletor de Agricultor (para o Técnico) */}
          {isTecnico && onAgricultorChange && agricultoresOptions.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#8eb69b]/50 rounded-md px-2.5 py-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-[#0e4749]" />
              <select
                value={selectedAgricultorId}
                onChange={(e) => onAgricultorChange(e.target.value)}
                className="bg-transparent font-semibold text-[#002626] focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos os Produtores</option>
                {agricultoresOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Alternador de Modo de Exibição (Cards vs Tabela) */}
          <div className="flex items-center bg-white border border-[#8eb69b]/50 p-1 rounded-md">
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'cards' ? 'primary' : 'ghost'}
              className={`p-1.5 h-7 w-7 rounded-sm ${
                viewMode === 'cards' ? 'bg-[#002626] text-[#95c623]' : 'text-secondary/70 hover:text-[#002626]'
              }`}
              onClick={() => onViewModeChange('cards')}
              title="Exibição em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              className={`p-1.5 h-7 w-7 rounded-sm ${
                viewMode === 'table' ? 'bg-[#002626] text-[#95c623]' : 'text-secondary/70 hover:text-[#002626]'
              }`}
              onClick={() => onViewModeChange('table')}
              title="Exibição em Tabela"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
