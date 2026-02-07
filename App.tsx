import React, { useState, useEffect } from 'react';
import { DisclaimerModal } from './components/DisclaimerModal';
import { FullDisclaimer } from './components/FullDisclaimer';
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
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { BookOpen, LogOut, LayoutDashboard, ClipboardCheck, Settings, Activity, TrendingDown, RefreshCw, AlertCircle, Info } from 'lucide-react';

type Tab = 'overview' | 'log' | 'settings';
type AuthView = 'login' | 'register';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  
  // App State
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isFullDisclaimerOpen, setIsFullDisclaimerOpen] = useState(false);
  const [plan, setPlan] = useState<TaperPlan | null>(null);
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    usageDuration: '',
    avatar: ''
  });
  
  // Edit/Reset Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        // Data migration safety check
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
    const newProfile = { ...userProfile, name };
    setUserProfile(newProfile);
    localStorage.setItem('ashton_profile', JSON.stringify(newProfile));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('ashton_session');
    setIsAuthenticated(false);
    setAuthView('login');
    setActiveTab('overview');
  };

  // App Handlers
  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    localStorage.setItem('ashton_disclaimer', 'true');
  };

  const handleGeneratePlan = (med: BenzoType, dose: number, speed: TaperSpeed, date: string, targetEndDate?: string) => {
    const newPlan = calculateTaperSchedule(med, dose, speed, date, targetEndDate);
    setPlan(newPlan);
    localStorage.setItem('ashton_plan', JSON.stringify(newPlan));
    setActiveTab('overview');
    setIsEditModalOpen(false); // Close modal if open
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

  const handleResetRequest = () => {
    // Instead of immediate destruction, open modal to allow editing/resetting
    setIsEditModalOpen(true);
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

  if (!isAuthenticated) {
    if (authView === 'login') {
        return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />;
    } else {
        return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  // Calculate stats
  const completedSteps = plan ? plan.steps.filter(s => s.isCompleted).length : 0;
  const totalSteps = plan ? plan.steps.length : 0;
  const progressPercentage = plan ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const currentDose = plan ? (plan.steps.find(s => !s.isCompleted)?.diazepamDose || 0) : 0;

  return (
    <div className="min-h-screen pb-24 bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <DisclaimerModal 
        isOpen={!hasAcceptedDisclaimer} 
        onAccept={handleAcceptDisclaimer} 
      />

      <FullDisclaimer 
        isOpen={isFullDisclaimerOpen} 
        onClose={() => setIsFullDisclaimerOpen(false)} 
      />
      
      {/* Edit/Reset Plan Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Reconfigure Taper Plan"
      >
         <div className="p-0">
             <div className="bg-amber-50 p-4 border-b border-amber-100 text-sm text-amber-800 flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 mt-0.5 text-amber-600" />
                 <p>Warning: Updating your schedule will regenerate the entire timeline. Your past progress on specific days may need to be re-marked if the schedule changes significantly.</p>
             </div>
             <TaperForm 
                onGenerate={handleGeneratePlan} 
                initialValues={plan ? {
                    medication: plan.medication,
                    dose: plan.startDose,
                    speed: plan.speed,
                    startDate: plan.startDate
                } : undefined}
             />
         </div>
      </Modal>

      {/* Header */}
      <header className="bg-white/80 border-b border-slate-200/60 sticky top-0 z-40 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                AP
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">AshtonPath</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <a 
                href="https://www.benzo.org.uk/manual/" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-medium text-slate-500 hover:text-teal-600 hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Manual Reference</span>
            </a>
            
             {userProfile.avatar && (
                 <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <img src={userProfile.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                 </div>
             )}

             <button 
                type="button"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                title="Log Out"
             >
                 <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!plan ? (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-10 text-center space-y-3">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Your Taper Plan</h2>
                <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto">
                    Generate a personalized, medically-grounded benzodiazepine reduction schedule based on the Ashton Manual.
                </p>
             </div>
            <TaperForm onGenerate={handleGeneratePlan} />
            
            <div className="mt-8 bg-white p-6 rounded-xl border border-slate-100 shadow-soft flex items-start gap-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Info className="w-5 h-5" />
                </div>
                <div className="text-sm text-slate-600 leading-relaxed">
                    <strong className="block text-slate-900 mb-1">Why Diazepam?</strong>
                    The Ashton Manual recommends substituting short-acting benzodiazepines for Diazepam (Valium) due to its long half-life, which provides a smoother blood-level concentration and reduces withdrawal severity.
                </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-8">
            
            {/* Header Area with Greeting & Navigation */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sticky top-20 z-30 py-2">
                <div className="text-center md:text-left">
                     {userProfile.name && <p className="text-sm font-medium text-slate-500 mb-0.5">Welcome back, {userProfile.name}</p>}
                     <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Journey</h2>
                </div>
                
                <div className="bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-sm flex items-center">
                    {(['overview', 'log', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold capitalize tracking-wide transition-all duration-200
                                ${activeTab === tab 
                                    ? 'bg-teal-600 text-white shadow-md' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }
                            `}
                        >
                            {tab === 'overview' && <LayoutDashboard className="w-4 h-4" />}
                            {tab === 'log' && <ClipboardCheck className="w-4 h-4" />}
                            {tab === 'settings' && <Settings className="w-4 h-4" />}
                            <span>{tab}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Modern Progress Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-medium relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                         <CardContent className="h-full flex flex-col justify-between relative z-10 p-8">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Progress</p>
                                    <h3 className="text-3xl font-bold">{progressPercentage}% <span className="text-lg font-normal text-slate-400">Complete</span></h3>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                                    <Activity className="w-6 h-6 text-teal-400" />
                                </div>
                             </div>
                             
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                                    <span>Start</span>
                                    <span>Finish</span>
                                </div>
                                <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(20,184,166,0.5)]" 
                                        style={{ width: `${Math.max(5, progressPercentage)}%` }}
                                    ></div>
                                </div>
                             </div>
                         </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-soft">
                        <CardContent className="h-full flex flex-col justify-center p-8">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
                                    <TrendingDown className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Target</span>
                             </div>
                             <div>
                                 <span className="text-4xl font-bold text-slate-900 tracking-tight">{currentDose}</span>
                                 <span className="text-sm font-medium text-slate-500 ml-1">mg / day</span>
                             </div>
                             <p className="text-xs text-slate-400 mt-2 font-medium">Diazepam Equivalent</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">Reduction Curve</h3>
                    </CardHeader>
                    <CardContent>
                        <TaperChart steps={plan.steps} />
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
                          <h3 className="text-sm font-bold text-slate-800">Current Plan Configuration</h3>
                      </CardHeader>
                      <CardContent className="space-y-8 p-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100/60">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original Medication</span>
                                <div className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  {plan.medication}
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100/60">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Starting Dose</span>
                                <div className="font-semibold text-slate-900 text-lg">{plan.startDose} mg</div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100/60">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Taper Speed</span>
                                <div className="font-semibold text-slate-900 text-lg">{plan.speed}</div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100/60">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</span>
                                <div className="font-semibold text-slate-900 text-lg">{new Date(plan.startDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <Button type="button" variant="outline" onClick={handleResetRequest} className="w-full sm:w-auto text-slate-600 border-slate-300 hover:border-teal-500 hover:text-teal-700">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reconfigure Plan
                                </Button>
                                <Button type="button" variant="ghost" onClick={handleLogout} className="w-full sm:w-auto text-slate-400 hover:text-slate-600">
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Log Out
                                </Button>
                          </div>
                      </CardContent>
                  </Card>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Safety Footer */}
      <footer className="max-w-3xl mx-auto px-4 text-center mt-12 mb-12">
         <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-900/80 text-xs font-semibold rounded-full border border-amber-100/50">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Consult your doctor before changing your dosage. This app is not medical advice.</span>
            </div>
            
            <button 
                onClick={() => setIsFullDisclaimerOpen(true)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors border-b border-transparent hover:border-slate-300 pb-0.5"
            >
                Legal Disclaimer & Limitation of Liability
            </button>
         </div>
      </footer>
    </div>
  );
};

export default App;