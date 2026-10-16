'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePollingNotification } from '@/hooks/usePollingNotification';
import { STORAGE_KEYS } from '@/utils/constants';
import { AuthUser } from '@/types/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';

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
  user: userProp,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { unreadCount } = usePollingNotification();

  const user = userProp || (authUser ? {
    name: authUser.nome,
    email: authUser.email,
    role: authUser.role,
  } : undefined);
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
        unreadAlertsCount={unreadCount}
      />

      {/* Conteúdo Principal + Header + Footer */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsMobileOpen((prev) => !prev)}
          user={user}
          unreadNotificationsCount={unreadCount}
          onNotificationsClick={() => router.push('/mensagens/alertas')}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
