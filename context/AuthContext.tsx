import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_AVATAR_BASE = "https://ui-avatars.com/api/?background=random&color=fff&name=";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndMap = async (sbUser: any): Promise<User> => {
    let isPro = false;
    let username = sbUser.user_metadata?.full_name || sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || 'Member';
    let avatarUrl = sbUser.user_metadata?.avatar_url || `${DEFAULT_AVATAR_BASE}${username}`;
    let bio = '';

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();

      if (!error && profile) {
        isPro = !!profile.is_pro;
        username = profile.username || username;
        avatarUrl = profile.avatar_url || avatarUrl;
        bio = profile.bio || '';
      }
    } catch (err) {
      console.warn("AuthContext: Profile fetch failed, using fallbacks.");
    }

    return {
      id: sbUser.id,
      name: username,
      avatar: avatarUrl,
      email: sbUser.email,
      bio: bio,
      plan: isPro ? 'pro' : 'free',
      is_pro: isPro
    };
  };

  const initAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        const mappedUser = await fetchProfileAndMap(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("AuthContext Init Error:", err);
      setUser(null);
    } finally {
      // CRITICAL: Always release loading state
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mappedUser = await fetchProfileAndMap(session.user);
        setUser(mappedUser);
      }
    } catch (err) {
      console.error("AuthContext Refresh Error:", err);
    }
  };

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setLoading(true);
        try {
          if (session?.user) {
            const mappedUser = await fetchProfileAndMap(session.user);
            setUser(mappedUser);
          }
        } catch (err) {
          console.error("Auth Change Error:", err);
        } finally {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else {
        // Handle other events like INITIAL_SESSION
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
            username: username,
            avatar_url: `${DEFAULT_AVATAR_BASE}${username}`,
          }
        }
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPro = async () => {
    if (!user) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, logout, upgradeToPro, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};