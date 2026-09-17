'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/utils/constants';
import { AuthUser } from '@/types/auth';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  activeNavId?: string;
  onSelectNavId?: (id: string) => void;
  user?: AuthUser | {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  };
}


export function DashboardLayout({
  children,
  activeNavId = 'dashboard',
  onSelectNavId,
  user = {
    name: 'Marcelo Silva',
    email: 'marcelo@kulimatech.co.mz',
    role: 'Administrador do Sistema',
  },
}: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
    STORAGE_KEYS.SIDEBAR_COLLAPSED,
    false
  );

  return (
    <div className="min-h-screen flex bg-surface text-primary">
      {/* Sidebar Integrado (Desktop + Mobile Drawer) */}
      <AppSidebar
        activeId={activeNavId}
        onSelect={onSelectNavId}
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        user={user}
      />

      {/* Conteúdo Principal + Header + Footer */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsMobileOpen((prev) => !prev)}
          user={user}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
