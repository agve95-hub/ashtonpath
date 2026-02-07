import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Modal: React.FC<ModalProps> = (props) => {
  const { isOpen, onClose, children, title } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-white sticky top-0 z-10">
           <h2 className="text-lg font-bold text-slate-800">{title}</h2>
           <button 
             onClick={onClose} 
             className="p-2 -mr-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
        <div className="p-0">
           {children}
        </div>
      </div>
    </div>
  );
};