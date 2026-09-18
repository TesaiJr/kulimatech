'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Droplets, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export function ProductShowcase() {
  return (
    <section id="plataforma" className="py-10 sm:py-12 lg:py-14 bg-surface text-primary">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 space-y-8">
        
        {/* Cabeçalho da Secção */}
        <div className="max-w-3xl text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary/70">
            Interface da Plataforma
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            Tecnologia Desenvolvida para a Realidade de Campo
          </h2>
          <p className="text-sm sm:text-base text-secondary/80 leading-relaxed">
            Painel ágil adaptado para navegação direta no telemóvel pelo agricultor e monitorização detalhada pelo técnico de extensão do SDAE.
          </p>
        </div>

        {/* Quadro da Aplicação (Cartão em bg-white padronizado com as outras secções) */}
        <div className="w-full rounded-lg border border-secondary/20 bg-white text-primary p-6 sm:p-8 lg:p-10 shadow-sm space-y-7">
          
          {/* Barra Superior do Painel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-secondary/15">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-md bg-secondary/10 text-secondary font-bold text-sm flex items-center justify-center font-mono">
                iM
              </div>
              <div>
                <h3 className="font-bold text-base text-primary">Posto de Extensão Agrária de Tica</h3>
                <p className="text-xs text-secondary/70 font-mono">Distrito de Nhamatanda • Província de Sofala</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs bg-secondary/10 text-secondary font-medium px-3 py-1.5 rounded-md">
                Técnico: Eng. António Langa
              </span>
              <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1.5 rounded-md">
                Status: Leitura Validada
              </span>
            </div>
          </div>

          {/* Grid de Dados de Campo em 3 Colunas Amplas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            
            {/* Bloco 1: Monitorização de Humidade */}
            <div className="p-5 rounded-md bg-surface border border-secondary/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Humidade do Solo
                </span>
                <Droplets className="w-4 h-4 text-secondary" />
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-primary font-mono">38.4%</span>
                <span className="text-xs text-green-700 font-semibold">Adequada</span>
              </div>

              <p className="text-xs sm:text-sm text-secondary/75 leading-relaxed">
                Parcela Tica 1 (Milho). Capacidade de campo aferida em 40% com solo franco-argiloso.
              </p>

              <div className="w-full bg-secondary/15 h-2.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Bloco 2: Parecer Técnico */}
            <div className="p-5 rounded-2xl bg-surface border border-secondary/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Recomendação de Rega
                </span>
                <Activity className="w-4 h-4 text-secondary" />
              </div>

              <p className="text-sm font-semibold text-primary">
                Calibração Matinal
              </p>

              <p className="text-xs sm:text-sm text-secondary/85 leading-relaxed bg-white p-3 rounded-xl border border-secondary/10 italic">
                "Rega programada para 40 minutos entre as 06:00 e 07:00 da manhã para minimizar evapotranspiração."
              </p>

              <div className="text-xs text-secondary/70 flex items-center justify-between pt-1">
                <span>Origem: SDAE</span>
                <span className="font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Emitida Hoje
                </span>
              </div>
            </div>

            {/* Bloco 3: Vigilância de Pragas */}
            <div className="p-5 rounded-2xl bg-surface border border-secondary/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Fitossanidade
                </span>
                <ShieldAlert className="w-4 h-4 text-secondary" />
              </div>

              <p className="text-sm font-semibold text-primary">
                Vigilância de Pragas de Sofala
              </p>

              <p className="text-xs sm:text-sm text-secondary/75 leading-relaxed">
                Sem registo de infestação ativa de Lagarta-do-funil nas parcelas de Tica nas últimas 48 horas.
              </p>

              <div className="text-xs text-secondary/70 flex items-center justify-between pt-1">
                <span>Status Sanitário:</span>
                <span className="font-semibold text-green-700">Sob Controlo</span>
              </div>
            </div>

          </div>

          {/* Rodapé do Painel com Ação Direta */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-secondary/70 border-t border-secondary/15">
            <span>Experimente interagir com as visões de Administrador, Técnico e Agricultor.</span>
            <Link href="/dashboard">
              <button
                type="button"
                className="inline-flex items-center gap-2 font-bold text-secondary hover:text-primary underline text-sm"
              >
                <span>Aceder ao Dashboard Interativo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
