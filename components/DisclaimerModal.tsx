import React from 'react';
import { Button } from './ui/Button';
import { DISCLAIMER_TEXT } from '../constants';
import { AlertTriangle, Check } from 'lucide-react';

interface Props {
  onAccept: () => void;
  isOpen: boolean;
}

export const DisclaimerModal: React.FC<Props> = ({ onAccept, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header - Fixed at top */}
        <div className="bg-amber-50 p-4 sm:p-6 border-b border-amber-100 flex items-center gap-4 shrink-0">
          <div className="p-2.5 sm:p-3 bg-amber-100 rounded-lg text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-900 leading-tight">Important Safety Warning</h2>
        </div>
        
        {/* Body - Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
            {DISCLAIMER_TEXT}
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
            <ul className="list-disc pl-4 space-y-2">
              <li>Do not use this app as a substitute for professional medical advice.</li>
              <li>Always verify doses with your doctor.</li>
              <li>If you experience severe withdrawal symptoms, seek immediate medical attention.</li>
            </ul>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <Button onClick={onAccept} size="lg" className="w-full sm:w-auto shadow-md">
            <Check className="w-4 h-4 mr-2" />
            I Understand & Agree
          </Button>
        </div>
      </div>
    </div>
  );
};