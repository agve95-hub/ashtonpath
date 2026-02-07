import React, { useMemo } from 'react';
import { TaperStep, BenzoType, DailyLogEntry } from '../types';
import { Check, CheckCircle2, AlertTriangle, ThermometerSun, CalendarDays, Plus, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  steps: TaperStep[];
  medication: BenzoType;
  isDiazepamCrossOver: boolean;
  logs?: DailyLogEntry[];
  startDate?: string;
  onToggleDay: (stepId: string, dayIndex: number) => void;
  onAddDay: (stepId: string) => void;
}

// Helper to check stability based on recent logs
const getStabilityStatus = (logs: DailyLogEntry[]) => {
    if (!logs || logs.length === 0) return 'unknown';

    // Look at last 5 days
    const recentLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    
    // Average symptom score (0-10 scale approximation)
    let totalScore = 0;
    recentLogs.forEach(log => {
        // Simple composite: stress + tremors + dizziness + (10 - sleep) / 4
        const sleepBadness = Math.max(0, 10 - (log.sleepQuality || 5)); 
        const dailyScore = (log.stress + log.tremors + log.dizziness + sleepBadness) / 4;
        totalScore += dailyScore;
    });

    const avgScore = totalScore / recentLogs.length;

    if (avgScore > 4.5) return 'unstable';
    if (avgScore > 2.5) return 'moderate';
    return 'stable';
};

