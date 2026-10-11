import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 animate-pulse">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-700">Verifying session security...</p>
        <span className="sr-only">Checking authentication status</span>
      </div>
    );
  }

  if (!user) {
    // Preserve the intended destination in redirect state
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
