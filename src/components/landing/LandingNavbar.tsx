'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ArrowRight, Sprout, Home, Layers, Monitor, Landmark } from 'lucide-react';
import { MobileMenuDrawer, MenuItem } from '@/components/ui';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('hero');
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        // Apenas fica com cor azul quando nao estiver em cima da imagem
        setIsScrolled(heroBottom <= 0);
      } else {
        setIsScrolled(window.scrollY > 400);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const navLinks = [
    { label: 'Visão Geral', href: '#hero', icon: <Home className="w-4 h-4" /> },
    { label: 'Como Funciona', href: '#como-funciona', icon: <Layers className="w-4 h-4" /> },
    { label: 'Institucional', href: '#institucional', icon: <Landmark className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-primary shadow-md py-3 text-white'
            : 'bg-transparent py-4 md:py-6 text-white'
        }`}
      >
        <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 flex items-center justify-between">
          {/* Identidade / Logótipo à Esquerda */}
          <Link href="/" className="flex items-center gap-3.5 group z-10">
            <div className="w-9 h-9 rounded-md bg-accent text-primary flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-primary stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-white tracking-tight leading-none drop-shadow">
                  KulimaTech
                </span>
              </div>
              <span className="text-[11px] text-white/80 font-medium tracking-wide drop-shadow">
                Nhamatanda • Província de Sofala
              </span>
            </div>
          </Link>

          {/* Links de Navegação no Desktop (Perfeitamente Centralizados no Meio da Barra) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-white/90 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-accent transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all drop-shadow"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Gatilho do Menu Mobile */}
          <div className="flex items-center z-10">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Abrir Menu de Navegação"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Mobile Integrado com Menu.tsx */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="KulimaTech"
        subtitle="Distrito de Nhamatanda • Sofala"
        footer={
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
            <button
              type="button"
              className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-primary text-surface rounded-xl text-sm font-bold shadow-sm"
            >
              <span>Aceder ao Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        }
      >
        {navLinks.map((link) => (
          <MenuItem
            key={link.href}
            label={link.label}
            href={link.href}
            icon={link.icon}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        ))}
      </MobileMenuDrawer>
    </>
  );
}
