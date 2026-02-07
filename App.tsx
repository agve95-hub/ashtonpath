import React, { useState, useEffect } from 'react';
import { DisclaimerModal } from './components/DisclaimerModal';
import { TaperForm } from './components/TaperForm';
import { TaperSchedule } from './components/TaperSchedule';
import { TaperChart } from './components/TaperChart';
import { DailyJournal } from './components/DailyJournal';
import { UserProfileEditor } from './components/UserProfileEditor';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { TaperPlan, BenzoType, TaperSpeed, DailyLogEntry, UserProfile } from './types';
import { calculateTaperSchedule } from './services/taperCalculator';
import { Card, CardContent, CardHeader } from './components/ui/Card';
import { BookOpen, Info, RefreshCw, AlertCircle, LayoutDashboard, ClipboardEdit, Settings, Activity, LogOut } from 'lucide-react';
import { Button } from './components/ui/Button';

type Tab = 'overview' | 'log' | 'settings';
type AuthView = 'login' | 'register';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  
  // App State
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [plan, setPlan] = useState<TaperPlan | null>(null);
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    usageDuration: '',
    avatar: ''
  });

  // Load state from local storage on mount
  useEffect(() => {
    const session = localStorage.getItem('ashton_session');
    if (session) {
        setIsAuthenticated(true);
    }

    const savedDisclaimer = localStorage.getItem('ashton_disclaimer');
    if (savedDisclaimer === 'true') {
      setHasAcceptedDisclaimer(true);
    }

    const savedPlan = localStorage.getItem('ashton_plan');
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        // Data Migration
        if (parsed.steps) {
            parsed.steps = parsed.steps.map((s: any) => ({
                ...s,
                durationDays: s.durationDays || 7,
                completedDays: Array.isArray(s.completedDays) 
                    ? s.completedDays 
                    : new Array(s.durationDays || 7).fill(s.isCompleted)
            }));
        }
        setPlan(parsed);
      } catch (e) {
        console.error("Failed to parse saved plan", e);
      }
    }

    const savedLogs = localStorage.getItem('ashton_logs');
    if (savedLogs) {
        try {
            setLogs(JSON.parse(savedLogs));
        } catch (e) {
            console.error("Failed to parse saved logs", e);
        }
    }

    const savedProfile = localStorage.getItem('ashton_profile');
    if (savedProfile) {
        try {
            setUserProfile(JSON.parse(savedProfile));
        } catch (e) {
            console.error("Failed to parse profile", e);
        }
    }
  }, []);

  // Auth Handlers
  const handleLogin = () => {
    localStorage.setItem('ashton_session', 'true');
    setIsAuthenticated(true);
  };

  const handleRegister = (name: string) => {
    localStorage.setItem('ashton_session', 'true');
    // Initialize profile with name
    const newProfile = { ...userProfile, name };
    setUserProfile(newProfile);
    localStorage.setItem('ashton_profile', JSON.stringify(newProfile));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('ashton_session');
        setIsAuthenticated(false);
        setAuthView('login');
    }
  };

  // App Handlers
  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    localStorage.setItem('ashton_disclaimer', 'true');
  };

  const handleGeneratePlan = (med: BenzoType, dose: number, speed: TaperSpeed, date: string) => {
    const newPlan = calculateTaperSchedule(med, dose, speed, date);
    setPlan(newPlan);
    localStorage.setItem('ashton_plan', JSON.stringify(newPlan));
    setActiveTab('overview');
  };

  const handleToggleDay = (stepId: string, dayIndex: number) => {
      if (!plan) return;
      const updatedSteps = plan.steps.map(step => {
          if (step.id === stepId) {
              const newDays = [...step.completedDays];
              newDays[dayIndex] = !newDays[dayIndex];
              const isNowCompleted = newDays.every(d => d === true);
              return { ...step, completedDays: newDays, isCompleted: isNowCompleted };
          }
          return step;
      });

      const updatedPlan = { ...plan, steps: updatedSteps };
      setPlan(updatedPlan);
      localStorage.setItem('ashton_plan', JSON.stringify(updatedPlan));
  };

  const handleAddDay = (stepId: string) => {
    if (!plan) return;
    const updatedSteps = plan.steps.map(step => {
        if (step.id === stepId) {
            return { 
                ...step, 
                durationDays: step.durationDays + 1,
                completedDays: [...step.completedDays, false]
            };
        }
        return step;
    });

    const updatedPlan = { ...plan, steps: updatedSteps };
    setPlan(updatedPlan);
    localStorage.setItem('ashton_plan', JSON.stringify(updatedPlan));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear your plan?")) {
        setPlan(null);
        localStorage.removeItem('ashton_plan');
        setActiveTab('overview');
    }
  };

  const handleSaveLog = (entry: DailyLogEntry) => {
    const updatedLogs = logs.filter(l => l.date !== entry.date).concat(entry);
    setLogs(updatedLogs);
    localStorage.setItem('ashton_logs', JSON.stringify(updatedLogs));
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('ashton_profile', JSON.stringify(profile));
  };

  // Auth Guard
  if (!isAuthenticated) {
    if (authView === 'login') {
        return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />;
    } else {
        return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  return (
    <div className="min-h-screen pb-12 bg-slate-50/50">
      <DisclaimerModal 
        isOpen={!hasAcceptedDisclaimer} 
        onAccept={handleAcceptDisclaimer} 
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                A
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AshtonPath</h1>
          </div>
          <div className="flex items-center gap-4">
             {userProfile.avatar && (
                 <div className="flex items-center gap-2 mr-2">
                    <img src={userProfile.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                 </div>
             )}
             <a 
                href="https://www.benzo.org.uk/manual/" 
                target="_blank" 
                rel="noreferrer"
                className="text-sm font-medium text-slate-500 hover:text-teal-600 hidden sm:flex items-center gap-1"
            >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Read the Manual</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!plan ? (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8 text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Start Your Journey</h2>
                <p className="text-slate-600">
                    Create a personalized, gradual reduction schedule based on the medical gold standard.
                </p>
             </div>
            <TaperForm onGenerate={handleGeneratePlan} />
            
            <div className="mt-8 bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-800 border border-blue-100">
                <Info className="shrink-0 mt-0.5" size={18} />
                <p>
                    Why calculate based on Diazepam? The Ashton Manual recommends substituting short-acting benzodiazepines for Diazepam (Valium) due to its long half-life, which provides a smoother blood-level concentration and reduces withdrawal severity.
                </p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-6">
            
            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-6 shadow-inner">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Overview</span>
              </button>
              <button 
                onClick={() => setActiveTab('log')}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'log' 
                    ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <ClipboardEdit size={16} />
                <span className="hidden sm:inline">Daily Log</span>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {userProfile.name && (
                    <div className="flex items-center gap-2 text-slate-700 mb-2 px-1">
                        <span className="text-lg">Welcome back, <span className="font-bold text-slate-900">{userProfile.name}</span></span>
                    </div>
                )}

                {/* Chart */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Reduction Curve</h3>
                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Diazepam Equivalent (mg)
                        </div>
                    </CardHeader>
                    <CardContent>
                        <TaperChart steps={plan.steps} />
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="bg-gradient-to-br from-teal-600 to-teal-800 text-white border-none shadow-lg shadow-teal-700/20">
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-100 font-medium mb-1">Current Progress</p>
                            <div className="text-3xl font-bold">
                                {Math.round((plan.steps.filter(s => s.isCompleted).length / plan.steps.length) * 100)}%
                            </div>
                            <p className="text-teal-100 text-sm mt-1">
                                {plan.steps.filter(s => s.isCompleted).length} of {plan.steps.length} weeks complete
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-teal-100 text-sm mb-1">Target End Date</p>
                            <div className="text-xl font-semibold">
                                {new Date(new Date(plan.startDate).getTime() + (plan.steps.reduce((acc, s) => acc + s.durationDays, 0) * 24 * 60 * 60 * 1000)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <p className="text-xs text-teal-200 mt-1 opacity-80">(Estimated)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule List */}
                <TaperSchedule 
                    steps={plan.steps} 
                    medication={plan.medication}
                    isDiazepamCrossOver={plan.isDiazepamCrossOver}
                    onToggleDay={handleToggleDay}
                    onAddDay={handleAddDay}
                    logs={logs}
                    startDate={plan.startDate}
                />
              </div>
            )}

            {/* TAB CONTENT: Daily Log */}
            {activeTab === 'log' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <DailyJournal logs={logs} onSave={handleSaveLog} />
               </div>
            )}

            {/* TAB CONTENT: Settings */}
            {activeTab === 'settings' && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                  
                  <UserProfileEditor profile={userProfile} onSave={handleSaveProfile} />

                  <Card>
                      <CardHeader>
                          <h3 className="text-lg font-bold text-slate-900">Plan Settings</h3>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <span className="block text-sm text-slate-500 mb-1">Original Medication</span>
                                <div className="font-medium text-slate-900 text-lg flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  {plan.medication}
                                </div>
                            </div>
                            <div>
                                <span className="block text-sm text-slate-500 mb-1">Starting Dose</span>
                                <div className="font-medium text-slate-900 text-lg">{plan.startDose} mg</div>
                            </div>
                            <div>
                                <span className="block text-sm text-slate-500 mb-1">Taper Speed</span>
                                <div className="font-medium text-slate-900 text-lg">{plan.speed}</div>
                            </div>
                            <div>
                                <span className="block text-sm text-slate-500 mb-1">Start Date</span>
                                <div className="font-medium text-slate-900 text-lg">{new Date(plan.startDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Activity size={16} className="text-slate-400" />
                                Plan Actions
                                </h4>
                                <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800">
                                    <RefreshCw size={16} className="mr-2" />
                                    Reset Plan
                                </Button>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <LogOut size={16} className="text-slate-400" />
                                Account
                                </h4>
                                <Button variant="secondary" onClick={handleLogout} className="w-full sm:w-auto">
                                    <LogOut size={16} className="mr-2" />
                                    Log Out
                                </Button>
                            </div>
                          </div>
                      </CardContent>
                  </Card>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Safety Footer */}
      <footer className="max-w-3xl mx-auto px-4 text-center mt-12 mb-6">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 text-xs rounded-full border border-amber-100">
            <AlertCircle size={14} />
            <span>Always consult your doctor before changing your dosage. This app is not medical advice.</span>
         </div>
      </footer>
    </div>
  );
};

export default App;
