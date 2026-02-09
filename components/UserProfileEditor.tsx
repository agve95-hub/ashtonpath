import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const UserProfileEditor: React.FC<Props> = (props) => {
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

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
      {/* Security Section Only */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-start bg-white border-b border-slate-100 pl-8">
            <h3 className="text-sm font-bold text-slate-800">
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