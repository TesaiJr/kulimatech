'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, Badge } from '@/components/ui';
import {
  LayoutDashboard,
  MapPin,
  Droplets,
  ClipboardList,
  AlertTriangle,
  MessageSquare,
  Bell,
  Sprout,
  ShieldAlert,
  Users,
  LogOut,
  ChevronLeft,
  X,
} from 'lucide-react';
import { authService } from '@/features/auth/services/authService';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary' | 'accent' | 'muted';
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface AppSidebarProps {
  sections?: NavSection[];
  activeId?: string;
  onSelect?: (id: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  };
  className?: string;
}

/**
 * Construtor dos menus contextuais por perfil de acesso estritamente
 * alinhado com a Seção 11 (Figuras 14, 15 e 16) da monografia KulimaTech
 */
export function getRoleNavigation(role: string = 'ADMIN'): NavSection[] {
  const normalizedRole = (role || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '_');

  // PERFIL TÉCNICO SDAE (Monografia Seção 11, Fig. 15)
  if (
    normalizedRole === 'TECNICO_SDAE' ||
    normalizedRole === 'TECNICO' ||
    normalizedRole.includes('TECNICO')
  ) {
    return [
      {
        title: 'Supervisão Agrária',
        items: [
          {
            id: 'dashboard',
            label: 'Painel Técnico',
            href: '/dashboard',
            badge: 'SDAE',
            badgeVariant: 'accent',
            icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'assigned-farmers',
            label: 'Agricultores Acompanhados',
            href: '/utilizadores',
            icon: <Users className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'parcels-monitoring',
            label: 'Parcelas Supervisionadas',
            href: '/parcelas',
            icon: <MapPin className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'moisture-validation',
            label: 'Validação de Humidade',
            href: '/leituras',
            badge: '',
            badgeVariant: 'accent',
            icon: <Droplets className="w-5 h-5 flex-shrink-0" />,
          },
        ],
      },
      {
        title: 'Extensão & Fitossanidade',
        items: [
          {
            id: 'pest-reports',
            label: 'Ocorrências de Pragas',
            href: '/pragas/ocorrencias',
            badge: 'Alertas',
            badgeVariant: 'secondary',
            icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'recommendations',
            label: 'Recomendações Técnicas',
            href: '/parcelas',
            icon: <ClipboardList className="w-5 h-5 flex-shrink-0" />,
          },
        ],
      },
      {
        title: 'Comunicação & Alertas',
        items: [
          {
            id: 'messages',
            label: 'Comunicação Direta (Chat)',
            href: '/mensagens',
            icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'alerts',
            label: 'Painel de Alertas',
            href: '/mensagens/alertas',
            icon: <Bell className="w-5 h-5 flex-shrink-0" />,
          },
        ],
      },
      {
        title: 'Catálogos de Referência',
        items: [
          {
            id: 'crop-catalog',
            label: 'Catálogo de Culturas',
            href: '/culturas',
            icon: <Sprout className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'pest-catalog',
            label: 'Catálogo de Pragas & Doenças',
            href: '/pragas',
            icon: <ShieldAlert className="w-5 h-5 flex-shrink-0" />,
          },
        ],
      },
    ];
  }

  // PERFIL AGRICULTOR (Monografia Seção 11, Fig. 14)
  if (normalizedRole === 'AGRICULTOR' || normalizedRole.includes('AGRICULT')) {
    return [
      {
        title: 'Minha Exploração',
        items: [
          {
            id: 'dashboard',
            label: 'Painel da Exploração',
            href: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'my-parcels',
            label: 'As Minhas Parcelas',
            href: '/parcelas',
            badge: 'Registo',
            badgeVariant: 'accent',
            icon: <MapPin className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'moisture-readings',
            label: 'Registar Humidade do Solo',
            href: '/leituras',
            badge: 'Solo',
            badgeVariant: 'primary',
            icon: <Droplets className="w-5 h-5 flex-shrink-0" />,
          },
        ],
      },
      {
        title: 'Acompanhamento Técnico',
        items: [
          {
            id: 'received-recommendations',
            label: 'Recomendações Recebidas',
            href: '/parcelas',
            icon: <ClipboardList className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'report-pest',
            label: 'Reportar Ocorrência',
            href: '/pragas/ocorrencias',
            badge: 'Alerta',
            badgeVariant: 'secondary',
            icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'technician-contact',
            label: 'Meu Técnico SDAE',
            href: '/mensagens',
            icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'alerts',
            label: 'Os Meus Alertas',
            href: '/mensagens/alertas',
            icon: <Bell className="w-5 h-5 flex-shrink-0" />,
          },
        ],
      },
      {
        title: 'Conhecimento',
        items: [
          {
            id: 'crop-catalog',
            label: 'Catálogo de Culturas',
            href: '/culturas',
            icon: <Sprout className="w-5 h-5 flex-shrink-0" />,
          },
          {
            id: 'pest-catalog',
            label: 'Catálogo de Pragas & Doenças',
            href: '/pragas',
            icon: <ShieldAlert className="w-5 h-5 flex-shrink-0" />,
          },
        ],
      },
    ];
  }

  // PERFIL ADMINISTRADOR (Monografia Seção 11, Fig. 16)
  return [
    {
      title: 'Administração Distrital',
      items: [
        {
          id: 'dashboard',
          label: 'Painel do Sistema',
          href: '/dashboard',
          badge: 'Admin',
          badgeVariant: 'accent',
          icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
        },
        {
          id: 'parcels',
          label: 'Todas as Parcelas',
          href: '/parcelas',
          icon: <MapPin className="w-5 h-5 flex-shrink-0" />,
        },
        {
          id: 'users',
          label: 'Utilizadores & Atribuições',
          href: '/utilizadores',
          badge: '',
          badgeVariant: 'primary',
          icon: <Users className="w-5 h-5 flex-shrink-0" />,
        },
        {
          id: 'readings-audit',
          label: 'Auditoria de Leituras',
          href: '/leituras',
          icon: <Droplets className="w-5 h-5 flex-shrink-0" />,
        },
      ],
    },
    {
      title: 'Catálogos Mestres',
      items: [
        {
          id: 'crop-catalog',
          label: 'Catálogo de Culturas',
          href: '/culturas',
          icon: <Sprout className="w-5 h-5 flex-shrink-0" />,
        },
        {
          id: 'pest-catalog',
          label: 'Catálogo de Pragas & Doenças',
          href: '/pragas',
          icon: <ShieldAlert className="w-5 h-5 flex-shrink-0" />,
        },
        {
          id: 'pest-occurrences-master',
          label: 'Ocorrências Fitossanitárias',
          href: '/pragas/ocorrencias',
          icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
        },
      ],
    },
    {
      title: 'Comunicação & Governança',
      items: [
        {
          id: 'messages',
          label: 'Mensagens do Sistema',
          href: '/mensagens',
          icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />,
        },
        {
          id: 'alerts',
          label: 'Alertas Distritais',
          href: '/mensagens/alertas',
          icon: <Bell className="w-5 h-5 flex-shrink-0" />,
        },
      ],
    },
  ];
}

