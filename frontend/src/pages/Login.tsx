import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { AuthResponse } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { User, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" strokeWidth={1.75} />
            <p className="text-sm text-red-300/80">{error}</p>
          </motion.div>
        )}

        <div className="space-y-5">
          <GlassInput
            id="username"
            name="username"
            type="text"
            label="Username"
            required
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User className="h-4 w-4" strokeWidth={1.75} />}
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
            icon={<Lock className="h-4 w-4" strokeWidth={1.75} />}
          />
        </div>

        <div className="pt-1">
          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </GlassButton>
        </div>

      </form>
    </GlassCard>
  );
};

export default Login;
