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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[3px] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-[3px] text-amber-600">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-amber-900">Important Safety Warning</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
            {DISCLAIMER_TEXT}
          </p>
          
          <div className="bg-slate-50 p-4 rounded-[3px] text-sm text-slate-600">
            <ul className="list-disc pl-5 space-y-1">
              <li>Do not use this app as a substitute for professional medical advice.</li>
              <li>Always verify doses with your doctor.</li>
              <li>If you experience severe withdrawal symptoms, seek immediate medical attention.</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button onClick={onAccept} size="lg" className="w-full sm:w-auto">
            <Check className="w-4 h-4 mr-2" />
            I Understand & Agree
          </Button>
        </div>
      </div>
    </div>
  );
};