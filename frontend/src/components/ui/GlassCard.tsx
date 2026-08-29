import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  heavy?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, heavy = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          heavy ? 'glass-panel-heavy' : 'glass-panel',
          'rounded-xl sm:rounded-2xl overflow-hidden',
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
