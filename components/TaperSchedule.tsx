import React, { useMemo } from 'react';
import { TaperStep, BenzoType, DailyLogEntry } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { ArrowRightLeft, Info, CalendarDays, Check, Lock, Plus, AlertTriangle, Sun, ArrowDown } from 'lucide-react';

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
        const dailyScore = (log.stress + log.tremors + log.dizziness + sleepBadness) / 4;
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
      {/* Crossover Info Banner */}
      {isDiazepamCrossOver && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex gap-4 items-start shadow-sm">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-indigo-900 font-bold text-sm mb-1">Crossover Required</h4>
                <p className="text-indigo-800/80 text-sm leading-relaxed max-w-2xl">
                    This schedule represents the Diazepam (Valium) equivalent of your dose. 
                    The Ashton Manual recommends a gradual substitution from <strong>{medication.split(' ')[0]}</strong> to Diazepam before beginning this reduction. 
                </p>
                <div className="mt-3">
                   <a href="https://www.benzo.org.uk/manual/bzsched.htm" target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline inline-flex items-center gap-1">
                      View Crossover Schedules <Info className="w-4 h-4" />
                   </a>
                </div>
            </div>
        </div>
      )}

      {/* Schedule List */}
      <Card className="overflow-visible">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-teal-600" />
                Reduction Timeline
            </h3>
            <Badge variant="default" className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 rounded-full">
              Step {steps.filter(s => s.isCompleted).length} / {steps.length}
            </Badge>
        </CardHeader>
        <CardContent className="pt-8 pb-12 px-4 sm:px-8">
            <div className="relative">
            {/* Continuous Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 z-0 rounded-full"></div>

            {stepsWithDates.map((step, index) => {
                if (index > visibleLimit) return null;

                const isAccessible = index === 0 || steps[index - 1].isCompleted;
                const isActive = isAccessible && !step.isCompleted;
                const isFuture = !isAccessible;
                const showDetails = isActive || !step.isCompleted;

                return (
                    <div 
                        key={step.id}
                        className={`
                            relative pl-14 sm:pl-20 pb-12 last:pb-0 transition-all duration-500 ease-in-out
                            ${isFuture ? 'opacity-40 grayscale-[0.8] cursor-not-allowed select-none' : 'opacity-100'}
                        `}
                    >
                        {/* Timeline Node */}
                        <div className={`
                            absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-all duration-300 shadow-sm
                            ${isActive 
                                ? 'bg-teal-600 text-white border-white ring-4 ring-teal-50 scale-110 shadow-lg shadow-teal-600/20' 
                                : step.isCompleted 
                                    ? 'bg-teal-50 text-teal-600 border-teal-100' 
                                    : 'bg-white text-slate-300 border-slate-100'}
                        `}>
                            {step.isCompleted ? <Check className="w-5 h-5" /> : (step.week === 0 ? 'S' : step.week)}
                        </div>

                        <div className={`
                            relative rounded-xl border transition-all duration-300 overflow-hidden group
                            ${isActive ? 'bg-white border-teal-500 ring-1 ring-teal-500 shadow-medium' : 'bg-white border-slate-200'}
                            ${isFuture ? 'bg-slate-50 border-slate-100 shadow-none' : ''}
                        `}>
                            {/* Header Section */}
                            <div className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${step.isCompleted ? 'bg-slate-50/50' : 'bg-white'}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className={`font-bold text-base ${isActive ? 'text-teal-800' : 'text-slate-800'}`}>
                                            {step.week === 0 ? 'Stabilization Phase' : `Week ${step.week}`}
                                        </h4>
                                        {isActive && <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span></span>}
                                        {isFuture && <Lock className="w-4 h-4 text-slate-400"/>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <span>{formatDate(step.startDate)}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{formatDate(step.endDate)}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 self-start sm:self-auto">
                                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 min-w-[90px] text-right">
                                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-0.5">Dose</span>
                                        <span className="block font-bold text-slate-900 text-lg leading-none">{step.diazepamDose}<span className="text-xs font-normal text-slate-500 ml-1">mg</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Content */}
                            {showDetails && (
                                <>
                                    <div className="h-px bg-slate-100 w-full" />
                                    <div className="p-6 bg-white space-y-4">
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                                        {step.completedDays.map((isDone, dayIndex) => {
                                            const dayDate = addDays(step.startDate, dayIndex);
                                            const isToday = new Date().toDateString() === dayDate.toDateString();
                                            
                                            return (
                                                <button
                                                    key={dayIndex}
                                                    onClick={() => onToggleDay(step.id, dayIndex)}
                                                    disabled={!isAccessible}
                                                    className={`
                                                        flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all h-16 relative
                                                        ${isDone 
                                                            ? 'bg-teal-50/50 border-teal-200 text-teal-700' 
                                                            : isToday
                                                                ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-sm z-10'
                                                                : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm text-slate-600'
                                                        }
                                                    `}
                                                >
                                                    <span className="text-[10px] font-bold opacity-60 mb-0.5">{dayDate.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                                    <span className={`text-sm font-bold ${isDone ? 'line-through opacity-50' : ''}`}>{dayDate.getDate()}</span>
                                                    {isDone && <Check className="w-3 h-3 absolute bottom-1 right-1 text-teal-600" />}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => onAddDay(step.id)}
                                            className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all h-16 group"
                                            title="Extend this step by 1 day"
                                        >
                                            <div className="p-1 rounded-full bg-slate-50 group-hover:bg-teal-100 transition-colors mb-0.5">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <span className="text-[9px] font-bold">Add Day</span>
                                        </button>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="bg-slate-50/50 p-6 border-t border-slate-100">
                                            {step.completedDays.filter(d => d).length >= step.durationDays - 1 && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                                    {stability === 'unstable' ? (
                                                        <div className="bg-white border-l-4 border-red-400 rounded-r-lg p-5 shadow-sm ring-1 ring-slate-100/60">
                                                            <div className="flex gap-4">
                                                                <div className="p-2 bg-red-50 rounded-full h-fit text-red-500 shrink-0">
                                                                    <AlertTriangle className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-slate-900 text-sm mb-1">Recommendation: Hold Dose</h5>
                                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                                        Your recent logs indicate elevated symptoms. The Ashton Manual recommends stabilizing at the current dose until symptoms subside before reducing further.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white border-l-4 border-teal-500 rounded-r-lg p-5 shadow-sm ring-1 ring-slate-100/60">
                                                             <div className="flex gap-4">
                                                                <div className="p-2 bg-teal-50 rounded-full h-fit text-teal-600 shrink-0">
                                                                    <Sun className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-slate-900 text-sm mb-1">Ready to proceed?</h5>
                                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                                        Your symptoms appear stable. If you feel ready, you can move to the next reduction step. Listen to your body.
                                                                    </p>
                                                                </div>
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
                <div className="text-center pl-16 sm:pl-20 pt-8">
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