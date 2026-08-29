import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { AuthResponse } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { User, Lock, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        username,
        password,
      });
      login(response.data, username);
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setError('Network error: Cannot connect to backend at localhost:8081. Is the Spring Boot server running?');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard heavy className="p-8 sm:p-10 w-full max-w-md mx-auto">
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-md rounded-lg p-4 flex items-start shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <GlassInput
            id="username"
            name="username"
            type="text"
            label="Username"
            required
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User className="h-5 w-5" />}
          />

          <GlassInput
            id="password"
            name="password"
            type="password"
            label="Password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
          />
        </div>

        <div className="pt-2">
          <GlassButton
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full text-lg shadow-blue-500/20"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </GlassButton>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs font-medium text-blue-200/50 uppercase tracking-widest mb-3">Demo Accounts</p>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-md border border-white/5">
              <span className="text-gray-400">Admin</span>
              <span className="font-mono text-blue-300">admin / Admin@123</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-md border border-white/5">
              <span className="text-gray-400">QC Analyst</span>
              <span className="font-mono text-blue-300">qc.analyst / Qc@12345</span>
            </div>
          </div>
        </div>
      </form>
    </GlassCard>
  );
};

export default Login;
