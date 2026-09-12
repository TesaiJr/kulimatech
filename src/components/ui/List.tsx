import React from 'react';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: 'divided' | 'spaced';
}

export function List({ variant = 'divided', className = '', children, ...props }: ListProps) {
  const variantStyles = {
    divided: 'divide-y divide-secondary/10 bg-surface rounded-2xl border border-secondary/20 shadow-sm',
    spaced: 'space-y-2.5',
  };

  return (
    <ul className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </ul>
  );
}

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function ListItem({ leftIcon, rightElement, className = '', children, ...props }: ListItemProps) {
  return (
    <li
      className={`px-4 py-3.5 flex items-center justify-between gap-3 text-sm text-primary hover:bg-muted/20 transition-colors ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {leftIcon && <span className="text-secondary flex-shrink-0">{leftIcon}</span>}
        <div>{children}</div>
      </div>
      {rightElement && <div className="flex-shrink-0">{rightElement}</div>}
    </li>
  );
}
