import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'bordered' | 'gradient' | 'default';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-navy-400/50 border border-white/5',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-glass',
    bordered: 'bg-navy-400/30 border border-white/10',
    gradient: 'bg-gradient-to-br from-teal-500/10 to-amber-500/5 border border-white/10',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        hover && 'hover:border-teal-500/20 hover:shadow-neon cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
