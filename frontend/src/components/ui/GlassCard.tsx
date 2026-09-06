import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  heavy?: boolean;
  elevated?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, heavy = false, elevated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          heavy ? 'glass-panel-heavy' : elevated ? 'glass-panel-elevated' : 'glass-panel',
          'rounded-2xl overflow-hidden',
          'transition-[transform,box-shadow] duration-300 ease-out',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
