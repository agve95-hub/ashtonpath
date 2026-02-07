import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className = '', label, error, icon, ...rest } = props;
  
  return (
    <div className="w-full space-y-1.5 group">
      {label && (
        <label className="block text-xs font-bold text-slate-500 group-focus-within:text-teal-700 transition-colors ml-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-lg border-slate-200 bg-white text-slate-900 shadow-sm transition-all duration-200
            placeholder:text-slate-400 font-medium
            focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50
            ${icon ? 'pl-10' : 'px-3.5'} py-2.5 text-sm border
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'hover:border-slate-300'}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1 font-medium animate-in slide-in-from-top-1 fade-in">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';