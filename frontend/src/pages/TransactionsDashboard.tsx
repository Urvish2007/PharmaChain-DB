import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { AlertCircle, RefreshCw, ArrowUpDown, Layers } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { motion } from 'framer-motion';

interface Batch {
  batchNo: number;
  productId: string;
  batchSize: number;
  stockQty: number;
  mfgDate: string;
  expDate: string;
  yieldPercentage: number;
  utQA: string;
}

const statusColor = (batch: Batch) => {
  const today = new Date();
  const exp = new Date(batch.expDate);
  const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  if (daysLeft < 0) return { label: 'Expired', cls: 'bg-gray-500/10 border-gray-500/30 text-gray-400' };
  if (daysLeft < 30) return { label: 'Critical', cls: 'bg-red-500/10 border-red-500/30 text-red-400' };
  if (daysLeft < 90) return { label: 'Near Expiry', cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' };
  return { label: 'Active', cls: 'bg-green-500/10 border-green-500/30 text-green-400' };
};

const TransactionsDashboard: React.FC = () => {
  const [data, setData] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED'>('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Batch[]>('/batches');
      setData(res.data);
      setError('');
    } catch {
      setError('Failed to load batch transactions. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = data.filter((b) => {
    if (filter === 'ALL') return true;
    const { label } = statusColor(b);
    if (filter === 'ACTIVE') return label === 'Active';
    if (filter === 'NEAR_EXPIRY') return label === 'Near Expiry' || label === 'Critical';
    if (filter === 'EXPIRED') return label === 'Expired';
    return true;
  });

  const totalBatches = data.length;
  const activeBatches = data.filter(b => statusColor(b).label === 'Active').length;
  const expiredBatches = data.filter(b => statusColor(b).label === 'Expired').length;
  const totalUnits = data.reduce((s, b) => s + b.stockQty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white flex items-center tracking-tight">
          <ArrowUpDown className="mr-3 h-8 w-8 text-cyan-400" />
          Batch Transactions
        </h1>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </GlassButton>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Batches', value: totalBatches, color: 'text-cyan-300' },
          { label: 'Active', value: activeBatches, color: 'text-green-400' },
          { label: 'Expired', value: expiredBatches, color: 'text-gray-400' },
          { label: 'Total Stock Units', value: totalUnits.toLocaleString(), color: 'text-blue-300' },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-4 bg-red-500/10 border-red-500/30 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'ACTIVE', 'NEAR_EXPIRY', 'EXPIRED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === f
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        {loading && data.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-blue-200/50">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p>Loading batch transactions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-widest text-cyan-200/60">
                  <th className="px-6 py-4 font-medium">Batch No</th>
                  <th className="px-6 py-4 font-medium">Product ID</th>
                  <th className="px-6 py-4 font-medium text-right">Batch Size</th>
                  <th className="px-6 py-4 font-medium text-right">Stock Qty</th>
                  <th className="px-6 py-4 font-medium text-right">Yield %</th>
                  <th className="px-6 py-4 font-medium">Mfg Date</th>
                  <th className="px-6 py-4 font-medium">Exp Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      <Layers className="h-12 w-12 mx-auto text-white/10 mb-3" />
                      <p className="text-lg font-medium text-gray-300">No batches found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((batch, idx) => {
                    const { label, cls } = statusColor(batch);
                    return (
                      <motion.tr
                        key={batch.batchNo}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">{batch.batchNo}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-cyan-300/80 font-mono">{batch.productId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm text-gray-300">{batch.batchSize.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-medium ${batch.stockQty === 0 ? 'text-gray-500' : 'text-gray-200'}`}>{batch.stockQty.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-medium ${batch.yieldPercentage >= 98 ? 'text-green-400' : batch.yieldPercentage >= 95 ? 'text-yellow-400' : 'text-red-400'}`}>{batch.yieldPercentage.toFixed(1)}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-400 font-mono">{batch.mfgDate}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-400 font-mono">{batch.expDate}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>{label}</span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default TransactionsDashboard;
