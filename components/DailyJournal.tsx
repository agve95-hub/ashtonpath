import React, { useState, useMemo } from 'react';
import { DailyLogEntry } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Badge } from './ui/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, CalendarDays, Brain, RefreshCw, Zap, Thermometer, Frown, HeartPulse, Moon, FileText, Check, ArrowRight, AlertTriangle } from 'lucide-react';

interface Props {
  logs: DailyLogEntry[];
  onSave: (entry: DailyLogEntry) => void;
  className?: string;
}

interface RangeInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  colorClass?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const RangeInput: React.FC<RangeInputProps> = (props) => {
  const { 
    label, 
    value, 
    onChange, 
    icon, 
    colorClass = "text-teal-600", 
    gradientFrom = "from-teal-500", 
    gradientTo = "to-teal-400" 
  } = props;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all hover:shadow-md group">
      <div className="flex justify-between items-center mb-6">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
          {icon}
          {label}
        </label>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border min-w-[3rem] text-center transition-colors ${value > 7 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
          {value}/10
        </span>
      </div>
      <div className="px-1 relative h-6 flex items-center">
        <div className="absolute left-0 right-0 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
              className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-80`} 
              style={{ width: `${value * 10}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="pointer-events-none absolute h-5 w-5 bg-white border-2 border-slate-200 rounded-full shadow-sm transition-all duration-75 ease-out"
          style={{ left: `calc(${value * 10}% - 10px)` }}
        >
           <div className={`w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${value > 0 ? colorClass.replace('text-', 'bg-') : 'bg-slate-300'}`} />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-4 px-1 select-none">
        <span>No Symptoms</span>
        <span>Severe</span>
      </div>
    </div>
  );
};

