import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { User, Camera, Lock, Check, Clock, Calendar } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const UserProfileEditor: React.FC<Props> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
        alert("New passwords do not match.");
        return;
    }
    // Mock save
    alert("Password updated successfully.");
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <User size={20} className="text-teal-600" />
                Personal Profile
             </h3>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-[3px] bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-slate-300" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-[3px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={20} className="text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-teal-600 font-bold hover:text-teal-700 uppercase tracking-wide">
                            Change Photo
                        </button>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 w-full space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                             <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-[3px] shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder="Your Name"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Age</label>
                                <input 
                                    type="number" 
                                    value={formData.age} 
                                    onChange={e => setFormData(prev => ({...prev, age: e.target.value}))}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-[3px] shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder="e.g. 35"
                                />
                             </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                <Clock size={14} className="text-slate-400" />
                                Duration of Usage
                            </label>
                             <input 
                                type="text" 
                                value={formData.usageDuration} 
                                onChange={e => setFormData(prev => ({...prev, usageDuration: e.target.value}))}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-[3px] shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                                placeholder="e.g. 2 years, 6 months..."
                            />
                        </div>
                         <div className="flex justify-between items-center pt-2">
                            {saveSuccess ? (
                                <span className="text-sm text-teal-600 font-bold animate-in fade-in uppercase">Profile saved!</span>
                            ) : <span></span>}
                            <Button type="submit" size="md">
                                <Check size={18} className="mr-2" />
                                Save Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <Lock size={20} className="text-slate-400" />
                Security
            </h3>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">Current Password</label>
                    <input 
                        type="password" 
                        value={passwordData.current}
                        onChange={e => setPasswordData(prev => ({...prev, current: e.target.value}))}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-[3px] shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">New Password</label>
                    <input 
                        type="password" 
                        value={passwordData.new}
                        onChange={e => setPasswordData(prev => ({...prev, new: e.target.value}))}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-[3px] shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">Confirm New Password</label>
                    <input 
                        type="password" 
                        value={passwordData.confirm}
                        onChange={e => setPasswordData(prev => ({...prev, confirm: e.target.value}))}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-[3px] shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                </div>
                <div className="pt-2">
                    <Button type="submit" variant="secondary" size="md">
                        Update Password
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};