'use client';

import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface SidebarNavItemData {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  href?: string;
}

export interface SidebarProps {
  brandName?: string;
  brandLogo?: React.ReactNode;
  items: SidebarNavItemData[];
  activeItemId?: string;
  onSelect?: (id: string) => void;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  className?: string;
}

export function Sidebar({
  brandName = 'SISTEMA',
  brandLogo,
  items,
  activeItemId,
  onSelect,
  user,
  className = '',
}: SidebarProps) {
  const [selectedId, setSelectedId] = useState<string>(activeItemId || items[0]?.id || '');

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelect) onSelect(id);
  };

  return (
    <aside
      className={`w-64 h-full min-h-screen bg-secondary text-surface flex flex-col justify-between p-4 border-r border-muted/20 shadow-xl ${className}`}
    >
      <div className="space-y-6">
        {/* Sidebar Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-muted/20 pb-4">
          {brandLogo || (
            <div className="w-9 h-9 rounded-xl bg-accent text-primary flex items-center justify-center font-black text-lg shadow-md">
              S
            </div>
          )}
          <div>
            <h2 className="font-extrabold text-base tracking-wide text-surface">{brandName}</h2>
            <span className="text-[10px] text-muted uppercase font-mono tracking-wider">Painel Principal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {items.map((item) => {
            const isActive = item.id === selectedId;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-accent text-primary font-bold shadow-md'
                    : 'text-surface/80 hover:bg-primary/50 hover:text-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant={isActive ? 'primary' : 'accent'} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      {user && (
        <div className="pt-4 border-t border-muted/20 flex items-center gap-3 px-2">
          <Avatar name={user.name} src={user.avatarUrl} status="online" size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-surface truncate">{user.name}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
