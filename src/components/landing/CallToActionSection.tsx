'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function CallToActionSection() {
  return (
    <section className="py-16 md:py-24 bg-surface text-primary border-t border-secondary/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Banner Cartão de Destaque em bg-white padronizado */}
        <div className="rounded-3xl bg-white border border-secondary/20 p-8 sm:p-12 lg:p-14 shadow-sm text-center space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Extensão Agrária Digital em Sofala
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight leading-tight max-w-2xl mx-auto">
              Pronto para Experimentar o Sistema no Distrito de Nhamatanda?
            </h2>

            <p className="text-sm sm:text-base text-secondary/80 max-w-xl mx-auto leading-relaxed">
              Aceda ao ambiente interativo da plataforma iMunda e explore o fluxo de trabalho entre os agricultores familiares e a equipa técnica do SDAE.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-primary text-surface hover:bg-secondary font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
              >
                <span>Aceder ao Sistema Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-secondary/65 pt-1">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Simulação ativa com perfis de Administrador, Técnico SDAE e Agricultor.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
