
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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
  const authChecked = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) return null;
      return data;
    } catch (err) {
      return null;
    }
  };

  const syncUser = async (sbUser: any) => {
    if (!sbUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // STEP 1: Buat data dasar (Immediate) agar UI tidak stuck
    const baseUser: User = {
      id: sbUser.id,
      name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
      avatar: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.id}`,
      email: sbUser.email,
      bio: '',
      plan: 'free',
      is_pro: false
    };

    // Langsung pasang user dasar dan matikan loading
    setUser(baseUser);
    setLoading(false);

    // STEP 2: Ambil data profil di background (Non-blocking)
    const profile = await fetchProfile(sbUser.id);
    if (profile) {
      setUser({
        ...baseUser,
        name: profile.username || baseUser.name,
        avatar: profile.avatar_url || baseUser.avatar,
        bio: profile.bio || '',
        plan: profile.is_pro ? 'pro' : 'free',
        is_pro: !!profile.is_pro
      });
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await syncUser(session.user);
    }
  };

  useEffect(() => {
    // Safety Timeout: Jika 7 detik tidak selesai loading, paksa berhenti
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out. Forcing UI to load.");
        setLoading(false);
      }
    }, 7000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await syncUser(session?.user || null);
      } catch (err) {
        console.error("Critical Auth Init Error:", err);
        setLoading(false);
      } finally {
        authChecked.current = true;
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Hanya tampilkan loading jika event adalah login baru atau perubahan penting
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setLoading(true);
      }
      
      await syncUser(session?.user || null);
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true); // Mulai loading saat klik login
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err) {
      setLoading(false);
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
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
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
