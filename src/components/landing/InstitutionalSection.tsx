'use client';

import React from 'react';
import { GraduationCap, Landmark } from 'lucide-react';

export function InstitutionalSection() {
  return (
    <section id="institucional" className="pt-5 sm:pt-6 lg:pt-7 pb-5 sm:pb-6 lg:pb-7 bg-surface text-primary">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 space-y-5 sm:space-y-6">
        
        {/* Cabeçalho da Secção com Fundo Padronizado */}
        <div className="max-w-3xl text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary/70">
            Cooperação Técnico-Científica
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            Parceria Institucional para a Extensão Agrária
          </h2>
          <p className="text-sm sm:text-base text-secondary/80 leading-relaxed">
            União entre o conhecimento científico da academia e a experiência operacional dos técnicos de campo no distrito de Nhamatanda.
          </p>
        </div>

        {/* Blocos das Duas Entidades Parceiras com Separação Padronizada (gap-5 lg:gap-6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 w-full">
          
          {/* Entidade 1: Universidade Zambeze */}
          <div className="p-6 sm:p-7 lg:p-8 rounded-lg border border-[#0e4749]/20 bg-[#e4ede6] shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-md bg-[#0e4749] text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0e4749] block">
                  Pesquisa & Inovação Tecnológica
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  Universidade Zambeze (UniZambeze)
                </h3>
                <p className="text-xs sm:text-sm text-secondary/70">
                  Faculdade de Ciências Agrárias / Engenharia
                </p>
              </div>

              <p className="text-sm text-secondary/85 leading-relaxed">
                Modelação agronómica das necessidades hídricas, calibração dos limiares de humidade para solos franco-argilosos da região Centro de Moçambique e concepção da arquitetura digital do sistema de apoio à decisão.
              </p>
            </div>

            <div className="pt-3.5 border-t border-[#0e4749]/15 text-xs font-semibold text-secondary/70">
              • Cooperação em Pesquisa e Validação Científica
            </div>
          </div>

          {/* Entidade 2: SDAE Nhamatanda */}
          <div className="p-6 sm:p-7 lg:p-8 rounded-lg border border-[#002626]/20 bg-[#e4ede6] shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-md bg-[#002626] text-[#95c623] flex items-center justify-center shadow-sm">
                <Landmark className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#002626] block">
                  Implementação & Extensão no Terreno
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  SDAE Nhamatanda
                </h3>
                <p className="text-xs sm:text-sm text-secondary/70">
                  Governo do Distrito de Nhamatanda • Província de Sofala
                </p>
              </div>

              <p className="text-sm text-secondary/85 leading-relaxed">
                Atuação operacional direta com as associações agrícolas e produtores familiares nos postos de Tica, Lamego e Nhamatanda-Sede: validação de dados de solo, emissão de pareceres de rega e vigilância fitossanitária contínua.
              </p>
            </div>

            <div className="pt-4 border-t border-[#002626]/15 text-xs font-semibold text-primary/70">
              • Coordenação da Rede de Extensão Agrária Distrital
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
