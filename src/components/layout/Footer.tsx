'use client';

import React from 'react';
import { APP_CONFIG } from '@/utils/constants';
import Link from 'next/link';
import { Sprout, MapPin, Mail, Phone, Shield, ArrowRight, ExternalLink } from 'lucide-react';

export interface FooterProps {
  variant?: 'dashboard' | 'landing';
  className?: string;
}

export function Footer({ variant = 'dashboard', className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'landing') {
    return (
      <footer className={`bg-primary text-surface border-t border-secondary/20 pt-16 pb-12 px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 ${className}`}>
        <div className="w-full space-y-12">
          
          {/* Grade Principal com 4 Colunas Proporcionais em Largura Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
            
            {/* Coluna 1: Identidade do Projecto e Descrição (5 colunas) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-accent text-primary flex items-center justify-center font-black text-xl shadow-md">
                  <Sprout className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg tracking-tight text-surface">
                      {APP_CONFIG.NAME}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-sm">
                      MZ (+258)
                    </span>
                  </div>
                  <span className="text-xs text-muted font-medium block">
                    Distrito de Nhamatanda • Província de Sofala
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-surface/80 leading-relaxed">
                Sistema Integrado de Apoio à Decisão Agrícola desenvolvido para fortalecer a extensão agrária em Nhamatanda,
                conectando produtores familiares e os técnicos do SDAE com base na monitorização da humidade do solo.
              </p>

              <div className="flex items-center gap-2 text-xs text-surface/70 pt-1">
                <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>Postos Agrários: Tica, Lamego e Nhamatanda-Sede</span>
              </div>
            </div>

            {/* Coluna 2: Cooperação Institucional (3 colunas) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-accent">
                Cooperação Institucional
              </h4>
              <ul className="space-y-2.5 text-xs text-surface/80">
                <li className="flex flex-col">
                  <span className="font-semibold text-surface">Universidade Zambeze (UniZambeze)</span>
                  <span className="text-[11px] text-muted">Faculdade de Ciências Agrárias</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-surface">SDAE Nhamatanda</span>
                  <span className="text-[11px] text-muted">Governo do Distrito de Nhamatanda</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-surface">Governo da Província de Sofala</span>
                  <span className="text-[11px] text-muted">Direcção Provincial de Agricultura</span>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Acesso ao Sistema & Navegação (2 colunas) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-accent">
                Navegação
              </h4>
              <ul className="space-y-2 text-xs text-surface/80">
                <li>
                  <Link href="/dashboard" className="hover:text-accent transition-colors flex items-center gap-1.5 font-medium">
                    <span>Aceder ao Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-accent transition-colors">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#institucional" className="hover:text-accent transition-colors">
                    Sobre a Parceria
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Contacto & Suporte (2 colunas) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-accent">
                Contacto Local
              </h4>
              <ul className="space-y-2 text-xs text-surface/80">
                <li className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="break-words">sdae.nhamatanda@sofala.gov.mz</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span>+258 23 900 100</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span>Dados Locais Protegidos</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Barra Inferior de Copyright e Metadados */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface/60">
            <p className="text-center sm:text-left">
              © {currentYear} {APP_CONFIG.NAME} • Sistema Integrado de Apoio à Decisão Agrícola. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-accent font-medium">• Nhamatanda, Sofala</span>
              <span className="font-mono text-[11px] bg-white/10 px-2.5 py-1 rounded text-surface font-semibold">
                v{APP_CONFIG.VERSION}
              </span>
            </div>
          </div>

        </div>
      </footer>
    );
  }

  return (
    <footer
      className={`border-t border-secondary/15 bg-surface/50 py-6 px-4 sm:px-8 text-xs text-secondary/70 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Lado Esquerdo */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{APP_CONFIG.NAME}</span>
          <span>•</span>
          <span>© {currentYear} Todos os direitos reservados.</span>
          <span className="hidden md:inline">• Nhamatanda, Sofala</span>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-green-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Sistemas Operacionais</span>
          </div>
          <span className="text-secondary/40">|</span>
          <span className="font-mono text-[11px] bg-muted/40 px-2 py-0.5 rounded text-primary font-semibold">
            v{APP_CONFIG.VERSION}
          </span>
        </div>
      </div>
    </footer>
  );
}
