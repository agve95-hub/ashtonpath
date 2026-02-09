import React, { useMemo } from 'react';
import { TaperStep, BenzoType, DailyLogEntry } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { CalendarDays, Check, Lock, Plus, AlertTriangle, Sun, ArrowDown, Shuffle, Pill } from 'lucide-react';

interface Props {
  steps: TaperStep[];
  medication: BenzoType;
  isDiazepamCrossOver: boolean;
  logs?: DailyLogEntry[];
  startDate?: string;
  onToggleDay: (stepId: string, dayIndex: number) => void;
  onAddDay: (stepId: string) => void;
}

const getStabilityStatus = (logs: DailyLogEntry[]) => {
    if (!logs || logs.length === 0) return 'unknown';
    const recentLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    let totalScore = 0;
    recentLogs.forEach(log => {
        const sleepBadness = Math.max(0, 10 - (log.sleepQuality || 5)); 
        const sensory = log.sensorySensitivity || 0;
        const deperson = log.depersonalization || 0;
        const dailyScore = (log.stress + log.tremors + log.dizziness + sleepBadness + sensory + deperson) / 6;
        totalScore += dailyScore;
    });
    const avgScore = totalScore / recentLogs.length;
    if (avgScore > 4.5) return 'unstable';
    if (avgScore > 2.5) return 'moderate';
    return 'stable';
};

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const TaperSchedule: React.FC<Props> = (props) => {
  const { steps, medication, isDiazepamCrossOver, logs = [], startDate, onToggleDay, onAddDay } = props;
  const stability = useMemo(() => getStabilityStatus(logs), [logs]);
  
  const stepsWithDates = useMemo(() => {
      let currentOffset = 0;
      const baseDate = startDate ? new Date(startDate) : new Date();
      return steps.map(step => {
          const start = addDays(baseDate, currentOffset);
          const end = addDays(baseDate, currentOffset + step.durationDays - 1);
          currentOffset += step.durationDays;
          return { ...step, startDate: start, endDate: end };
      });
  }, [steps, startDate]);

  const firstIncompleteIndex = steps.findIndex(s => !s.isCompleted);
  const visibleLimit = firstIncompleteIndex === -1 ? steps.length : firstIncompleteIndex + 2; 

  return (
    <div className="space-y-6">
      {/* Crossover Info Banner - Modified for Ashton Context */}
      {isDiazepamCrossOver && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex gap-4 items-start shadow-sm">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                <Shuffle className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-indigo-900 font-bold text-sm mb-1">Ashton Method: Gradual Crossover</h4>
                <p className="text-indigo-800/80 text-sm leading-relaxed">
                    Per the Ashton Manual, your schedule begins with a <strong>Crossover Phase</strong>. 
                    You will gradually substitute your dose of <strong>{medication.split('(')[0]}</strong> with <strong>Diazepam</strong>. 
                    Do not rush this phase. It prevents inter-dose withdrawal.
                </p>
            </div>
        </div>
      )}

      {/* Schedule List */}
      <Card className="overflow-visible">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-teal-600" />
                Ashton Taper Timeline
            </h3>
            <Badge variant="default" className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 rounded-full">
              Step {steps.filter(s => s.isCompleted).length} / {steps.length}
            </Badge>
        </CardHeader>
        <CardContent className="pt-8 pb-12 px-4 sm:px-8">
            <div className="relative">
            {/* Continuous Vertical Line */}
            <div className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 z-0 rounded-full"></div>

            {stepsWithDates.map((step, index) => {
                if (index > visibleLimit) return null;

                const isAccessible = index === 0 || steps[index - 1].isCompleted;
                const isActive = isAccessible && !step.isCompleted;
                const isFuture = !isAccessible;
                const showDetails = isActive || !step.isCompleted;
                const isCrossover = step.phase === 'crossover';

                return (
                    <div 
                        key={step.id}
                        className={`
                            relative pl-12 sm:pl-20 pb-12 last:pb-0 transition-all duration-500 ease-in-out
                            ${isFuture ? 'opacity-40 grayscale-[0.8] cursor-not-allowed select-none' : 'opacity-100'}
                        `}
                    >
                        {/* Timeline Node */}
                        <div className={`
                            absolute left-0 top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 z-10 transition-all duration-300 shadow-sm
                            ${isActive 
                                ? 'bg-teal-600 text-white border-white ring-4 ring-teal-50 scale-110 shadow-lg shadow-teal-600/20' 
                                : step.isCompleted 
                                    ? 'bg-teal-50 text-teal-600 border-teal-100' 
                                    : 'bg-white text-slate-300 border-slate-100'}
                        `}>
                            {step.isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : (step.week === 0 ? 'S' : step.week)}
                        </div>

                        <div className={`
                            relative rounded-xl border transition-all duration-300 overflow-hidden group
                            ${isActive ? 'bg-white border-teal-500 ring-1 ring-teal-500 shadow-medium' : 'bg-white border-slate-200'}
                            ${isFuture ? 'bg-slate-50 border-slate-100 shadow-none' : ''}
                        `}>
                            {/* Header Section */}
                            <div className={`px-4 sm:px-6 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${step.isCompleted ? 'bg-slate-50/50' : 'bg-white'}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${isActive ? 'text-teal-800' : 'text-slate-800'}`}>
                                            {step.phase === 'crossover' && <Badge variant="warning" className="text-[10px]">Crossover</Badge>}
                                            {step.phase === 'stabilize' && <Badge variant="success" className="text-[10px]">Stabilize</Badge>}
                                            {step.phase === 'jump' && <Badge variant="default" className="text-[10px] bg-slate-800 text-white border-transparent">Finish</Badge>}
                                            <span>Week {step.week}</span>
                                        </h4>
                                        {isActive && <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span></span>}
                                        {isFuture && <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400"/>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <span>{formatDate(step.startDate)}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{formatDate(step.endDate)}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto">
                                    {/* Crossover Dual-Med Grid */}
                                    {isCrossover && step.originalMedDose > 0 && (
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <div className="flex-1 md:flex-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-center min-w-[80px]">
                                                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">{medication.split(' ')[0]}</span>
                                                <span className="block font-bold text-slate-700">{step.originalMedDose} <span className="text-[10px] font-normal text-slate-400">mg</span></span>
                                            </div>
                                            <div className="text-slate-300 text-xs">+</div>
                                            <div className="flex-1 md:flex-none bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 text-center min-w-[80px]">
                                                <span className="block text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Diazepam</span>
                                                <span className="block font-bold text-indigo-900">{step.diazepamDose} <span className="text-[10px] font-normal text-indigo-400">mg</span></span>
                                            </div>
                                        </div>
                                    )}

                                    {!isCrossover && (
                                        <div className={`px-4 py-2 rounded-lg border min-w-[90px] text-right bg-slate-50 border-slate-100`}>
                                            <span className={`block text-[10px] font-bold tracking-wider mb-0.5 text-slate-400`}>Diazepam</span>
                                            <span className={`block font-bold text-lg leading-none text-slate-900`}>{step.diazepamDose}<span className="text-xs font-normal opacity-60 ml-1">mg</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Active Content - Checklist */}
                            {showDetails && (
                                <>
                                    <div className="h-px bg-slate-100 w-full" />
                                    <div className="p-4 sm:p-6 bg-slate-50/30 space-y-3">
                                        {step.completedDays.map((isDone, dayIndex) => {
                                            const dayDate = addDays(step.startDate, dayIndex);
                                            const isToday = new Date().toDateString() === dayDate.toDateString();
                                            const globalDay = step.globalDayStart + dayIndex;
                                            
                                            return (
                                                <button
                                                    key={dayIndex}
                                                    onClick={() => onToggleDay(step.id, dayIndex)}
                                                    disabled={!isAccessible}
                                                    className={`
                                                        w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group
                                                        ${isDone 
                                                            ? 'bg-teal-50/50 border-teal-200 opacity-60' 
                                                            : isToday
                                                                ? 'bg-white border-teal-500 ring-1 ring-teal-500 shadow-md transform scale-[1.01]'
                                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                                        }
                                                    `}
                                                >
                                                    {/* Left: Date Info */}
                                                    <div className="flex items-center gap-4 text-left">
                                                        <div className={`
                                                            w-10 h-10 rounded-lg flex flex-col items-center justify-center border font-bold text-sm
                                                            ${isDone 
                                                                ? 'bg-teal-100 border-teal-200 text-teal-700' 
                                                                : 'bg-slate-50 border-slate-200 text-slate-600'}
                                                        `}>
                                                            <span className="text-[9px] uppercase tracking-wider opacity-60 leading-none mb-0.5">
                                                                {dayDate.toLocaleDateString(undefined, { weekday: 'short' })}
                                                            </span>
                                                            <span className="leading-none">{dayDate.getDate()}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                                Day {globalDay} of Withdrawal
                                                            </div>
                                                            <div className={`font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                                Take {isCrossover ? 'mixed dose' : `${step.diazepamDose}mg Diazepam`}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Checkbox */}
                                                    <div className={`
                                                        w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                                                        ${isDone 
                                                            ? 'bg-teal-500 border-teal-500 text-white' 
                                                            : 'bg-white border-slate-300 text-transparent group-hover:border-teal-400'}
                                                    `}>
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => onAddDay(step.id)}
                                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all text-xs font-bold uppercase tracking-wider"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Extend step by 1 day
                                        </button>
                                    </div>

                                    {isActive && (
                                        <div className="bg-white p-4 sm:p-6 border-t border-slate-100">
                                            {step.completedDays.filter(d => d).length >= step.durationDays - 1 && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                                    {stability === 'unstable' ? (
                                                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-4">
                                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                                            <div>
                                                                <h5 className="font-bold text-red-900 text-sm mb-1">Recommendation: Hold Dose</h5>
                                                                <p className="text-red-800 text-sm leading-relaxed opacity-90">
                                                                    Your logs indicate significant symptoms. The Ashton Manual advises holding at this dose until stable.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 flex gap-4">
                                                             <Sun className="w-5 h-5 text-teal-600 shrink-0" />
                                                                <div>
                                                                    <h5 className="font-bold text-teal-900 text-sm mb-1">Ready to proceed?</h5>
                                                                    <p className="text-teal-800 text-sm leading-relaxed opacity-90">
                                                                        Your symptoms appear stable. If you feel ready, you can move to the next reduction step.
                                                                    </p>
                                                                </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
            
            {visibleLimit < steps.length && (
                <div className="text-center pl-10 sm:pl-20 pt-8">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold tracking-wide border border-slate-200 transition-colors">
                        <ArrowDown className="w-4 h-4" />
                        <span>Show {steps.length - visibleLimit} more steps</span>
                    </button>
                </div>
            )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};