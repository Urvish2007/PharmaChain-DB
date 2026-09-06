import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard/inventory" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center"
      >
        <div className="relative mb-6">
          {/* Glow behind icon */}
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl scale-150" />
          <div className="relative p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Shield className="h-10 w-10 text-indigo-400" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-white tracking-tight">
          PharmaChain
        </h2>
        <p className="mt-2 text-center text-xs font-medium text-white/30 uppercase tracking-[0.2em]">
          Secure Compliance Portal
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Outlet />
      </motion.div>

      {/* Bottom branding */}
      <div className="mt-12 text-center">
        <p className="text-[11px] text-white/15">
          Enterprise Pharmaceutical Supply Chain Management
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
