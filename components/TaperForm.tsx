import React, { useState, useEffect } from 'react';
import { BenzoType, TaperSpeed } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Activity, Calendar, Pill, Settings, ArrowRight } from 'lucide-react';
import { BENZO_DETAILS } from '../constants';

interface Props {
  onGenerate: (med: BenzoType, dose: number, speed: TaperSpeed, date: string, targetEndDate?: string) => void;
}

export const TaperForm: React.FC<Props> = ({ onGenerate }) => {
  const [medication, setMedication] = useState<BenzoType>(BenzoType.ALPRAZOLAM);
  const [dose, setDose] = useState<string>('1.0');
  const [speed, setSpeed] = useState<TaperSpeed>(TaperSpeed.MODERATE);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState<string>('');

  // Set a default target date (6 months out) when Custom is first selected
  useEffect(() => {
    if (speed === TaperSpeed.CUSTOM && !targetEndDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 180); // Default 6 months
        setTargetEndDate(d.toISOString().split('T')[0]);
    }
  }, [speed, startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numDose = parseFloat(dose);
    if (numDose > 0) {
      onGenerate(medication, numDose, speed, startDate, speed === TaperSpeed.CUSTOM ? targetEndDate : undefined);
    }
  };

  const selectedMedData = BENZO_DETAILS[medication];

  return (
    <Card className="h-full border-t-4 border-t-teal-500 shadow-md">
      <CardHeader>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="text-teal-600" size={20} />
          Plan Your Taper
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Enter your current usage to generate a draft schedule.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication Select */}
          <div>
            <Label>Current Medication</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Pill className="h-4 w-4" />
              </div>
              <select
                value={medication}
                onChange={(e) => setMedication(e.target.value as BenzoType)}
                className="block w-full pl-10 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl bg-white shadow-sm transition-all appearance-none border"
              >
                {Object.values(BenzoType).map((med) => (
                  <option key={med} value={med}>{med}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Settings className="h-4 w-4 opacity-50" />
              </div>
            </div>
            {selectedMedData && (
              <div className="mt-2 bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs text-slate-600">
                <div className="flex gap-4">
                    <span><span className="font-semibold">Half-life:</span> {selectedMedData.halfLife}</span>
                    <span><span className="font-semibold">Eq:</span> 1mg ≈ {selectedMedData.diazepamEquivalence}mg Valium</span>
                </div>
              </div>
            )}
          </div>

          {/* Dose Input */}
          <Input 
            label="Daily Dose (mg)"
            type="number"
            step="0.01"
            min="0"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            className="font-mono"
          />

          {/* Speed Select */}
          <div>
            <Label>Taper Pace</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(TaperSpeed).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-3 text-xs font-medium rounded-xl border text-center transition-all flex flex-col items-center justify-center h-full min-h-[60px] relative overflow-hidden ${
                    speed === s 
                      ? 'bg-teal-50 border-teal-500 text-teal-800 ring-1 ring-teal-500 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm mb-0.5">{s.split('(')[0]}</span>
                  <span className="text-[10px] opacity-80 whitespace-nowrap">{s.match(/\(([^)]+)\)/)?.[1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={<Calendar className="h-4 w-4" />}
            />
            
            {/* Target End Date (Conditional) */}
            {speed === TaperSpeed.CUSTOM && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                    <Label className="text-teal-700 flex items-center gap-1">Target End Date</Label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-teal-600" />
                        </div>
                        <input
                            type="date"
                            min={startDate}
                            value={targetEndDate}
                            onChange={(e) => setTargetEndDate(e.target.value)}
                            className="block w-full pl-10 px-3 py-2.5 border-2 border-teal-100 rounded-xl shadow-sm text-teal-900 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-sm bg-teal-50/30"
                        />
                    </div>
                </div>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full">
                Generate Schedule
                <ArrowRight size={18} className="ml-1 opacity-60" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};