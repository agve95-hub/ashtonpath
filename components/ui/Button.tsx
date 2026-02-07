import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-[0.98]";
  
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500/25 shadow-sm border border-transparent",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500/25 border border-transparent",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-500/10 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500/10",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500/25 border border-red-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin -ml-1 mr-2" size={size === 'sm' ? 12 : 16} />}
      {children}
    </button>
  );
};