'use client';

import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center space-x-2 text-secondary/70">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-secondary/40 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast ? (
                <span className="font-semibold text-primary flex items-center gap-1.5" aria-current="page">
                  {item.icon && <span className="text-secondary">{item.icon}</span>}
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span className="flex items-center gap-1.5">
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
