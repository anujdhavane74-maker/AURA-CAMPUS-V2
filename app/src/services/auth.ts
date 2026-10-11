import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthResult<T = void> {
  data: T | null;
  error: string | null;
}

/**
 * Normalizes Supabase / network authentication errors into user-safe messages
 */
export function normalizeAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;

  const authErr = error as AuthError;
  const msg = authErr.message || '';

  if (msg.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }
  if (msg.includes('User already registered')) {
    return 'An account with this email address already exists.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password is too weak. Please use at least 8 characters.';
  }
  if (msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (!isSupabaseConfigured) {
    return 'Supabase credentials are not configured yet. Please configure your .env.local file.';
  }

  return msg || 'Authentication request failed. Please try again.';
}

export const authService = {
  /**
   * Registers a new student account
   */
  async signUp(email: string, password: string, displayName: string): Promise<AuthResult<User>> {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: 'Supabase credentials are not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { data: null, error: normalizeAuthError(error) };
      }

      return { data: data.user, error: null };
    } catch (err) {
      return { data: null, error: normalizeAuthError(err) };
    }
  },

  /**
   * Signs in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult<Session>> {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: 'Supabase credentials are not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: normalizeAuthError(error) };
      }

      return { data: data.session, error: null };
    } catch (err) {
      return { data: null, error: normalizeAuthError(err) };
    }
  },

  /**
   * Signs out the current session
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { data: null, error: normalizeAuthError(error) };
      }
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: normalizeAuthError(err) };
    }
  },

  /**
   * Requests a password recovery email
   */
  async resetPassword(email: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: 'Supabase credentials are not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?type=recovery`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { data: null, error: normalizeAuthError(error) };
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: normalizeAuthError(err) };
    }
  },

  /**
   * Updates user password (e.g., after recovery)
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { data: null, error: normalizeAuthError(error) };
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: normalizeAuthError(err) };
    }
  },

  /**
   * Gets the active session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  /**
   * Gets the current user
   */
  async getUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },
};
