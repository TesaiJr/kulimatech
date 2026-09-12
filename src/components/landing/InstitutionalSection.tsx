'use client';

import React from 'react';
import { GraduationCap, Landmark } from 'lucide-react';

export function InstitutionalSection() {
  return (
    <section id="institucional" className="py-16 md:py-24 lg:py-28 bg-surface text-primary border-t border-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-12">
        
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

        {/* Blocos das Duas Entidades Parceiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full">
          
          {/* Entidade 1: Universidade Zambeze */}
          <div className="p-7 sm:p-9 lg:p-10 rounded-3xl border border-secondary/20 bg-white shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary block">
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

            <div className="pt-4 border-t border-secondary/10 text-xs font-semibold text-secondary/70">
              • Cooperação em Pesquisa e Validação Científica
            </div>
          </div>

          {/* Entidade 2: SDAE Nhamatanda */}
          <div className="p-7 sm:p-9 lg:p-10 rounded-3xl border border-secondary/20 bg-white shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Landmark className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary block">
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

            <div className="pt-4 border-t border-secondary/10 text-xs font-semibold text-primary/70">
              • Coordenação da Rede de Extensão Agrária Distrital
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
