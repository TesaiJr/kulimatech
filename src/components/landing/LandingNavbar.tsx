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
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Visão Geral', href: '#hero', icon: <Home className="w-4 h-4" /> },
    { label: 'Como Funciona', href: '#como-funciona', icon: <Layers className="w-4 h-4" /> },
    { label: 'Plataforma', href: '#plataforma', icon: <Monitor className="w-4 h-4" /> },
    { label: 'Institucional', href: '#institucional', icon: <Landmark className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-surface/95 backdrop-blur-md shadow-sm py-3.5 border-b border-secondary/10'
            : 'bg-surface/85 backdrop-blur-sm py-4 md:py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between">
          {/* Identidade / Logótipo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-surface flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-secondary transition-colors">
              <Sprout className="w-5 h-5 text-accent" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-primary tracking-tight leading-none">
                  iMunda
                </span>
                <span className="text-[10px] font-mono font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">
                  MZ (+258)
                </span>
              </div>
              <span className="text-[11px] text-secondary/70 font-medium tracking-wide">
                Nhamatanda • Província de Sofala
              </span>
            </div>
          </Link>

          {/* Links de Navegação no Desktop */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-secondary/80">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-secondary hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Principal Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/dashboard">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-primary text-surface hover:bg-secondary px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow active:scale-[0.99]"
              >
                <span>Aceder ao Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Botão Hambúrguer Mobile (44px) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-primary hover:bg-secondary/10 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Drawer Mobile Integrado com Menu.tsx */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="iMunda"
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
