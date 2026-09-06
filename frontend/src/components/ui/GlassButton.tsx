import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'secondary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    const baseStyle = variant === 'primary' 
      ? 'glass-button-primary' 
      : variant === 'danger' 
      ? 'glass-button-danger' 
      : 'glass-button';
    
    const sizeStyle = size === 'sm' 
      ? 'px-3 py-1.5 text-xs gap-1.5'
      : size === 'lg'
      ? 'px-6 py-3 text-base gap-2.5'
      : 'px-4 py-2.5 text-sm gap-2';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyle,
          sizeStyle,
          'inline-flex items-center justify-center',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin h-4 w-4 shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
