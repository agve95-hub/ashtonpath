import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = (props) => {
  const { children, className = '' } = props;
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = (props) => {
  const { children, className = '' } = props;
  return (
    <div className={`px-6 py-5 border-b border-slate-50 bg-white flex flex-col justify-center ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = (props) => {
  const { children, className = '' } = props;
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};