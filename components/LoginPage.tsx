import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Mail, Lock, ArrowRight } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-2xl mb-4 shadow-lg shadow-teal-600/20">
            A
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 text-lg">Sign in to continue your journey</p>
        </div>

        <Card className="shadow-xl shadow-slate-200/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
              />

              <div className="flex items-center justify-between text-sm pt-1">
                 <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 w-4 h-4" />
                    Remember me
                 </label>
                 <a href="#" className="text-teal-600 hover:text-teal-700 font-medium hover:underline">Forgot password?</a>
              </div>

              <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
                Sign In
                {!isLoading && <ArrowRight size={18} className="ml-1 opacity-60" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToRegister}
            className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-all"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};