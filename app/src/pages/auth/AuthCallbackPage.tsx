import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { authService } from '../../services/auth';
import { CheckCircle2, AlertCircle, Sparkles, Lock, ArrowRight } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'recovery' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const isRecovery = searchParams.get('type') === 'recovery';

    // Check if Supabase session is established from URL hash/code
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      if (isRecovery) {
        setStatus('recovery');
      } else if (data.session) {
        setStatus('success');
        // Brief pause so user sees confirmation before redirect
        const timer = setTimeout(() => {
          navigate('/app', { replace: true });
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setStatus('success');
      }
    });
  }, [searchParams, navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setUpdating(true);
    setErrorMessage(null);
    const result = await authService.updatePassword(newPassword);
    setUpdating(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setStatus('success');
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 1500);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs text-center space-y-6">
        {status === 'processing' && (
          <div className="space-y-4" role="status" aria-live="polite">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verifying Your Credentials</h1>
            <p className="text-xs text-slate-500">Connecting securely to Aura Campus identity service...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verification Confirmed</h1>
            <p className="text-xs text-slate-600">Your account is verified. Redirecting to your private dashboard...</p>
            <div className="pt-2">
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:underline"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {status === 'recovery' && (
          <div className="space-y-4 text-left">
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Set New Password</h1>
              <p className="text-xs text-slate-500">Choose a secure password for your Aura Campus account.</p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800" role="alert">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="new-password">
                  New Password (min. 8 characters)
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                <span>{updating ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verification Failed</h1>
            <p className="text-xs text-rose-700">{errorMessage || 'The verification link may have expired or is invalid.'}</p>
            <div className="pt-2">
              <Link
                to="/auth/sign-in"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:underline"
              >
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
