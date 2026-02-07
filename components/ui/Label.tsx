import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = (props) => {
  const { children, className = '', ...rest } = props;
  return (
    <label 
      className={`block text-xs font-bold text-slate-500 mb-1.5 ${className}`}
      {...rest}
    >
      {children}
    </label>
  );
};