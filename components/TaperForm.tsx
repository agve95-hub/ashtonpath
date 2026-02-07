import React, { useState } from 'react';
import { BenzoType, TaperSpeed } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Activity, Calendar, Pill } from 'lucide-react';
import { BENZO_DETAILS } from '../constants';

interface Props {
  onGenerate: (med: BenzoType, dose: number, speed: TaperSpeed, date: string) => void;
}

export const TaperForm: React.FC<Props> = ({ onGenerate }) => {
  const [medication, setMedication] = useState<BenzoType>(BenzoType.ALPRAZOLAM);
  const [dose, setDose] = useState<string>('1.0');
  const [speed, setSpeed] = useState<TaperSpeed>(TaperSpeed.MODERATE);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numDose = parseFloat(dose);
    if (numDose > 0) {
      onGenerate(medication, numDose, speed, startDate);
    }
  };

  const selectedMedData = BENZO_DETAILS[medication];

  return (
    <Card className="h-full border-t-4 border-t-teal-500">
      <CardHeader>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="text-teal-500" size={20} />
          Plan Your Taper
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Enter your current usage to generate a draft schedule.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Medication Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Medication</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Pill className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={medication}
                onChange={(e) => setMedication(e.target.value as BenzoType)}
                className="block w-full pl-10 pr-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-xl border bg-slate-50"
              >
                {Object.values(BenzoType).map((med) => (
                  <option key={med} value={med}>{med}</option>
                ))}
              </select>
            </div>
            {selectedMedData && (
              <p className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded-lg">
                <span className="font-semibold">Half-life:</span> {selectedMedData.halfLife}.{' '}
                <span className="font-semibold">Equivalence:</span> 1mg ≈ {selectedMedData.diazepamEquivalence}mg Valium.
              </p>
            )}
          </div>

          {/* Dose Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Daily Dose (mg)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Speed Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Taper Pace</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.values(TaperSpeed).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    speed === s 
                      ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.split('(')[0]}
                  <span className="block text-[10px] opacity-75 mt-0.5">{s.match(/\(([^)]+)\)/)?.[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full pl-10 px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Generate Schedule
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};