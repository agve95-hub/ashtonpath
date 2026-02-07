import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    className = '', 
    disabled,
    ...rest 
  } = props;

  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.98]";
  
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm hover:shadow-md",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-600 border border-transparent shadow-sm",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200 shadow-sm",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200",
    danger: "bg-white text-red-600 border border-red-100 hover:bg-red-50 focus:ring-red-200 hover:border-red-200 hover:shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};