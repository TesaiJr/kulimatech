'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Droplets, MapPin, Smartphone, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  return (
    <section id="hero" className="pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40 lg:pb-28 bg-surface text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Lado Esquerdo: Mensagem Institucional & Ações */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 text-left">
            
            {/* Tag Institucional Sóbria */}
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-3.5 py-1.5 rounded-full border border-secondary/20">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-xs font-semibold text-secondary">
                Governo de Sofala • SDAE Nhamatanda & UniZambeze
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-primary tracking-tight leading-tight">
              Apoio à Decisão Agrícola para o Distrito de <span className="text-secondary underline decoration-accent decoration-4">Nhamatanda</span>
            </h1>

            {/* Subtítulo Objetivo */}
            <p className="text-base sm:text-lg text-secondary/85 max-w-2xl leading-relaxed">
              Plataforma distrital que conecta agricultores familiares e técnicos de extensão agrária do SDAE, combinando monitorização contínua da humidade do solo com recomendações técnicas para calibrar a rega e proteger as culturas em Sofala.
            </p>

            {/* Ações Mobile-First e Desktop Amplas */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-primary text-surface hover:bg-secondary font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99]"
                >
                  <span>Aceder ao Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              
              <a href="#como-funciona" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl border border-secondary/30 text-secondary hover:bg-secondary/10 font-semibold text-sm sm:text-base flex items-center justify-center transition-colors"
                >
                  Ver Como Funciona
                </button>
              </a>
            </div>

            {/* Indicadores Reais do Terreno */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-secondary/70">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Postos de Tica e Lamego</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Compatível com Telemóveis Simples</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Validação Agronómica Oficial</span>
              </div>
            </div>

          </div>

          {/* Lado Direito: Ficha Técnica Agronómica de Campo Preenchendo o Espaço do PC */}
          <div className="lg:col-span-6 xl:col-span-5 w-full">
            <div className="bg-white rounded-3xl border border-secondary/20 p-6 sm:p-7 shadow-sm space-y-5 w-full">
              
              {/* Cabeçalho da Ficha */}
              <div className="flex items-center justify-between pb-3.5 border-b border-secondary/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <FileText className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-primary">Ficha Agronómica de Campo</h2>
                    <p className="text-xs text-secondary/70">Parcela Tica 1 • Nhamatanda (Sofala)</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold uppercase bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                  Status: Ativa
                </span>
              </div>

              {/* Dados Medidos em Linha Dupla */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-surface border border-secondary/10 space-y-1.5">
                  <span className="text-xs font-medium text-secondary/70 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-secondary" />
                    Humidade do Solo
                  </span>
                  <p className="text-3xl font-black text-primary font-mono tracking-tight">38.4%</p>
                  <span className="text-[11px] text-green-700 font-semibold block">
                    Nível Adequado (CC 40%)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-secondary/10 space-y-1.5">
                  <span className="text-xs font-medium text-secondary/70 block">
                    Cultura & Solo
                  </span>
                  <p className="text-sm font-bold text-primary truncate">Milho (Zea mays)</p>
                  <span className="text-[11px] text-secondary/80 block">
                    Franco-Argiloso (Tica)
                  </span>
                </div>
              </div>

              {/* Histórico Recente de 3 Dias */}
              <div className="p-3 bg-surface/60 rounded-xl border border-secondary/10 flex items-center justify-between text-xs">
                <span className="text-secondary/70 font-medium">Últimas Leituras:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-primary">
                  <span>36.8%</span>
                  <span className="text-secondary/30">→</span>
                  <span>37.5%</span>
                  <span className="text-secondary/30">→</span>
                  <span className="text-secondary font-black">38.4%</span>
                </div>
              </div>

              {/* Recomendação Validada do SDAE */}
              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-secondary flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Parecer de Maneio de Rega
                  </span>
                  <span className="text-[11px] text-secondary/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Hoje, 07:15
                  </span>
                </div>
                <p className="text-xs text-primary/90 leading-relaxed">
                  "Nível hídrico dentro da margem de conforto. Efetuar rega matinal de 40 minutos para compensar a evapotranspiração do meio-dia no vale de Nhamatanda."
                </p>
                <div className="text-[11px] text-secondary/70 pt-2 border-t border-secondary/10 flex items-center justify-between">
                  <span>Extensão: Eng. António Langa</span>
                  <span className="font-semibold text-green-700">Validado SDAE</span>
                </div>
              </div>

              {/* Ação de Navegação Rápida */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-secondary/70">Ambiente de Demonstração F1</span>
                <Link
                  href="/dashboard"
                  className="font-bold text-secondary hover:text-primary underline flex items-center gap-1"
                >
                  <span>Abrir no Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
