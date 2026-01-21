import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.warn("Profile not found, using default free plan");
      return { is_pro: false };
    }
    return data;
  };

  const mapSupabaseUser = async (sbUser: any): Promise<User> => {
    const profile = await fetchProfile(sbUser.id);
    return {
      id: sbUser.id,
      name: sbUser.user_metadata.full_name || sbUser.email?.split('@')[0] || 'Explorer',
      avatar: sbUser.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.id}`,
      email: sbUser.email,
      plan: profile.is_pro ? 'pro' : 'free'
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mappedUser = await mapSupabaseUser(session.user);
        setUser(mappedUser);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mappedUser = await mapSupabaseUser(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) throw error;
  };

  const upgradeToPro = async () => {
    if (!user) return;
    
    // Update profiles table directly
    const { error } = await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', user.id);

    if (error) throw error;
    
    setUser(prev => prev ? { ...prev, plan: 'pro' } : null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, upgradeToPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};