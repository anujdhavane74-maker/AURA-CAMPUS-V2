import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Sparkles, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SignUpPage: React.FC = () => {
  const { signUp, isConfigured } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = signUpSchema.safeParse({ displayName, email, password });
    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || 'Invalid input.');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, displayName);
    setLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Your Profile</h1>
          <p className="text-xs text-slate-500">Private by default. Real proof of work.</p>
        </div>

        {!isConfigured && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <Info className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
            <p>
              <strong>Development Notice:</strong> Supabase credentials are pending in <code className="font-mono text-amber-950">.env.local</code>. Form inputs validate client-side per specifications.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Confirmation Email Dispatched</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We sent a verification link to <strong className="text-slate-800">{email}</strong>. Please check your inbox to confirm your student identity.
            </p>
            <div className="pt-2">
              <Link
                to="/auth/sign-in"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:underline"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="displayName">
                Full Name or Display Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Chen"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
                Student Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="password">
                Password (min. 8 characters) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-teal-50/70 p-3 text-[11px] text-teal-800 border border-teal-200">
              <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <p>
                Your account is private by default. Nothing is published to Explore or public routes without your explicit action.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/auth/sign-in" className="font-semibold text-teal-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
