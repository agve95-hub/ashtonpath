import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User, Camera, Check, ShieldCheck, Clock } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const UserProfileEditor: React.FC<Props> = (props) => {
  const { profile, onSave } = props;
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
    <div className="space-y-8">
      {/* Profile Section */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 bg-white border-b border-slate-100">
             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Personal Profile
             </h3>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8">
            <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 shrink-0 mx-auto md:mx-0">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-300" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-teal-600 font-bold hover:text-teal-700 hover:underline">
                            Change Photo
                        </button>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Input 
                                label="Full Name"
                                value={formData.name} 
                                onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                                placeholder="Your Name"
                             />
                             <Input 
                                label="Age"
                                type="number"
                                value={formData.age} 
                                onChange={e => setFormData(prev => ({...prev, age: e.target.value}))}
                                placeholder="e.g. 35"
                             />
                        </div>
                        <div className="w-full">
                            <Input 
                                label="Duration of Usage"
                                value={formData.usageDuration} 
                                onChange={e => setFormData(prev => ({...prev, usageDuration: e.target.value}))}
                                placeholder="e.g. 2 years, 6 months..."
                                icon={<Clock className="w-4 h-4" />}
                            />
                        </div>
                         <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-2">
                            {saveSuccess ? (
                                <span className="text-xs text-teal-600 font-bold animate-in fade-in flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Profile saved
                                </span>
                            ) : <span></span>}
                            <Button type="submit" size="md">
                                Save Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 bg-white border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                Security
            </h3>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8">
            <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-lg">
                <Input 
                    label="Current Password"
                    type="password" 
                    value={passwordData.current}
                    onChange={e => setPasswordData(prev => ({...prev, current: e.target.value}))}
                />
                <Input 
                    label="New Password"
                    type="password" 
                    value={passwordData.new}
                    onChange={e => setPasswordData(prev => ({...prev, new: e.target.value}))}
                />
                <Input 
                    label="Confirm New Password"
                    type="password" 
                    value={passwordData.confirm}
                    onChange={e => setPasswordData(prev => ({...prev, confirm: e.target.value}))}
                />
                
                <div className="pt-4">
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