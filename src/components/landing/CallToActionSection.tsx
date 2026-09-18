'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function CallToActionSection() {
  return (
    <section className="pt-5 sm:pt-6 lg:pt-7 pb-10 sm:pb-12 lg:pb-14 bg-surface text-primary">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
        
        {/* Banner Cartão de Destaque em tom Verde-Petróleo Escuro Rico */}
        <div className="rounded-lg bg-[#002626] border border-[#95c623]/30 p-7 sm:p-10 lg:p-12 shadow-xl text-center space-y-5 sm:space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#95c623]">
              Extensão Agrária Digital em Sofala
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
              Pronto para Experimentar o Sistema no Distrito de{' '}
              <span className="text-[#95c623]">Nhamatanda</span>?
            </h2>

            <p className="text-sm sm:text-base text-[#FEFAE0]/85 max-w-2xl mx-auto leading-relaxed">
              Aceda ao ambiente interativo da plataforma KulimaTech e explore o fluxo de trabalho entre os agricultores familiares e a equipa técnica do SDAE.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/auth" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto min-h-[50px] px-9 py-3.5 rounded-md bg-[#95c623] hover:bg-white text-[#002626] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.99] group"
              >
                <span>Aceder ao Sistema Agora</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#FEFAE0]/70 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#95c623]" />
            <span>Simulação ativa com perfis de Administrador, Técnico SDAE e Agricultor.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
