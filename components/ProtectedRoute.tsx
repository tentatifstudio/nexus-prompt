import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full animate-pulse" />
        </div>
        <div className="mt-8 flex flex-col items-center text-center px-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Verifying Vault Access</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location, triggerLogin: true }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;