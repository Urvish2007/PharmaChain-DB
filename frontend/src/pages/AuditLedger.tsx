import { useEffect, useState } from 'react';
import api from '../api/client';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Link, Lock, Hash, Clock, User, Box } from 'lucide-react';

interface LedgerRecord {
  id: number;
  action: string;
  entityName: string;
  entityId: string;
  dataPayload: string;
  performedBy: string;
  timestamp: string;
  previousHash: string;
  currentHash: string;
}

const AuditLedger = () => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{isValid: boolean, message: string} | null>(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await api.get('/audit-ledger');
      if (Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        console.error('API did not return an array:', res.data);
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyLedger = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await api.get('/audit-ledger/verify');
      setVerificationResult(res.data);
    } catch (err: any) {
      console.error(err);
      setVerificationResult({ isValid: false, message: err.response?.data?.message || 'Verification request failed' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="h-6 w-6 text-emerald-500" />
            Cryptographic Audit Ledger
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Immutable, SHA-256 chained audit trail of all critical operations.
          </p>
        </div>
        <button
          onClick={verifyLedger}
          disabled={verifying}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {verifying ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Verify Integrity
        </button>
      </div>

      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-lg border p-4 ${
            verificationResult.isValid 
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}
        >
          {verificationResult.isValid ? (
            <ShieldCheck className="h-6 w-6" />
          ) : (
            <ShieldAlert className="h-6 w-6" />
          )}
          <span className="font-medium">{verificationResult.message}</span>
        </motion.div>
      )}

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/20 before:to-transparent mt-8">
        {(Array.isArray(records) ? records : []).map((record, idx) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-emerald-100 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Link className="h-4 w-4" />
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md hover:border-emerald-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {record.action}
                </span>
                <div className="flex items-center text-xs text-gray-500 gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(record.timestamp).toLocaleString()}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                <Box className="h-5 w-5 text-gray-400" />
                {record.entityName} <span className="text-gray-400 font-normal">#{record.entityId}</span>
              </h3>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                <User className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{record.performedBy}</span>
              </div>
              
              <div className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-100 dark:border-gray-800/60">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Current Hash
                  </p>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                    {record.currentHash}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Link className="h-3 w-3" /> Previous Hash
                  </p>
                  <p className="text-xs font-mono text-gray-500 break-all bg-gray-100 dark:bg-gray-800/80 p-2 rounded">
                    {record.previousHash}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {records.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <Lock className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Ledger Entries</h3>
          <p className="mt-1">The cryptographic audit ledger is currently empty.</p>
        </div>
      )}
    </div>
  );
};

export default AuditLedger;
