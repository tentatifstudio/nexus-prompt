
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // If error or no data, we return null but don't throw to avoid breaking the flow
      if (error) {
        console.warn("Profile fetch warning (might not exist yet):", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Profile fetch error:", err);
      return null;
    }
  };

  const mapSupabaseUser = async (sbUser: any): Promise<User> => {
    const profile = await fetchProfile(sbUser.id);
    
    // Handle cases where profile might be null or partially filled
    const isPro = profile?.is_pro ?? false;
    const username = profile?.username || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User';
    const avatarUrl = profile?.avatar_url || sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.id}`;

    return {
      id: sbUser.id,
      name: username,
      avatar: avatarUrl,
      email: sbUser.email,
      bio: profile?.bio || '',
      plan: isPro ? 'pro' : 'free',
      is_pro: isPro
    };
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mappedUser = await mapSupabaseUser(session.user);
        setUser(mappedUser);
      }
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const mappedUser = await mapSupabaseUser(session.user);
          setUser(mappedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(null);
      } finally {
        // ALWAYS set loading to false to prevent infinite spinners
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      try {
        if (session?.user) {
          const mappedUser = await mapSupabaseUser(session.user);
          setUser(mappedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google Sign-in error:", err);
      throw err;
    }
  };

  const upgradeToPro = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', user.id);
      if (error) throw error;
      await refreshUser();
    } catch (err) {
      console.error("Upgrade error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, upgradeToPro, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