export function AppSidebar({
  sections,
  activeId,
  onSelect,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  user: userProp,
  className = '',
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser } = useAuth();

  const user = userProp || (authUser ? {
    name: authUser.nome,
    email: authUser.email,
    role: authUser.role,
  } : undefined);

  // Deriva secções de navegação do perfil
  const resolvedSections = sections || getRoleNavigation(user?.role || 'ADMIN');
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  /**
   * Determina com precisão se o item está ativo:
   * 1. Pela rota (pathname)
   * 2. Pelo activeId explícito
   */
  const isItemActive = (item: NavItem): boolean => {
    if (activeId && item.id === activeId) return true;
    if (!item.href || !pathname) return false;

    if (item.href === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (item.href === '/pragas') {
      return pathname === '/pragas';
    }
    if (item.href === '/pragas/ocorrencias') {
      return pathname.startsWith('/pragas/ocorrencias');
    }
    if (item.href === '/mensagens') {
      return pathname === '/mensagens';
    }
    if (item.href === '/mensagens/alertas') {
      return pathname.startsWith('/mensagens/alertas');
    }
    if (item.href === '/parcelas') {
      return pathname === '/parcelas' || pathname.startsWith('/parcelas/');
    }
    if (item.href === '/leituras') {
      return pathname === '/leituras' || pathname.startsWith('/leituras/');
    }
    if (item.href === '/culturas') {
      return pathname === '/culturas' || pathname.startsWith('/culturas/');
    }
    if (item.href === '/utilizadores') {
      return pathname === '/utilizadores' || pathname.startsWith('/utilizadores/');
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const formatRoleLabel = (role?: string) => {
    if (!role) return 'Utilizador';
    const norm = role
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    if (norm.includes('AGRICULT')) return 'Agricultor Familiar';
    if (norm.includes('TECNICO')) return 'Técnico SDAE';
    if (norm.includes('ADMIN')) return 'Administrador Distrital';
    return role;
  };

  const content = (
    <div className="h-full flex flex-col justify-between p-4 text-surface">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-muted/20 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
              KT
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h2 className="font-extrabold text-lg tracking-wide text-surface leading-tight">
                  KulimaTech
                </h2>
                <span className="text-[10px] text-muted uppercase font-mono tracking-wider">
                  Nhamatanda · MZ
                </span>
              </div>
            )}
          </div>

          {/* Botão de Fechar no Mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-surface/70 hover:text-surface hover:bg-white/10"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {resolvedSections.map((section, secIdx) => (
            <div key={secIdx} className="space-y-1.5">
              {!isCollapsed && section.title && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted/60">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isItemActive(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.href) {
                          router.push(item.href);
                        } else if (onSelect) {
                          onSelect(item.id);
                        }
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
                      } py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        active
                          ? 'bg-accent text-primary font-bold shadow-md'
                          : 'text-surface/80 hover:bg-primary/50 hover:text-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <Badge
                          variant={item.badgeVariant || (active ? 'primary' : 'accent')}
                          size="sm"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer & Collapse Toggle */}
      <div className="space-y-3 pt-4 border-t border-muted/20">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-surface/70 hover:bg-white/10 hover:text-surface transition-colors text-xs font-semibold gap-2"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            />
            {!isCollapsed && <span>Recolher Menu</span>}
          </button>
        )}

        {user && (
          <div className="space-y-2">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
              <Avatar name={user.name} src={user.avatarUrl} status="online" size="md" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-surface truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{formatRoleLabel(user.role)}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                authService.logout();
                window.location.href = '/auth?mode=login';
              }}
              title="Terminar Sessão"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-2 px-3'
              } py-2 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-colors text-xs font-semibold`}
            >
              <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
              {!isCollapsed && <span>Terminar Sessão</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 bg-secondary ${sidebarWidth} border-r border-muted/20 shadow-xl transition-all duration-300 z-20 ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Drawer (Backdrop + Slide) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-secondary shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
