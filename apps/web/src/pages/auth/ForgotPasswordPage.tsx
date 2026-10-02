import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#C62828] to-[#991b1b] flex items-center justify-center text-white mx-auto shadow-md">
            <Droplet className="h-6 w-6 fill-current" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Reset Your Password</h2>
          <p className="text-xs text-slate-500">
            Enter your account email to receive safe password reset instructions
          </p>
        </div>

        <Card className="p-6">
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Instructions Dispatched</h3>
              <p className="text-xs text-slate-500">
                If an account exists for <strong className="text-slate-900">{email}</strong>, a secure reset link has been dispatched.
              </p>
              <div className="pt-3">
                <Link to="/auth/login">
                  <Button size="sm" variant="outline">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email
                </label>
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

              <Button type="submit" isLoading={isLoading} className="w-full font-semibold">
                Send Reset Link
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-slate-500">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1 font-semibold text-[#C62828] hover:underline"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};
