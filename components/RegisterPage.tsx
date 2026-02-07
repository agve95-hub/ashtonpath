import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-2xl mb-4 shadow-lg shadow-teal-600/20">
            A
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h2>
          <p className="text-slate-500 text-lg">Start your personalized tapering plan</p>
        </div>

        <Card className="shadow-xl shadow-slate-200/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                icon={<User className="h-4 w-4" />}
              />

              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    icon={<Lock className="h-4 w-4" />}
                />
                <Input
                    label="Confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••"
                    icon={<Lock className="h-4 w-4" />}
                />
              </div>

              <div className="text-xs text-slate-500 leading-relaxed px-1">
                By creating an account, you agree to our <a href="#" className="underline hover:text-slate-800">Terms of Service</a> and acknowledge the medical disclaimer.
              </div>

              <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
                Create Account
                {!isLoading && <ArrowRight size={18} className="ml-1 opacity-60" />}
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