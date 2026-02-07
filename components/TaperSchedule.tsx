import React, { useMemo } from 'react';
import { TaperStep, BenzoType, DailyLogEntry } from '../types';
import { Check, CheckCircle2, AlertTriangle, ThermometerSun, CalendarDays, Plus } from 'lucide-react';
import { Card, CardContent } from './ui/Card';

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
  // We show all completed steps, the current active step, and the NEXT step.
  // Everything after that is hidden.
  const firstIncompleteIndex = steps.findIndex(s => !s.isCompleted);
  // If all are completed (-1), show all. Otherwise show up to (current + 1).
  const visibleLimit = firstIncompleteIndex === -1 ? steps.length : firstIncompleteIndex + 1;

  return (
    <div className="space-y-6">
      {/* Schedule List */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Your Journey</h3>
            <span className="text-xs font-medium px-2 py-1 bg-teal-100 text-teal-800 rounded-full">
              {steps.filter(s => s.isCompleted).length} / {steps.length} Steps
            </span>
          </div>

          <div className="space-y-8 relative">
            {stepsWithDates.map((step, index) => {
                // Hiding logic: Skip steps that are beyond our visible limit
                if (index > visibleLimit) return null;

                const isLast = index === steps.length - 1;
                const isAccessible = index === 0 || steps[index - 1].isCompleted;
                const isActive = isAccessible && !step.isCompleted;
                const isFuture = !isAccessible;
                // Only show detailed day list if active or not completed (to avoid huge lists for completed history)
                // Note: Future steps are !isCompleted, so they default to expanded but grayed out, which allows previewing dates.
                const showDetails = isActive || !step.isCompleted;

                return (
                    <div 
                        key={step.id}
                        className={`
                            relative flex flex-col gap-4 p-5 rounded-xl border transition-all duration-300
                            ${step.isCompleted ? 'bg-slate-50 border-slate-100' : 'bg-white shadow-sm'}
                            ${isActive ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'}
                            ${isFuture ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}
                        `}
                    >
                        {/* Connector Line (only if next step is visible) */}
                        {!isLast && index < visibleLimit && (
                            <div className={`absolute left-8 top-full h-8 w-0.5 z-0 ${step.isCompleted ? 'bg-teal-200' : 'bg-slate-200'}`} />
                        )}

                        <div className="flex justify-between items-start z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                                        ${isActive ? 'bg-teal-600 text-white border-teal-600' : 
                                          step.isCompleted ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200'}
                                    `}>
                                        {step.week === 0 ? 'S' : step.week}
                                    </div>
                                    <h4 className={`font-bold text-base ${step.isCompleted ? 'text-teal-700' : 'text-slate-900'}`}>
                                        {step.week === 0 ? 'Starting Phase' : `Week ${step.week}`}
                                    </h4>
                                </div>
                                
                                <div className="ml-9 text-sm text-slate-600">
                                    <div className="font-medium flex items-center gap-2">
                                        <span className="text-teal-600 font-bold text-lg">{step.diazepamDose} mg</span> 
                                        <span className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Diazepam Eq.</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                        <CalendarDays size={12} />
                                        <span>{formatDate(step.startDate)} - {formatDate(step.endDate)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {step.isCompleted && (
                                <CheckCircle2 className="text-teal-500 w-6 h-6" />
                            )}
                        </div>

                        {/* Vertical Daily Checklist */}
                        {showDetails && (
                        <div className="ml-0 sm:ml-9 mt-2 space-y-2">
                            {step.completedDays.map((isDone, dayIndex) => {
                                const dayDate = addDays(step.startDate, dayIndex);
                                const isToday = new Date().toDateString() === dayDate.toDateString();
                                
                                return (
                                    <button
                                        key={dayIndex}
                                        onClick={() => onToggleDay(step.id, dayIndex)}
                                        disabled={!isAccessible}
                                        className={`
                                            w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group
                                            ${isDone 
                                                ? 'bg-teal-50/50 border-teal-200' 
                                                : 'bg-white border-slate-200 hover:border-teal-300'
                                            }
                                            ${!isDone && isActive && dayIndex === step.completedDays.findIndex(d => !d) 
                                                ? 'ring-1 ring-teal-500 border-teal-500 shadow-sm' 
                                                : ''}
                                        `}
                                    >
                                        <div className={`
                                            w-6 h-6 rounded-md flex items-center justify-center border transition-colors flex-shrink-0
                                            ${isDone 
                                                ? 'bg-teal-500 border-teal-500 text-white' 
                                                : 'bg-white border-slate-300 group-hover:border-teal-400'
                                            }
                                        `}>
                                            {isDone && <Check size={14} strokeWidth={3} />}
                                        </div>

                                        <div className="flex-1 flex justify-between items-center">
                                            <div>
                                                <span className={`text-sm font-medium block ${isDone ? 'text-teal-800 line-through opacity-70' : 'text-slate-700'}`}>
                                                    Day {dayIndex + 1}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {dayDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            {isToday && (
                                                <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                    Today
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => onAddDay(step.id)}
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-500 hover:bg-teal-50 transition-all text-sm"
                            >
                                <Plus size={14} />
                                <span>Add Day</span>
                            </button>
                        </div>
                        )}

                        {isActive && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-2 ml-0 sm:ml-9">
                                {step.completedDays.filter(d => d).length >= step.durationDays - 1 && (
                                    <div className="mt-2">
                                        {stability === 'unstable' ? (
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3 items-start text-sm text-red-800">
                                                <AlertTriangle className="shrink-0 text-red-500 mt-0.5" size={18} />
                                                <div>
                                                    <p className="font-bold">Hold this dose.</p>
                                                    <p className="opacity-90 mt-0.5">
                                                        Your recent logs indicate your symptoms are elevated. 
                                                        The Ashton Manual recommends staying on the current dose until you feel stable again.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 flex gap-3 items-start text-sm text-teal-800">
                                                <ThermometerSun className="shrink-0 text-teal-500 mt-0.5" size={18} />
                                                <div>
                                                    <p className="font-bold">Ready to proceed?</p>
                                                    <p className="opacity-90 mt-0.5">
                                                        Your symptoms seem stable. If you feel ready, you can move to the next reduction after finishing this week.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
            
            {visibleLimit < steps.length && (
                <div className="text-center py-6 border-t border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm italic">
                        {steps.length - 1 - visibleLimit} more steps following...
                    </p>
                    <p className="text-xs text-slate-300 mt-1">Complete the current week to reveal the next step.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};