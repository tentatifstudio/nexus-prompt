
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <div className="mt-6 flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Authenticating Session</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase mt-1 tracking-widest">Please hold on...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home and pass a state to trigger the login modal
    return <Navigate to="/" state={{ from: location, triggerLogin: true }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