// Date helpers
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const TaperSchedule: React.FC<Props> = ({ steps, medication, isDiazepamCrossOver, logs = [], startDate, onToggleDay, onAddDay }) => {
  const stability = useMemo(() => getStabilityStatus(logs), [logs]);
  
  // Calculate accumulated days for each step to determine start dates
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

  // Logic to determine which steps to show
  const firstIncompleteIndex = steps.findIndex(s => !s.isCompleted);
  const visibleLimit = firstIncompleteIndex === -1 ? steps.length : firstIncompleteIndex + 1;

  return (
    <div className="space-y-8">
      {/* Schedule List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Your Journey</h3>
            <Badge variant="default" className="bg-slate-100 text-slate-600 border-slate-200">
              {steps.filter(s => s.isCompleted).length} / {steps.length} Steps
            </Badge>
        </CardHeader>
        <CardContent className="space-y-10 pt-8">
            <div className="relative">
            {/* Continuous Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>

            {stepsWithDates.map((step, index) => {
                // Hiding logic
                if (index > visibleLimit) return null;

                const isLast = index === steps.length - 1;
                const isAccessible = index === 0 || steps[index - 1].isCompleted;
                const isActive = isAccessible && !step.isCompleted;
                const isFuture = !isAccessible;
                const showDetails = isActive || !step.isCompleted;

                return (
                    <div 
                        key={step.id}
                        className={`
                            relative pl-12 sm:pl-16 pb-10 last:pb-0 group
                            ${isFuture ? 'opacity-60 grayscale cursor-not-allowed select-none' : 'opacity-100'}
                        `}
                    >
                        {/* Timeline Node */}
                        <div className={`
                            absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-all shadow-sm
                            ${isActive 
                                ? 'bg-teal-600 text-white border-teal-600 ring-4 ring-teal-100 scale-110' 
                                : step.isCompleted 
                                    ? 'bg-teal-50 text-teal-600 border-teal-200' 
                                    : 'bg-white text-slate-400 border-slate-200'}
                        `}>
                            {step.isCompleted ? <Check size={16} strokeWidth={3} /> : (step.week === 0 ? 'S' : step.week)}
                        </div>

                        <div className={`
                            relative rounded-2xl border transition-all duration-300 overflow-hidden
                            ${isActive ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500/10' : 'bg-white border-slate-200'}
                            ${isFuture ? 'bg-slate-50 border-slate-200' : ''}
                        `}>
                            {/* Header Section of the Step Card */}
                            <div className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${step.isCompleted ? 'bg-slate-50/50' : 'bg-white'}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-bold text-base ${isActive ? 'text-teal-700' : 'text-slate-900'}`}>
                                            {step.week === 0 ? 'Starting Phase' : `Week ${step.week}`}
                                        </h4>
                                        {isActive && <Badge variant="success" className="ml-2">Current</Badge>}
                                        {isFuture && <Badge variant="outline" className="ml-2"><Lock size={10} className="mr-1"/> Locked</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDays size={14} className="text-slate-400" />
                                            <span>{formatDate(step.startDate)} - {formatDate(step.endDate)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 self-start sm:self-auto">
                                    <div className="text-right">
                                        <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">Dosage</span>
                                        <span className="block font-bold text-slate-900 text-lg leading-none">{step.diazepamDose}<span className="text-xs font-normal text-slate-500 ml-1">mg</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider if expanding */}
                            {showDetails && <div className="h-px bg-slate-100 w-full" />}

                            {/* Daily Checklist */}
                            {showDetails && (
                            <div className="p-5 space-y-3 bg-white">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {step.completedDays.map((isDone, dayIndex) => {
                                    const dayDate = addDays(step.startDate, dayIndex);
                                    const isToday = new Date().toDateString() === dayDate.toDateString();
                                    
                                    return (
                                        <button
                                            key={dayIndex}
                                            onClick={() => onToggleDay(step.id, dayIndex)}
                                            disabled={!isAccessible}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-xl border transition-all text-left group relative overflow-hidden
                                                ${isDone 
                                                    ? 'bg-teal-50 border-teal-200' 
                                                    : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                                                }
                                                ${!isDone && isActive && dayIndex === step.completedDays.findIndex(d => !d) 
                                                    ? 'ring-2 ring-teal-500 border-teal-500 z-10' 
                                                    : ''}
                                            `}
                                        >
                                            <div className={`
                                                w-6 h-6 rounded-full flex items-center justify-center border transition-colors flex-shrink-0
                                                ${isDone 
                                                    ? 'bg-teal-500 border-teal-500 text-white' 
                                                    : 'bg-white border-slate-300 group-hover:border-teal-400 text-transparent'
                                                }
                                            `}>
                                                <Check size={14} strokeWidth={3} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm font-medium ${isDone ? 'text-teal-900 line-through opacity-60' : 'text-slate-700'}`}>
                                                        Day {dayIndex + 1}
                                                    </span>
                                                    {isToday && (
                                                        <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                                                            TODAY
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {dayDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                                </div>
                                
                                <button
                                    onClick={() => onAddDay(step.id)}
                                    className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all text-sm font-medium"
                                >
                                    <Plus size={16} />
                                    <span>Extend this step by 1 day</span>
                                </button>
                            </div>
                            )}

                            {isActive && (
                                <div className="bg-slate-50 p-5 border-t border-slate-100">
                                    {step.completedDays.filter(d => d).length >= step.durationDays - 1 && (
                                        <div className="animate-in fade-in slide-in-from-top-1">
                                            {stability === 'unstable' ? (
                                                <div className="bg-white border border-red-100 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                                                    <div className="p-2 bg-red-50 rounded-full text-red-500">
                                                        <AlertTriangle size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-900 text-sm">Recommendation: Hold</h5>
                                                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                                            Your recent logs indicate elevated symptoms. The Ashton Manual recommends stabilizing before reducing further.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white border border-teal-100 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                                                    <div className="p-2 bg-teal-50 rounded-full text-teal-600">
                                                        <ThermometerSun size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-900 text-sm">Ready to proceed?</h5>
                                                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                                            Your symptoms appear stable. If you feel ready, you can move to the next reduction step.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
            
            {visibleLimit < steps.length && (
                <div className="text-center py-8 pl-10 sm:pl-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-sm font-medium border border-slate-200">
                        <Lock size={14} />
                        <span>{steps.length - visibleLimit} future steps hidden</span>
                    </div>
                </div>
            )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};