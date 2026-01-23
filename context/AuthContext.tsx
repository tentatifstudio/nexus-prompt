
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapProfile = (sbUser: any, profile: any): User => ({
    id: sbUser.id,
    name: profile?.username || sbUser.email?.split('@')[0] || 'Explorer',
    avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.id}&background=random`,
    email: sbUser.email,
    bio: profile?.bio || '',
    plan: profile?.is_pro ? 'pro' : 'free',
    is_pro: !!profile?.is_pro
  });

  const initAuth = async () => {
    // FAIL-SAFE: Stop loading after 2.5s regardless of result
    const timer = setTimeout(() => setLoading(false), 2500);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(mapProfile(session.user, profile));
      }
    } catch (e) {
      console.error("Auth Init Error:", e);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUser(mapProfile(session.user, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const upgradeToPro = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ is_pro: true }).eq('id', user.id);
    await initAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: initAuth, logout, upgradeToPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
