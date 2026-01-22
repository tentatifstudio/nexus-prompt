
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let timer: number;
    if (loading) {
      timer = window.setTimeout(() => {
        setTimedOut(true);
      }, 8000); // 8 seconds timeout for protected route
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full animate-pulse" />
        </div>
        <div className="mt-8 flex flex-col items-center text-center px-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Verifying Vault Access</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest max-w-[200px]">Connecting to secure registry...</p>
        </div>
      </div>
    );
  }

  // Jika timeout terjadi, anggap tidak login untuk keamanan dan kirim balik ke home
  if (timedOut && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
           <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Connection Slow</h3>
        <p className="text-xs text-slate-500 font-medium mb-8 max-w-xs">Kami kesulitan memverifikasi sesi Anda. Silakan coba masuk kembali.</p>
        <Navigate to="/" state={{ triggerLogin: true }} replace />
      </div>
    );
  }

  if (!user && !loading) {
    return <Navigate to="/" state={{ from: location, triggerLogin: true }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
