import React, { useState, useMemo } from 'react';
import { DailyLogEntry } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Save, Activity, Moon, Wind, HeartPulse, Pill, History, FileText, AlertTriangle } from 'lucide-react';
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
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {icon}
        {label}
      </label>
      <span className={`text-sm font-bold ${value > 7 ? 'text-red-500' : 'text-slate-600'}`}>
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
    <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium">
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

    // Trigger if symptoms are severe OR vitals are concerning
    return symptomsHigh || bpHigh || bpLow || sleepBad;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Prepare chart data (sort by date ascending, take last 14 entries)
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
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tremors" name="Tremors" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="dizziness" name="Dizziness" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sleepQuality" name="Sleep Quality" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Form */}
      <Card>
          <CardHeader className="flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Daily Log</h3>
              <input 
                  type="date" 
                  value={date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-sm bg-slate-200 border-transparent rounded-lg shadow-sm focus:ring-teal-500 focus:bg-white transition-colors"
              />
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Symptoms Section */}
                  <div className="space-y-6">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Symptoms</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <RangeInput 
                              label="Stress / Anxiety" 
                              value={formData.stress} 
                              onChange={v => setFormData(prev => ({...prev, stress: v}))}
                              icon={<Wind size={16} className="text-slate-400" />}
                              colorClass="accent-red-500"
                          />
                          <RangeInput 
                              label="Tremors / Shakes" 
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
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Vitals & Sleep</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
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

                          <div className="space-y-1">
                              <label className="text-sm font-medium text-slate-700 block mb-2">Sleep Duration</label>
                              <div className="flex items-center gap-2">
                                  <input 
                                      type="number" step="0.5" min="0" max="24"
                                      value={formData.sleepHours}
                                      onChange={(e) => setFormData(prev => ({...prev, sleepHours: Number(e.target.value)}))}
                                      className="block w-24 bg-slate-800 text-white border-slate-700 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 placeholder-slate-500"
                                  />
                                  <span className="text-slate-500 text-sm">hours</span>
                              </div>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                  <HeartPulse size={16} className="text-slate-400" />
                                  Blood Pressure
                              </label>
                              <div className="flex items-center gap-2">
                                  <input 
                                      type="number" placeholder="120"
                                      value={formData.systolic}
                                      onChange={(e) => setFormData(prev => ({...prev, systolic: e.target.value}))}
                                      className="block w-24 bg-slate-800 text-white border-slate-700 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 placeholder-slate-500"
                                  />
                                  <span className="text-slate-400">/</span>
                                  <input 
                                      type="number" placeholder="80"
                                      value={formData.diastolic}
                                      onChange={(e) => setFormData(prev => ({...prev, diastolic: e.target.value}))}
                                      className="block w-24 bg-slate-800 text-white border-slate-700 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 placeholder-slate-500"
                                  />
                                  <span className="text-slate-500 text-sm ml-2">mmHg</span>
                              </div>
                          </div>
                      </div>
                  </div>

                    {/* Meds & Notes Section */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b pb-2">Other Details</h4>
                      <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                              <Pill size={16} className="text-slate-400" />
                              Medications taken today
                          </label>
                          <textarea
                              value={formData.medications}
                              onChange={(e) => setFormData(prev => ({...prev, medications: e.target.value}))}
                              placeholder="e.g. Propranolol 10mg, Magnesium supplement..."
                              className="w-full bg-slate-800 text-white border-slate-700 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-3 border h-20 placeholder-slate-500"
                          />
                      </div>
                      <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                              <FileText size={16} className="text-slate-400" />
                              Notes
                          </label>
                          <textarea
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                              placeholder="Any other symptoms or feelings..."
                              className="w-full bg-slate-800 text-white border-slate-700 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-3 border h-24 placeholder-slate-500"
                          />
                      </div>
                    </div>

                  {showWarning && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
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

                  <div className="pt-4 flex justify-end">
                      <Button type="submit" size="lg" className="w-full sm:w-auto">
                          <Save size={18} className="mr-2" />
                          Save Entry
                      </Button>
                  </div>
              </form>
          </CardContent>
      </Card>

      {/* Recent History / Medical Record View */}
      <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="bg-transparent border-slate-200 flex flex-row items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <History size={16} />
                  History Log
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">Select an entry to edit</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-sm">No logs recorded yet.</p>
                    <p className="text-slate-300 text-xs mt-1">Daily entries will appear here for your doctor's review.</p>
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
                      className={`w-full text-left rounded-xl border transition-all overflow-hidden group ${
                          isSelected 
                          ? 'bg-white border-teal-500 ring-1 ring-teal-500 shadow-md' 
                          : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md'
                      }`}
                  >
                      {/* Header bar of the card */}
                      <div className={`px-4 py-3 flex justify-between items-center border-b ${isSelected ? 'bg-teal-50/50 border-teal-100' : 'bg-slate-50/50 border-slate-100 group-hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${isHighSeverity ? 'bg-red-500' : 'bg-teal-400'}`} />
                             <span className="font-bold text-slate-700 text-sm">
                                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'})}
                             </span>
                          </div>
                          {log.date === new Date().toISOString().split('T')[0] && (
                              <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">TODAY</span>
                          )}
                      </div>

                      {/* Content Grid */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {/* Symptoms Column */}
                          <div className="space-y-2">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Symptoms</p>
                              <div className="grid grid-cols-2 gap-y-1">
                                  <div className="text-slate-600">Stress</div>
                                  <div className={`font-medium ${log.stress > 7 ? 'text-red-600' : 'text-slate-900'}`}>{log.stress}/10</div>
                                  
                                  <div className="text-slate-600">Tremors</div>
                                  <div className={`font-medium ${log.tremors > 7 ? 'text-red-600' : 'text-slate-900'}`}>{log.tremors}/10</div>
                                  
                                  <div className="text-slate-600">Dizziness</div>
                                  <div className={`font-medium ${log.dizziness > 7 ? 'text-red-600' : 'text-slate-900'}`}>{log.dizziness}/10</div>
                              </div>
                          </div>

                          {/* Vitals Column */}
                          <div className="space-y-2">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vitals</p>
                               <div className="grid grid-cols-2 gap-y-1">
                                  <div className="text-slate-600">BP</div>
                                  <div className="font-medium text-slate-900">
                                    {log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic}` : '--/--'}
                                  </div>
                                  
                                  <div className="text-slate-600">Sleep</div>
                                  <div className="font-medium text-slate-900">
                                    {log.sleepHours}h <span className="text-slate-400 font-normal text-xs">({log.sleepQuality}/10)</span>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Notes/Meds Row (Full width if needed) */}
                          {(log.medications || log.notes) && (
                              <div className="sm:col-span-2 pt-3 border-t border-slate-50 mt-1">
                                  {log.medications && (
                                    <div className="flex gap-2 text-xs mb-1.5">
                                        <Pill size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span className="text-slate-600 truncate">{log.medications}</span>
                                    </div>
                                  )}
                                  {log.notes && (
                                    <div className="flex gap-2 text-xs">
                                        <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span className="text-slate-600 italic truncate">{log.notes}</span>
                                    </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </button>
                  );
              })}
            </div>
          </CardContent>
      </Card>
    </div>
  );
};