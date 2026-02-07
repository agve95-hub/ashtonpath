import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-none border-slate-300 bg-white text-slate-900 shadow-sm transition-all
              placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600
              disabled:cursor-not-allowed disabled:opacity-50
              ${icon ? 'pl-10' : 'px-3'} py-2.5 text-sm border
              ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';