export const DailyJournal: React.FC<Props> = (props) => {
  const { logs, onSave, className = "" } = props;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const existingEntry = useMemo(() => logs.find(l => l.date === date), [logs, date]);
  
  const [formData, setFormData] = useState<DailyLogEntry>({
    date,
    stress: 0,
    tremors: 0,
    dizziness: 0,
    musclePain: 0,
    nausea: 0,
    irritability: 0,
    sleepQuality: 5,
    sleepHours: 7,
    systolic: '',
    diastolic: '',
    medications: '',
    notes: '',
  });

  React.useEffect(() => {
    if (existingEntry) {
      setFormData({
        ...existingEntry,
        musclePain: existingEntry.musclePain || 0,
        nausea: existingEntry.nausea || 0,
        irritability: existingEntry.irritability || 0,
      });
    } else {
      setFormData({
        date,
        stress: 0,
        tremors: 0,
        dizziness: 0,
        musclePain: 0,
        nausea: 0,
        irritability: 0,
        sleepQuality: 5,
        sleepHours: 7,
        systolic: '',
        diastolic: '',
        medications: '',
        notes: '',
      });
    }
  }, [date, existingEntry]);

  const showWarning = useMemo(() => {
    // Specific Thresholds:
    // Stress 8+, Tremors 5+, Dizziness 5+
    const highStress = formData.stress >= 8;
    const highTremors = formData.tremors >= 5;
    const highDizziness = formData.dizziness >= 5;
    
    // Sleep: Quality 4 or less, Hours < 5
    const poorSleep = formData.sleepQuality <= 4;
    const lowSleepHours = formData.sleepHours < 5;

    // Blood Pressure High: > 140/90
    const sys = parseInt(formData.systolic);
    const dia = parseInt(formData.diastolic);
    const bpHigh = (!isNaN(sys) && sys > 140) || (!isNaN(dia) && dia > 90);

    // Any one of these conditions triggers warning
    return highStress || highTremors || highDizziness || poorSleep || lowSleepHours || bpHigh;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const chartData = useMemo(() => {
    return [...logs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map(log => ({
        ...log,
        displayDate: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
  }, [logs]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Chart Section */}
      {logs.length > 1 && (
        <Card className="border-t-4 border-t-teal-600">
          <CardHeader>
             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Symptom Trends (Last 14 Days)
             </h3>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Figtree' }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Figtree' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'Figtree' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontFamily: 'Figtree', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{r: 4, strokeWidth: 0}} />
                  <Line type="monotone" dataKey="tremors" name="Tremors" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{r: 4, strokeWidth: 0}} />
                  <Line type="monotone" dataKey="dizziness" name="Dizziness" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{r: 4, strokeWidth: 0}} />
                  <Line type="monotone" dataKey="sleepQuality" name="Sleep Quality" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{r: 4, strokeWidth: 0}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Form */}
      <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Daily Check-in</h3>
              <div className="relative group">
                <input 
                    type="date" 
                    value={date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none hover:border-slate-300 transition-colors cursor-pointer"
                />
                <CalendarDays className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
          </CardHeader>
          <CardContent className="pt-8 px-4 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Core Symptoms Section */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500">Core Symptoms</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <RangeInput 
                              label="Stress" 
                              value={formData.stress} 
                              onChange={v => setFormData(prev => ({...prev, stress: v}))}
                              icon={<Brain className="w-4 h-4 text-slate-400" />}
                              colorClass="text-red-500"
                              gradientFrom="from-red-400"
                              gradientTo="to-red-600"
                          />
                          <RangeInput 
                              label="Tremors" 
                              value={formData.tremors} 
                              onChange={v => setFormData(prev => ({...prev, tremors: v}))}
                              icon={<Activity className="w-4 h-4 text-slate-400" />}
                              colorClass="text-amber-500"
                              gradientFrom="from-amber-400"
                              gradientTo="to-amber-600"
                          />
                          <RangeInput 
                              label="Dizziness" 
                              value={formData.dizziness} 
                              onChange={v => setFormData(prev => ({...prev, dizziness: v}))}
                              icon={<RefreshCw className="w-4 h-4 text-slate-400" />}
                              colorClass="text-purple-500"
                              gradientFrom="from-purple-400"
                              gradientTo="to-purple-600"
                          />
                          <RangeInput 
                              label="Muscle Pain" 
                              value={formData.musclePain || 0} 
                              onChange={v => setFormData(prev => ({...prev, musclePain: v}))}
                              icon={<Zap className="w-4 h-4 text-slate-400" />}
                              colorClass="text-orange-500"
                              gradientFrom="from-orange-400"
                              gradientTo="to-orange-600"
                          />
                          <RangeInput 
                              label="Nausea" 
                              value={formData.nausea || 0} 
                              onChange={v => setFormData(prev => ({...prev, nausea: v}))}
                              icon={<Thermometer className="w-4 h-4 text-slate-400" />}
                              colorClass="text-green-500"
                              gradientFrom="from-green-400"
                              gradientTo="to-green-600"
                          />
                          <RangeInput 
                              label="Irritability" 
                              value={formData.irritability || 0} 
                              onChange={v => setFormData(prev => ({...prev, irritability: v}))}
                              icon={<Frown className="w-4 h-4 text-slate-400" />}
                              colorClass="text-pink-500"
                              gradientFrom="from-pink-400"
                              gradientTo="to-pink-600"
                          />
                      </div>
                  </div>

                  {/* Vitals Section */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                        <HeartPulse className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500">Physical Health</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
                              <div className="flex justify-between items-center">
                                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                      <Moon className="w-4 h-4 text-slate-400" />
                                      Sleep Quality
                                  </label>
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${formData.sleepQuality <= 4 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
                                      {formData.sleepQuality}/10
                                  </span>
                              </div>
                              
                              <div className="px-1 relative h-6 flex items-center">
                                <div className="absolute left-0 right-0 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 opacity-80" 
                                        style={{ width: `${formData.sleepQuality * 10}%` }}
                                    />
                                </div>
                                <input
                                  type="range" min="0" max="10" step="1"
                                  value={formData.sleepQuality}
                                  onChange={(e) => setFormData(prev => ({...prev, sleepQuality: Number(e.target.value)}))}
                                  className="absolute w-full h-full opacity-0 cursor-pointer"
                                />
                                <div 
                                  className="pointer-events-none absolute h-5 w-5 bg-white border-2 border-slate-200 rounded-full shadow-sm transition-all duration-75 ease-out"
                                  style={{ left: `calc(${formData.sleepQuality * 10}% - 10px)` }}
                                >
                                   <div className={`w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${formData.sleepQuality > 0 ? 'bg-teal-600' : 'bg-slate-300'}`} />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <Label className="mb-0">Hours Slept</Label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" step="0.5" min="0" max="24"
                                        value={formData.sleepHours}
                                        onChange={(e) => setFormData(prev => ({...prev, sleepHours: Number(e.target.value)}))}
                                        className="block w-20 text-center bg-slate-50 border border-slate-200 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm p-2 font-bold"
                                    />
                                    <span className="text-slate-400 text-xs font-bold">hrs</span>
                                </div>
                              </div>
                          </div>

                          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                              <Label className="flex items-center gap-2 mb-6">
                                  <HeartPulse className="w-4 h-4 text-slate-400" />
                                  Blood Pressure
                              </Label>
                              <div className="flex items-center justify-center gap-3">
                                  <div className="text-center">
                                    <input 
                                        type="number" placeholder="120"
                                        value={formData.systolic}
                                        onChange={(e) => setFormData(prev => ({...prev, systolic: e.target.value}))}
                                        className="block w-28 bg-slate-50 border border-slate-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 text-lg p-4 text-center font-bold tracking-tight text-slate-700 placeholder:text-slate-300 transition-all hover:bg-slate-100"
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold mt-2 block">Sys</span>
                                  </div>
                                  <span className="text-slate-300 text-3xl font-light mb-6">/</span>
                                  <div className="text-center">
                                    <input 
                                        type="number" placeholder="80"
                                        value={formData.diastolic}
                                        onChange={(e) => setFormData(prev => ({...prev, diastolic: e.target.value}))}
                                        className="block w-28 bg-slate-50 border border-slate-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 text-lg p-4 text-center font-bold tracking-tight text-slate-700 placeholder:text-slate-300 transition-all hover:bg-slate-100"
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold mt-2 block">Dia</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Meds & Notes Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500">Notes & Medications</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                          <Label>Medications taken</Label>
                          <textarea
                              value={formData.medications}
                              onChange={(e) => setFormData(prev => ({...prev, medications: e.target.value}))}
                              placeholder="e.g. Propranolol 10mg, Magnesium supplement..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm p-4 h-20 placeholder:text-slate-400 resize-none transition-all hover:border-slate-300 font-medium"
                          />
                      </div>
                      <div>
                          <Label>Daily Notes</Label>
                          <textarea
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                              placeholder="Describe how you felt today..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm p-4 h-24 placeholder:text-slate-400 resize-none transition-all hover:border-slate-300 font-medium"
                          />
                      </div>
                    </div>
                  </div>

                  {showWarning && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                        <div className="p-2 bg-white rounded-lg text-red-500 shrink-0 border border-red-100 shadow-sm">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-red-900 font-bold text-sm">Advisory Warning</h4>
                            <p className="text-red-800 text-sm mt-1 leading-relaxed opacity-90">
                                Your reported symptoms indicate significant distress. 
                                The Ashton Manual advises holding your dose and consulting a medical professional if withdrawal symptoms become severe (Stress ≥ 8, Tremors ≥ 5, Dizziness ≥ 5, Sleep quality ≤ 4, Sleep hours &lt; 5).
                            </p>
                        </div>
                    </div>
                  )}

                  <div className="pt-6 flex justify-end border-t border-slate-100">
                      <Button type="submit" size="lg" className="w-full sm:w-auto shadow-md shadow-teal-900/10">
                          <Check className="w-4 h-4 mr-2" />
                          Save Log Entry
                      </Button>
                  </div>
              </form>
          </CardContent>
      </Card>
      
      {/* History */}
      <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  History
              </h3>
          </div>
          <div className="space-y-4">
              {logs.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-slate-900 font-bold text-sm">No logs yet</p>
                    <p className="text-slate-500 text-xs mt-1">Your daily entries will appear here.</p>
                  </div>
              )}
              {[...logs].sort((a, b) => b.date.localeCompare(a.date)).map(log => {
                  const isSelected = log.date === date;
                  const severityScore = (log.stress + log.tremors + log.dizziness) / 3;
                  const isHighSeverity = severityScore > 6;
                  
                  return (
                  <button 
                      key={log.date}
                      onClick={() => setDate(log.date)}
                      className={`w-full text-left rounded-xl transition-all overflow-hidden group relative shadow-sm border ${
                          isSelected 
                          ? 'bg-white border-teal-500 ring-1 ring-teal-500 z-10' 
                          : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md'
                      }`}
                  >
                      <div className="p-5 flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${isHighSeverity ? 'bg-red-50 border-red-100 text-red-600' : 'bg-teal-50 border-teal-100 text-teal-600'}`}>
                                <span className="text-[10px] font-bold">{new Date(log.date).toLocaleDateString(undefined, { month: 'short'})}</span>
                                <span className="text-lg font-bold leading-none">{new Date(log.date).getDate()}</span>
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900 text-sm">Daily Check-in</span>
                                    {log.date === new Date().toISOString().split('T')[0] && (
                                        <Badge variant="success" className="rounded-md">Today</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Brain className="w-3 h-3 text-slate-400" />
                                        Stress: {log.stress}/10
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="flex items-center gap-1.5">
                                        <Moon className="w-3 h-3 text-slate-400" />
                                        Sleep: {log.sleepHours}h
                                    </span>
                                </div>
                             </div>
                        </div>
                        <div className={`p-2 rounded-full transition-colors ${isSelected ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                  </button>
                  );
              })}
          </div>
      </div>
    </div>
  );
};