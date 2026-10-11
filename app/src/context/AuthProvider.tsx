import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService, AuthResult } from '../services/auth';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Initial Session Retrieval
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    // 2. Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult<Session>> => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    if (result.data) {
      setSession(result.data);
      setUser(result.data.user);
    }
    setLoading(false);
    return result;
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResult<User>> => {
    setLoading(true);
    const result = await authService.signUp(email, password, displayName);
    setLoading(false);
    return result;
  };

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true);
    const result = await authService.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
    return result;
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    return authService.resetPassword(email);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
