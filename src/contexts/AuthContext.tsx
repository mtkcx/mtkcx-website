import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
          checkAdminStatus(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Use production URL for email redirect to ensure it works across all environments
    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'https://lovely-salamander-a3df8b.netlify.app/' 
      : `${window.location.origin}/`;
    
    // First check if user might already exist by trying to sign in with wrong password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-wrong-password'
    });
    
    // If we get "Invalid login credentials", user exists; if "User not found", user doesn't exist
    if (signInError && !signInError.message.includes('User not found') && 
        !signInError.message.includes('Invalid login credentials')) {
      // Some other error occurred
      return { error: signInError };
    }
    
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      // User exists, prevent signup
      return { error: new Error('An account with this email already exists. Please sign in instead.') };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || ''
        }
      }
    });
    
    if (error) {
      // Handle specific error cases for duplicate emails
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered') ||
          error.message.includes('email already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('already exists') ||
          error.status === 422) {
        return { error: new Error('An account with this email already exists. Please sign in instead.') };
      }
      return { error };
    }
    
    // If signup is successful, send welcome email
    if (data.user) {
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: email,
            name: fullName || ''
          }
        });
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Clean up any existing auth state first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      setProfile(null);
      setIsAdmin(false);
      
      // Clear all user-specific cart data from localStorage
      const userId = user?.id;
      if (userId) {
        localStorage.removeItem(`shopping-cart-${userId}`);
      }
      // Also clean up any old cart data
      localStorage.removeItem('shopping-cart');
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page refresh for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force refresh even on error
      window.location.href = '/';
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      // Refresh profile data
      fetchUserProfile(user.id);
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};