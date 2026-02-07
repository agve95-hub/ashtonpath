import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

interface Props {
  onRegister: (name: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<Props> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onRegister(name);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-2xl mb-2 shadow-lg shadow-teal-600/20">
            A
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h2>
          <p className="text-slate-500">Start your personalized tapering plan</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/40">
          <CardContent className="pt-8 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                        placeholder="••••"
                    />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Confirm</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                        placeholder="••••"
                    />
                    </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                By creating an account, you agree to our <a href="#" className="underline hover:text-slate-800">Terms of Service</a> and acknowledge the medical disclaimer.
              </div>

              <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2 group" disabled={isLoading}>
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        Create Account
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-all"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
