import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeAuthError, authService } from './auth';
import { supabase } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

describe('Authentication Service & Error Normalization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeAuthError', () => {
    it('translates invalid credentials into user-safe message', () => {
      const err = { message: 'Invalid login credentials' };
      expect(normalizeAuthError(err)).toBe('Invalid email or password. Please verify your credentials.');
    });

    it('translates unconfirmed email into actionable message', () => {
      const err = { message: 'Email not confirmed' };
      expect(normalizeAuthError(err)).toBe('Please verify your email address before signing in.');
    });

    it('translates duplicate user registration', () => {
      const err = { message: 'User already registered' };
      expect(normalizeAuthError(err)).toBe('An account with this email address already exists.');
    });

    it('translates rate limit error', () => {
      const err = { message: 'over email rate limit' };
      expect(normalizeAuthError(err)).toBe('Too many attempts. Please wait a few minutes before trying again.');
    });

    it('returns generic fallback when message is empty or null', () => {
      expect(normalizeAuthError(null)).toBe('An unexpected error occurred.');
    });

    it('preserves generic error messages when safe', () => {
      const err = { message: 'Custom network timeout' };
      expect(normalizeAuthError(err)).toBe('Custom network timeout');
    });
  });

  describe('authService operations with mocked supabase client', () => {
    it('handles successful signUp', async () => {
      const mockUser = { id: 'u123', email: 'student@example.com' } as User;
      vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      });

      const res = await authService.signUp('student@example.com', 'password123', 'Student Name');
      expect(res.error).toBeNull();
      expect(res.data?.id).toBe('u123');
    });

    it('handles signUp error with normalization', async () => {
      vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'User already registered' } as AuthError,
      });

      const res = await authService.signUp('student@example.com', 'password123', 'Student Name');
      expect(res.data).toBeNull();
      expect(res.error).toBe('An account with this email address already exists.');
    });

    it('handles successful signIn', async () => {
      const mockSession = { access_token: 'token123', user: { id: 'u123' } } as Session;
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      const res = await authService.signIn('student@example.com', 'password123');
      expect(res.error).toBeNull();
      expect(res.data?.access_token).toBe('token123');
    });

    it('handles signIn error with normalization', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' } as AuthError,
      });

      const res = await authService.signIn('student@example.com', 'wrongpassword');
      expect(res.data).toBeNull();
      expect(res.error).toBe('Invalid email or password. Please verify your credentials.');
    });

    it('handles successful signOut', async () => {
      vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({
        error: null,
      });

      const res = await authService.signOut();
      expect(res.error).toBeNull();
    });

    it('handles successful resetPassword', async () => {
      vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const res = await authService.resetPassword('student@example.com');
      expect(res.error).toBeNull();
    });
  });
});
