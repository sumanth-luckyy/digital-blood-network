import React, { useState } from 'react';
import { User, Bell, Shield, RotateCcw, CheckCircle2, Smartphone } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { appStorage } from '../lib/storage';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { requestWebPushPermission } = useNotifications();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [resetDone, setResetDone] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRequestPush = async () => {
    const granted = await requestWebPushPermission();
    setPushEnabled(granted);
    if (!granted) {
      alert('Notification permissions were blocked by browser settings.');
    }
  };

  const handleResetData = () => {
    if (confirm('Reset application to clean initial seed data?')) {
      appStorage.resetToDemo();
      setResetDone(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Account & Notification Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your notification channels, security credentials, and application preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Preferences successfully saved.</span>
        </div>
      )}

      {resetDone && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-amber-600" />
          <span>Application state reset to synthetic seed data. Reloading...</span>
        </div>
      )}

      {/* Account Profile Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{user?.full_name}</h3>
            <span className="text-xs text-slate-400">
              Role: <strong className="text-slate-800 uppercase">{user?.role}</strong> • {user?.email}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={user?.full_name}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                defaultValue={user?.phone || '+1-555-0100'}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Emergency Delivery Channels
            </h4>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div className="text-xs">
                <strong className="block text-slate-900">Web Push Notifications</strong>
                <span className="text-slate-500">
                  Receive browser notifications for matching emergency requisitions
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant={pushEnabled ? 'outline' : 'secondary'}
                onClick={handleRequestPush}
              >
                {pushEnabled ? 'Enabled' : 'Enable Push'}
              </Button>
            </div>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer">
              <div className="text-xs">
                <strong className="block text-slate-900">SMS Critical Dispatch</strong>
                <span className="text-slate-500">Direct mobile SMS for urgent code-red surges</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-[#C62828] focus:ring-[#C62828]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer">
              <div className="text-xs">
                <strong className="block text-slate-900">Email Transfusion Bulletins</strong>
                <span className="text-slate-500">Weekly inventory trends and donation milestones</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-[#C62828] focus:ring-[#C62828]"
              />
            </label>
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" size="sm" className="font-semibold">
              Save Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Demo Sandbox Management */}
      <Card className="p-6 border-red-200 bg-red-50/20 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-[#C62828]" />
          <span>Demo Data Management</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Restore the in-browser sandbox state back to default synthetic demo accounts, organizations, emergency requests, and inventory batches.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={handleResetData}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset All Demo Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
