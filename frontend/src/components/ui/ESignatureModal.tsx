import React, { useState } from 'react';
import { X, KeyRound, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from './GlassButton';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

export interface SignatureConfig {
  entityId: string;
  entityName: string;
  action: string;
}

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: SignatureConfig | null;
}

const ESignatureModal: React.FC<ESignatureModalProps> = ({ isOpen, onClose, onSuccess, config }) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [meaning, setMeaning] = useState('Approval');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !config) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/signatures', {
        entityId: config.entityId,
        entityName: config.entityName,
        action: config.action,
        password,
        meaning
      });
      setPassword('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signature verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all duration-200 placeholder:text-white/25";
  const labelClass = "block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md glass-panel-heavy rounded-2xl overflow-hidden border border-indigo-500/20 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06] bg-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Electronic Signature</h2>
                <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider font-medium">21 CFR Part 11 Compliant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Details */}
          <div className="px-6 py-4 bg-black/20 border-b border-white/[0.03]">
            <p className="text-xs text-white/60 mb-2">You are electronically signing the following action:</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{config.action}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/10">
                {config.entityName} #{config.entityId}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>Signer Identity</label>
              <div className="w-full px-3.5 py-2.5 bg-black/20 border border-white/[0.04] rounded-xl text-white/50 text-sm cursor-not-allowed flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                {user?.username} ({user?.role.replace('_', ' ')})
              </div>
            </div>

            <div>
              <label className={labelClass}>Meaning of Signature</label>
              <select
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="Approval">Approval</option>
                <option value="Review">Review</option>
                <option value="Authorship">Authorship</option>
                <option value="Responsibility">Responsibility</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Password to Authenticate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 flex justify-end gap-3">
              <GlassButton
                type="button"
                onClick={onClose}
                disabled={loading}
                size="sm"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                isLoading={loading}
                size="sm"
              >
                {loading ? 'Signing...' : 'Sign & Submit'}
              </GlassButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ESignatureModal;
