import React, { useState, useMemo } from 'react';
import { DailyLogEntry } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Badge } from './ui/Badge';
import { Save, Activity, Moon, Wind, HeartPulse, Pill, History, FileText, AlertTriangle, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  logs: DailyLogEntry[];
  onSave: (entry: DailyLogEntry) => void;
  className?: string;
}

const RangeInput: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  colorClass?: string;
}> = ({ label, value, onChange, icon, colorClass = "accent-teal-600" }) => (
  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
    <div className="flex justify-between items-center mb-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {label}
      </label>
      <span className={`text-sm font-bold px-2 py-0.5 rounded-md border ${value > 7 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-700 border-slate-200'}`}>
        {value}/10
      </span>
    </div>
    <input
      type="range"
      min="0"
      max="10"
      step="1"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colorClass}`}
    />
    <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-2">
      <span>None</span>
      <span>Severe</span>
    </div>
  </div>
);

export const DailyJournal: React.FC<Props> = ({ logs, onSave, className = "" }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Find existing entry for selected date or default
  const existingEntry = useMemo(() => logs.find(l => l.date === date), [logs, date]);
  
  const [formData, setFormData] = useState<DailyLogEntry>({
    date,
    stress: 0,
    tremors: 0,
    dizziness: 0,
    sleepQuality: 5,
    sleepHours: 7,
    systolic: '',
    diastolic: '',
    medications: '',
    notes: '',
  });

  // Reset or load form data when date/entry changes
  React.useEffect(() => {
    if (existingEntry) {
      setFormData(existingEntry);
    } else {
      setFormData({
        date,
        stress: 0,
        tremors: 0,
        dizziness: 0,
        sleepQuality: 5,
        sleepHours: 7,
        systolic: '',
        diastolic: '',
        medications: '',
        notes: '',
      });
    }
  }, [date, existingEntry]);

  // Warning Logic
  const showWarning = useMemo(() => {
    const symptomsHigh = formData.stress > 8 || formData.tremors > 8 || formData.dizziness > 8;
    const sys = parseInt(formData.systolic);
    const dia = parseInt(formData.diastolic);
    const bpHigh = (!isNaN(sys) && sys > 160) || (!isNaN(dia) && dia > 100);
    const bpLow = (!isNaN(sys) && sys < 90 && sys > 0) || (!isNaN(dia) && dia < 60 && dia > 0);
    const sleepBad = formData.sleepQuality < 3 || formData.sleepHours < 4;

    return symptomsHigh || bpHigh || bpLow || sleepBad;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Prepare chart data
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
        <Card>
          <CardHeader>
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity size={20} className="text-teal-600" />
                Symptom Trends (Last 14 Days)
             </h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="tremors" name="Tremors" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="dizziness" name="Dizziness" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="sleepQuality" name="Sleep Quality" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Form */}
      <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Daily Log</h3>
              <div className="relative">
                <input 
                    type="date" 
                    value={date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
                <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              </div>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Symptoms Section */}
                  <div className="space-y-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Symptoms</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <RangeInput 
                              label="Stress / Anxiety" 
                              value={formData.stress} 
                              onChange={v => setFormData(prev => ({...prev, stress: v}))}
                              icon={<Wind size={16} className="text-slate-400" />}
                              colorClass="accent-red-500"
                          />
                          <RangeInput 
                              label="Tremors" 
                              value={formData.tremors} 
                              onChange={v => setFormData(prev => ({...prev, tremors: v}))}
                              icon={<Activity size={16} className="text-slate-400" />}
                              colorClass="accent-amber-500"
                          />
                          <RangeInput 
                              label="Dizziness" 
                              value={formData.dizziness} 
                              onChange={v => setFormData(prev => ({...prev, dizziness: v}))}
                              icon={<Wind size={16} className="text-slate-400" />}
                              colorClass="accent-purple-500"
                          />
                      </div>
                  </div>

                  {/* Vitals Section */}
                  <div className="space-y-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Vitals & Sleep</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                              <div className="flex justify-between items-center">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                      <Moon size={16} className="text-slate-400" />
                                      Sleep Quality
                                  </label>
                                  <span className="text-sm font-bold text-teal-600">{formData.sleepQuality}/10</span>
                              </div>
                              <input
                                  type="range" min="0" max="10" step="1"
                                  value={formData.sleepQuality}
                                  onChange={(e) => setFormData(prev => ({...prev, sleepQuality: Number(e.target.value)}))}
                                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                              />
                          </div>

                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                              <Label className="mb-2">Sleep Duration</Label>
                              <div className="flex items-center gap-2">
                                  <input 
                                      type="number" step="0.5" min="0" max="24"
                                      value={formData.sleepHours}
                                      onChange={(e) => setFormData(prev => ({...prev, sleepHours: Number(e.target.value)}))}
                                      className="block w-24 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5"
                                  />
                                  <span className="text-slate-500 text-sm font-medium">hours</span>
                              </div>
                          </div>

                          <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <Label className="flex items-center gap-2 mb-3">
                                  <HeartPulse size={16} className="text-slate-400" />
                                  Blood Pressure
                              </Label>
                              <div className="flex items-center gap-3">
                                  <input 
                                      type="number" placeholder="120"
                                      value={formData.systolic}
                                      onChange={(e) => setFormData(prev => ({...prev, systolic: e.target.value}))}
                                      className="block w-28 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 text-center"
                                  />
                                  <span className="text-slate-400 text-xl font-light">/</span>
                                  <input 
                                      type="number" placeholder="80"
                                      value={formData.diastolic}
                                      onChange={(e) => setFormData(prev => ({...prev, diastolic: e.target.value}))}
                                      className="block w-28 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 text-center"
                                  />
                                  <span className="text-slate-500 text-sm ml-2 font-medium">mmHg</span>
                              </div>
                          </div>
                      </div>
                  </div>

                    {/* Meds & Notes Section */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Other Details</h4>
                      <div>
                          <Label className="flex items-center gap-2 mb-2">
                              <Pill size={16} className="text-slate-400" />
                              Medications taken today
                          </Label>
                          <textarea
                              value={formData.medications}
                              onChange={(e) => setFormData(prev => ({...prev, medications: e.target.value}))}
                              placeholder="e.g. Propranolol 10mg, Magnesium supplement..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm p-3 h-20 placeholder:text-slate-400 resize-none transition-all"
                          />
                      </div>
                      <div>
                          <Label className="flex items-center gap-2 mb-2">
                              <FileText size={16} className="text-slate-400" />
                              Notes
                          </Label>
                          <textarea
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                              placeholder="Any other symptoms or feelings..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm p-3 h-24 placeholder:text-slate-400 resize-none transition-all"
                          />
                      </div>
                    </div>

                  {showWarning && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-2 bg-white rounded-full text-red-600 shrink-0 border border-red-100 shadow-sm">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h4 className="text-red-900 font-bold text-sm">Please Consult A Doctor</h4>
                            <p className="text-red-700 text-sm mt-1 leading-relaxed">
                                Your reported symptoms or vitals indicate significant distress. 
                                The Ashton Manual advises holding your dose and consulting a medical professional if withdrawal symptoms become severe.
                            </p>
                        </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end border-t border-slate-100">
                      <Button type="submit" size="lg" className="w-full sm:w-auto">
                          <Save size={18} className="mr-2" />
                          Save Entry
                      </Button>
                  </div>
              </form>
          </CardContent>
      </Card>

      {/* Recent History / Medical Record View */}
      <Card className="bg-transparent shadow-none border-none">
          <CardHeader className="bg-transparent border-none px-0 pb-4 pt-0 flex flex-row items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History size={20} className="text-slate-400" />
                  History Log
              </h3>
              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">Select entry to edit</span>
          </CardHeader>
          <div className="space-y-3">
              {logs.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <FileText size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">No logs recorded yet</p>
                    <p className="text-slate-400 text-sm mt-1">Daily entries will appear here for review.</p>
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
                      className={`w-full text-left rounded-xl border transition-all overflow-hidden group relative ${
                          isSelected 
                          ? 'bg-white border-teal-500 ring-2 ring-teal-500 shadow-md z-10' 
                          : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md'
                      }`}
                  >
                      {/* Header bar of the card */}
                      <div className={`px-5 py-3 flex justify-between items-center border-b ${isSelected ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center gap-3">
                             <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white ${isHighSeverity ? 'bg-red-500' : 'bg-teal-500'}`} />
                             <span className="font-bold text-slate-700 text-sm">
                                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric'})}
                             </span>
                          </div>
                          {log.date === new Date().toISOString().split('T')[0] && (
                              <Badge variant="success">TODAY</Badge>
                          )}
                      </div>

                      {/* Content Grid */}
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                          {/* Symptoms Column */}
                          <div className="space-y-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Symptoms</p>
                              <div className="grid grid-cols-2 gap-y-2">
                                  <div className="text-slate-500">Stress</div>
                                  <div className={`font-semibold ${log.stress > 7 ? 'text-red-600' : 'text-slate-900'}`}>{log.stress}/10</div>
                                  
                                  <div className="text-slate-500">Tremors</div>
                                  <div className={`font-semibold ${log.tremors > 7 ? 'text-red-600' : 'text-slate-900'}`}>{log.tremors}/10</div>
                                  
                                  <div className="text-slate-500">Dizziness</div>
                                  <div className={`font-semibold ${log.dizziness > 7 ? 'text-red-600' : 'text-slate-900'}`}>{log.dizziness}/10</div>
                              </div>
                          </div>

                          {/* Vitals Column */}
                          <div className="space-y-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vitals</p>
                               <div className="grid grid-cols-2 gap-y-2">
                                  <div className="text-slate-500">BP</div>
                                  <div className="font-semibold text-slate-900">
                                    {log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic}` : '--/--'}
                                  </div>
                                  
                                  <div className="text-slate-500">Sleep</div>
                                  <div className="font-semibold text-slate-900">
                                    {log.sleepHours}h <span className="text-slate-400 font-normal text-xs ml-1">({log.sleepQuality}/10)</span>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Notes/Meds Row */}
                          {(log.medications || log.notes) && (
                              <div className="sm:col-span-2 pt-4 border-t border-slate-50 mt-1 flex flex-col gap-2">
                                  {log.medications && (
                                    <div className="flex gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <Pill size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span className="text-slate-600 font-medium truncate">{log.medications}</span>
                                    </div>
                                  )}
                                  {log.notes && (
                                    <div className="flex gap-2 text-xs text-slate-500 px-2">
                                        <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span className="italic truncate">{log.notes}</span>
                                    </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </button>
                  );
              })}
          </div>
      </Card>
    </div>
  );
};