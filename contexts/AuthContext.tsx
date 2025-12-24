import React, { createContext, useContext, useEffect, useState } from 'react';
import { SafetyAPI } from '../services/api';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await SafetyAPI.getCurrentUser();
      setUser(user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await SafetyAPI.signIn(email, password);
    if (!error) {
      // Use the session data if available, otherwise fetch user
      if (data?.session?.user) {
        setUser(data.session.user);
        setLoading(false);
      } else {
        // Wait a bit for auth state to update, then fetch user
        setTimeout(async () => {
          const { user } = await SafetyAPI.getCurrentUser();
          setUser(user);
          setLoading(false);
        }, 100);
      }
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await SafetyAPI.signUp(email, password);
    if (!error) {
      const { user } = await SafetyAPI.getCurrentUser();
      setUser(user);
    }
    return { error };
  };

  const signOut = async () => {
    await SafetyAPI.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

