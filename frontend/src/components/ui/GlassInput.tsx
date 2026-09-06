import React from 'react';
import { cn } from '../../utils/cn';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2 ml-0.5">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-indigo-400 transition-colors duration-200">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'glass-input w-full block px-4 py-2.5 text-sm',
              icon ? 'pl-10' : '',
              error ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400 ml-0.5 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
