import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'dark' | 'glass' | 'bordered';
}

export function Card({ variant = 'surface', className = '', children, ...props }: CardProps) {
  const variantStyles = {
    surface: 'bg-surface text-primary border border-muted/40 shadow-md',
    dark: 'bg-secondary text-surface border border-muted/20 shadow-xl',
    glass: 'bg-glass-dark text-surface border border-white/10 backdrop-blur-md shadow-2xl',
    bordered: 'bg-surface text-primary border-2 border-primary/20 shadow-sm',
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-1.5 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-xl font-bold tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm opacity-80 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-6 pt-4 border-t border-current/10 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}
