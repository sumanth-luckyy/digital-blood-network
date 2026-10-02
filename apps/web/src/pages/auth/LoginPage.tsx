import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Lock, Mail, ArrowRight, ShieldCheck, Heart, Building2, User } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('donor@bloodlink.demo');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(email);
      // Determine destination based on email or default
      if (email.includes('admin')) navigate('/admin/dashboard');
      else if (email.includes('hospital')) navigate('/hospital/dashboard');
      else if (email.includes('bloodbank')) navigate('/blood-bank/dashboard');
      else if (email.includes('patient')) navigate('/patient/dashboard');
      else navigate('/donor/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, role: UserRole, targetRoute: string) => {
    setIsLoading(true);
    await login(demoEmail, role);
    navigate(targetRoute);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#C62828] to-[#991b1b] flex items-center justify-center text-white mx-auto shadow-md shadow-red-200">
            <Droplet className="h-6 w-6 fill-current" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to BloodLink</h2>
          <p className="text-xs text-slate-500">
            Access your emergency coordination portal, inventory, or donor profile
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
            ⚡ Quick Demo Sign-In
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() =>
                handleQuickDemoLogin('donor@bloodlink.demo', 'donor', '/donor/dashboard')
              }
              className="p-2 bg-white rounded-lg border border-slate-200 hover:border-red-300 font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-red-50/50"
            >
              <Heart className="h-3.5 w-3.5 text-red-500" />
              <span>O- Donor</span>
            </button>

            <button
              onClick={() =>
                handleQuickDemoLogin('patient@bloodlink.demo', 'patient', '/patient/dashboard')
              }
              className="p-2 bg-white rounded-lg border border-slate-200 hover:border-red-300 font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-red-50/50"
            >
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span>Requester</span>
            </button>

            <button
              onClick={() =>
                handleQuickDemoLogin('hospital@bloodlink.demo', 'hospital_staff', '/hospital/dashboard')
              }
              className="p-2 bg-white rounded-lg border border-slate-200 hover:border-red-300 font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-red-50/50"
            >
              <Building2 className="h-3.5 w-3.5 text-purple-500" />
              <span>Hospital Lead</span>
            </button>

            <button
              onClick={() =>
                handleQuickDemoLogin('bloodbank@bloodlink.demo', 'blood_bank_staff', '/blood-bank/dashboard')
              }
              className="p-2 bg-white rounded-lg border border-slate-200 hover:border-red-300 font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-red-50/50"
            >
              <Building2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Blood Bank</span>
            </button>
          </div>

          <button
            onClick={() =>
              handleQuickDemoLogin('admin@bloodlink.demo', 'admin', '/admin/dashboard')
            }
            className="w-full mt-1.5 p-2 bg-[#17233C] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Platform Admin Suite</span>
          </button>
        </div>

        {/* Regular Login Card */}
        <Card className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@domain.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-[#C62828] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full font-semibold"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>
        </Card>

        {/* Registration Link */}
        <p className="text-center text-xs text-slate-500">
          New to BloodLink?{' '}
          <Link to="/auth/register" className="font-semibold text-[#C62828] hover:underline">
            Register as a voluntary donor or facility
          </Link>
        </p>
      </div>
    </div>
  );
};
