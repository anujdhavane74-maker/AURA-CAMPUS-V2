import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { User, Session } from '@supabase/supabase-js';

const mockBaseContext: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  isAuthenticated: false,
  isConfigured: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
};

describe('ProtectedRoute Route Guard', () => {
  it('renders loading status when auth session is loading', () => {
    const loadingContext: AuthContextType = {
      ...mockBaseContext,
      loading: true,
    };

    render(
      <AuthContext.Provider value={loadingContext}>
        <MemoryRouter initialEntries={['/app']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ProtectedRoute>
            <div>Protected Dashboard Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/verifying session security/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /auth/sign-in', () => {
    render(
      <AuthContext.Provider value={mockBaseContext}>
        <MemoryRouter initialEntries={['/app']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <div>Protected Dashboard Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/auth/sign-in" element={<div>Sign In Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Sign In Screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument();
  });

  it('allows access to protected content when authenticated', () => {
    const mockUser: User = {
      id: 'test-user-id',
      app_metadata: {},
      user_metadata: { display_name: 'Alex Chen' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const authenticatedContext: AuthContextType = {
      ...mockBaseContext,
      user: mockUser,
      session: { user: mockUser } as Session,
      isAuthenticated: true,
    };

    render(
      <AuthContext.Provider value={authenticatedContext}>
        <MemoryRouter initialEntries={['/app']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ProtectedRoute>
            <div>Protected Dashboard Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument();
  });
});
