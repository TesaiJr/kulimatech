'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export interface MenuItemProps {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
  active?: boolean;
}

export function MenuItem({
  label,
  href,
  onClick,
  icon,
  badge,
  className = '',
  active = false,
}: MenuItemProps) {
  const content = (
    <div
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-secondary/10 text-primary font-bold'
          : 'text-secondary/80 hover:text-primary hover:bg-secondary/5'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {icon && <span className="flex-shrink-0 text-secondary">{icon}</span>}
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] font-bold uppercase bg-accent text-primary px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="block w-full">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

export function MenuDivider({ className = '' }: { className?: string }) {
  return <div className={`my-1.5 border-t border-secondary/10 ${className}`} />;
}

export interface MenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Menu({
  trigger,
  children,
  align = 'right',
  className = '',
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignClass} mt-2 w-56 bg-white rounded-2xl border border-secondary/15 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              const typedChild = child as React.ReactElement<{ onClick?: () => void }>;
              return React.cloneElement(typedChild, {
                onClick: () => {
                  if (typedChild.props.onClick) {
                    typedChild.props.onClick();
                  }
                  setIsOpen(false);
                },
              });
            }
            return child;
          })}

        </div>
      )}
    </div>
  );
}

export interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileMenuDrawer({
  isOpen,
  onClose,
  title = 'iMunda',
  subtitle = 'Nhamatanda • Sofala',
  children,
  footer,
}: MobileMenuDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex justify-end">
      {/* Backdrop com blur suave */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel Gaveta Lateral */}
      <div className="relative w-72 max-w-[85vw] h-full bg-surface shadow-2xl z-10 flex flex-col justify-between p-5 animate-in slide-in-from-right duration-200">
        <div>
          {/* Cabeçalho do Drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-secondary/15 mb-4">
            <div>
              <h3 className="font-extrabold text-base text-primary">{title}</h3>
              <p className="text-xs text-secondary/70">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-secondary hover:bg-secondary/10"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens */}
          <nav className="space-y-1">
            {children}
          </nav>
        </div>

        {/* Rodapé Opcional */}
        {footer && (
          <div className="pt-4 border-t border-secondary/15">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
