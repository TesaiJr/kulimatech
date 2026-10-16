// src/features/pragas/components/OcorrenciaListTable.tsx
import React from 'react';
import { OcorrenciaPragaDTO } from '../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bug,
  UserCheck,
  FileText,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

interface OcorrenciaListTableProps {
  ocorrencias: OcorrenciaPragaDTO[];
  loading?: boolean;
  canResolve?: boolean;
  onOpenResolveModal: (ocorrencia: OcorrenciaPragaDTO) => void;
}

export function OcorrenciaListTable({
  ocorrencias,
  loading,
  canResolve = false,
  onOpenResolveModal,
}: OcorrenciaListTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (ocorrencias.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bug className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Nenhuma ocorrência encontrada
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Não foram encontradas ocorrências com os filtros selecionados. As ocorrências reportadas pelos produtores surgirão aqui.
        </p>
      </div>
    );
  }

  const formatData = (d: string | Date) => {
    try {
      const data = new Date(d);
      return data.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(d);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVIDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolvida
          </span>
        );
      case 'EM_ANALISE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Em Análise
          </span>
        );
      case 'ABERTA':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Aberta
          </span>
        );
    }
  };

  const getSeveridadeBadge = (severidade: string) => {
    switch (severidade) {
      case 'CRITICA':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ALTA':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIA':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'BAIXA':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Data do Reporte</th>
              <th className="py-3.5 px-4">Parcela / Agricultor</th>
              <th className="py-3.5 px-4">Praga Suspeita</th>
              <th className="py-3.5 px-4">Severidade</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4">Parecer Técnico</th>
              <th className="py-3.5 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {ocorrencias.map((oco) => {
              const isResolvida = oco.status === 'RESOLVIDA';

              return (
                <tr key={oco.id} className="hover:bg-gray-50/60 transition-colors group">
                  {/* Data */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-gray-600">
                    {formatData(oco.dataReporte)}
                  </td>

                  {/* Parcela e Agricultor */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">
                      {oco.parcela?.nome || 'Parcela'}
                    </div>
                    {oco.agricultor?.nome && (
                      <div className="text-xs text-gray-500 font-medium">
                        {oco.agricultor.nome}
                      </div>
                    )}
                  </td>

                  {/* Praga */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-emerald-600" />
                      {oco.praga?.nome || 'Não identificada'}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                      &quot;{oco.descricao}&quot;
                    </div>
                  </td>

                  {/* Severidade */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSeveridadeBadge(
                        oco.severidade
                      )}`}
                    >
                      {oco.severidade}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(oco.status)}
                  </td>

                  {/* Parecer Técnico */}
                  <td className="py-3.5 px-4">
                    {oco.parecerTecnico ? (
                      <div className="space-y-0.5 max-w-xs">
                        <div className="text-xs text-gray-800 font-medium line-clamp-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                          {oco.parecerTecnico}
                        </div>
                        {oco.tecnicoResolutor && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            {oco.tecnicoResolutor.nome}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Sem parecer emitido
                      </span>
                    )}
                  </td>

                  {/* Ação */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {canResolve ? (
                      <button
                        onClick={() => onOpenResolveModal(oco)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                          !isResolvida
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        {!isResolvida ? 'Resolver' : 'Revisar Parecer'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenResolveModal(oco)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        Ver Detalhes
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
