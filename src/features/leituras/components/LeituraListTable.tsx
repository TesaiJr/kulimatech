// src/features/leituras/components/LeituraListTable.tsx
import React from 'react';
import { LeituraSoloDTO } from '../types';
import { HumidadeGaugeBar } from './HumidadeGaugeBar';
import { CheckCircle2, Clock, Check, AlertCircle, Thermometer, UserCheck } from 'lucide-react';

interface LeituraListTableProps {
  leituras: LeituraSoloDTO[];
  loading?: boolean;
  canValidate?: boolean;
  onOpenValidarModal: (leitura: LeituraSoloDTO) => void;
}

export function LeituraListTable({
  leituras,
  loading,
  canValidate,
  onOpenValidarModal,
}: LeituraListTableProps) {
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

  if (leituras.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Nenhuma leitura encontrada
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Não foram encontradas medições com os filtros selecionados. Tente ajustar os parâmetros ou registar uma nova leitura de solo.
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Data e Hora</th>
              <th className="py-3.5 px-4">Parcela / Agricultor</th>
              <th className="py-3.5 px-4">Humidade</th>
              <th className="py-3.5 px-4">Temp.</th>
              <th className="py-3.5 px-4">Validação Técnica</th>
              <th className="py-3.5 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {leituras.map((leitura) => {
              const isValidada = leitura.validadoPorTecnico;

              return (
                <tr
                  key={leitura.id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Data e Hora */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-gray-600">
                    {formatData(leitura.dataLeitura)}
                  </td>

                  {/* Parcela e Agricultor */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">
                      {leitura.parcela?.nome || 'Parcela'}
                    </div>
                    {leitura.parcela?.agricultor?.nome && (
                      <div className="text-xs text-gray-500 font-medium">
                        {leitura.parcela.agricultor.nome}
                      </div>
                    )}
                  </td>

                  {/* Humidade com Escala */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <HumidadeGaugeBar humidade={leitura.humidade} compact />
                  </td>

                  {/* Temperatura */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600 font-medium">
                    {leitura.temperatura != null ? (
                      <span className="inline-flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-gray-400" />
                        {leitura.temperatura}°C
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Validação Técnica */}
                  <td className="py-3.5 px-4">
                    {isValidada ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Homologada
                        </span>
                        {leitura.tecnicoValidador && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            {leitura.tecnicoValidador.nome}
                          </div>
                        )}
                        {leitura.observacoesTecnicas && (
                          <div className="text-[11px] text-gray-600 italic bg-gray-50 rounded px-1.5 py-0.5 border border-gray-100 max-w-xs truncate">
                            &quot;{leitura.observacoesTecnicas}&quot;
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Pendente
                        </span>
                        <p className="text-[11px] text-gray-400">Aguardando parecer</p>
                      </div>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {canValidate ? (
                      <button
                        onClick={() => onOpenValidarModal(leitura)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                          !isValidada
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {!isValidada ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Validar
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Revisar
                          </>
                        )}
                      </button>
                    ) : (
                      isValidada && leitura.observacoesTecnicas ? (
                        <button
                          onClick={() => onOpenValidarModal(leitura)}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                        >
                          Ver Parecer
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )
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
