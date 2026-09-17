'use client';

import React from 'react';
import { Avatar, Badge } from '@/components/ui';

export interface HeaderProps {
  onToggleSidebar?: () => void;
  user?: {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  };
  unreadNotificationsCount?: number;
  onNotificationsClick?: () => void;
  className?: string;
}

export function Header({
  onToggleSidebar,
  user = {
    name: 'Marcelo Silva',
    email: 'marcelo@kulimatech.co.mz',
    role: 'Administrador',
  },
  unreadNotificationsCount = 3,
  onNotificationsClick,
  className = '',
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-surface/95 backdrop-blur border-b border-secondary/20 px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-200 ${className}`}
    >
      {/* Botão de abrir menu móvel e Título */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-primary hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Alternar Menu Lateral"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg text-primary tracking-tight hidden sm:inline-block">
            KulimaTech
          </span>
          <Badge variant="accent" size="sm" className="font-mono text-[10px]">
            MZ (+258)
          </Badge>
        </div>
      </div>

      {/* Ações da direita: Pesquisa, Notificações e Perfil */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notificações */}
        <button
          type="button"
          onClick={onNotificationsClick}
          className="relative p-2 rounded-xl text-primary/80 hover:text-primary hover:bg-muted/40 transition-colors"
          aria-label="Notificações"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary ring-2 ring-surface">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Separador */}
        <div className="h-6 w-px bg-secondary/20 hidden sm:block" />

        {/* Perfil do Usuário */}
        <div className="flex items-center gap-3 pl-1">
          <Avatar name={user.name} src={user.avatarUrl} size="sm" status="online" />
          <div className="hidden md:block text-left text-xs leading-tight">
            <p className="font-bold text-primary truncate max-w-[130px]">{user.name}</p>
            <p className="text-secondary/70 truncate max-w-[130px]">{user.role || 'Usuário'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
