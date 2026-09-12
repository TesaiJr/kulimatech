import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  variant = 'accent',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-bold tracking-wide rounded-full transition-colors';

  const variantStyles = {
    primary: 'bg-primary text-surface',
    secondary: 'bg-secondary text-surface',
    accent: 'bg-accent text-primary',
    muted: 'bg-muted text-primary',
    outline: 'border border-primary text-primary bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
