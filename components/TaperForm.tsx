import React, { useState, useEffect } from 'react';
import { BenzoType, TaperSpeed, Metabolism } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent } from './ui/Card';
import { BENZO_DETAILS } from '../constants';
import { Pill, Settings, Clock, Scale, CheckCircle2, Calendar, ArrowRight, User, Activity, History } from 'lucide-react';

interface TaperFormValues {
  medication: BenzoType;
  dose: number;
  speed: TaperSpeed;
  age: number;
  metabolism: Metabolism;
  yearsUsing: number;
  startDate: string;
  targetEndDate?: string;
}

interface Props {
  onGenerate: (med: BenzoType, dose: number, speed: TaperSpeed, age: number, metabolism: Metabolism, yearsUsing: number, date: string, targetEndDate?: string) => void;
  initialValues?: TaperFormValues;
}

export const TaperForm: React.FC<Props> = (props) => {
  const { onGenerate, initialValues } = props;
  const [medication, setMedication] = useState<BenzoType>(initialValues?.medication || BenzoType.ALPRAZOLAM);
  const [dose, setDose] = useState<string>(initialValues?.dose?.toString() || '1.0');
  const [speed, setSpeed] = useState<TaperSpeed>(initialValues?.speed || TaperSpeed.MODERATE);
  
  // New State Variables
  const [age, setAge] = useState<string>(initialValues?.age?.toString() || '');
  const [metabolism, setMetabolism] = useState<Metabolism>(initialValues?.metabolism || 'average');
  const [yearsUsing, setYearsUsing] = useState<string>(initialValues?.yearsUsing?.toString() || '');

  const [startDate, setStartDate] = useState<string>(initialValues?.startDate || new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState<string>(initialValues?.targetEndDate || '');

  useEffect(() => {
    if (speed === TaperSpeed.CUSTOM && !targetEndDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 180); 
        setTargetEndDate(d.toISOString().split('T')[0]);
    }
  }, [speed, startDate, targetEndDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numDose = parseFloat(dose);
    const numAge = parseInt(age) || 40;
    const numYears = parseFloat(yearsUsing) || 1;

    if (numDose > 0) {
      onGenerate(medication, numDose, speed, numAge, metabolism, numYears, startDate, speed === TaperSpeed.CUSTOM ? targetEndDate : undefined);
    }
  };

  const selectedMedData = BENZO_DETAILS[medication];

  return (
    <Card className="shadow-medium border-0 ring-1 ring-slate-100">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Medication Info */}
          <div className="p-5 sm:p-8 border-b border-slate-100 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">1</span>
                Medication Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                    <Label>Substance</Label>
                    <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                        <Pill className="w-4 h-4" />
                    </div>
                    <select
                        value={medication}
                        onChange={(e) => setMedication(e.target.value as BenzoType)}
                        className="block w-full pl-10 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-lg bg-white shadow-sm transition-all appearance-none border font-medium text-slate-700 cursor-pointer hover:border-slate-300"
                    >
                        {Object.values(BenzoType).map((med) => (
                        <option key={med} value={med}>{med}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <Settings className="w-4 h-4 opacity-50" />
                    </div>
                    </div>
                    {selectedMedData && (
                    <div className="mt-3 flex gap-3 text-xs text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100"><Clock className="w-3.5 h-3.5"/> Half-life: {selectedMedData.halfLife}</span>
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100"><Scale className="w-3.5 h-3.5"/> Eq: 1mg ≈ {selectedMedData.diazepamEquivalence}mg Valium</span>
                    </div>
                    )}
                </div>

                <Input 
                    label="Current Daily Dose (mg)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    className="font-medium text-slate-900"
                    icon={<Scale className="w-4 h-4" />}
                />
            </div>
          </div>

          {/* Section 2: Personal Biological Factors */}
          <div className="p-5 sm:p-8 border-b border-slate-100 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">2</span>
                Personal Factors (Impacts Taper Rate)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                    label="Your Age"
                    type="number"
                    min="18"
                    max="100"
                    placeholder="e.g. 35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    icon={<User className="w-4 h-4" />}
                />
                
                <Input 
                    label="Years Taking Benzos"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 2.5"
                    value={yearsUsing}
                    onChange={(e) => setYearsUsing(e.target.value)}
                    icon={<History className="w-4 h-4" />}
                />

                <div className="space-y-1.5">
                    <Label>Metabolism Speed</Label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Activity className="w-4 h-4" />
                        </div>
                        <select
                            value={metabolism}
                            onChange={(e) => setMetabolism(e.target.value as Metabolism)}
                            className="block w-full pl-10 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-lg bg-white shadow-sm transition-all appearance-none border font-medium text-slate-700 cursor-pointer"
                        >
                            <option value="slow">Slow (Sensitive)</option>
                            <option value="average">Average</option>
                            <option value="fast">Fast</option>
                        </select>
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <Settings className="w-4 h-4 opacity-50" />
                        </div>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                The Ashton Manual recommends adjusting taper speed based on age and metabolism. Older individuals or long-term users often require longer stabilization periods between reductions.
            </p>
          </div>

          {/* Section 3: Pace */}
          <div className="p-5 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs">3</span>
                Reduction Pace
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {Object.values(TaperSpeed).map((s) => {
                  const isSelected = speed === s;
                  const [title, sub] = s.split('(');
                  const cleanSub = sub ? sub.replace(')', '') : '';
                  
                  return (
                    <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`
                        relative px-4 py-4 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[100px] group
                        ${isSelected 
                        ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-md z-10' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                        }
                    `}
                    >
                        <span className={`font-bold text-sm block ${isSelected ? 'text-teal-700' : 'text-slate-700'}`}>{title.trim()}</span>
                        <div className="flex justify-between items-end w-full mt-2">
                            {cleanSub && <span className={`text-xs font-medium ${isSelected ? 'text-teal-600/80' : 'text-slate-400'}`}>{cleanSub}</span>}
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
                        </div>
                    </button>
                )
              })}
            </div>
          </div>

          {/* Section 4: Timeline */}
          <div className="p-5 sm:p-8 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">4</span>
                Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Input 
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    icon={<Calendar className="w-4 h-4" />}
                />
                
                {speed === TaperSpeed.CUSTOM && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <Label className="text-teal-700">Target End Date</Label>
                        <div className="relative mt-1.5">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="w-4 h-4 text-teal-600" />
                            </div>
                            <input
                                type="date"
                                min={startDate}
                                value={targetEndDate}
                                onChange={(e) => setTargetEndDate(e.target.value)}
                                className="block w-full pl-10 px-3 py-2.5 border border-teal-200 rounded-lg shadow-sm text-teal-900 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-teal-50 font-medium transition-all"
                            />
                        </div>
                    </div>
                )}
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="lg" className="w-full sm:w-auto shadow-md shadow-teal-900/10">
                {initialValues ? 'Update Schedule' : 'Generate Schedule'}
                <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};