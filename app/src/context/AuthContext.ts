import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthResult } from '../services/auth';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult<Session>>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult<User>>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
