import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
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
  if (daysLeft < 0) return { label: 'Expired', cls: 'badge-neutral' };
  if (daysLeft < 30) return { label: 'Critical', cls: 'badge-danger' };
  if (daysLeft < 90) return { label: 'Near Expiry', cls: 'badge-warning' };
  return { label: 'Active', cls: 'badge-success' };
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

  const ITEMS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filter changes
  useEffect(() => { setCurrentPage(1); }, [filter]);

  const totalBatches = data.length;
  const activeBatches = data.filter(b => statusColor(b).label === 'Active').length;
  const expiredBatches = data.filter(b => statusColor(b).label === 'Expired').length;
  const totalUnits = data.reduce((s, b) => s + b.stockQty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">
            <Layers className="page-header-icon" strokeWidth={1.75} />
            Batch Transactions
          </h1>
          <p className="text-sm text-white/30 mt-1 ml-11">Production batch lifecycle overview</p>
        </div>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} size="sm">
          Refresh
        </GlassButton>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Batches', value: totalBatches },
          { label: 'Active', value: activeBatches, color: 'text-emerald-400' },
          { label: 'Expired', value: expiredBatches, color: 'text-white/30' },
          { label: 'Total Stock', value: totalUnits.toLocaleString() },
        ].map((s) => (
          <GlassCard key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={`stat-value ${s.color || ''}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-4 bg-red-500/5 border-red-500/20 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" strokeWidth={1.75} />
            <p className="text-sm text-red-300/80">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'ACTIVE', 'NEAR_EXPIRY', 'EXPIRED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              filter === f
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                : 'bg-white/[0.03] border-white/[0.06] text-white/35 hover:text-white/60 hover:bg-white/[0.06]'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        {loading && data.length === 0 ? (
          <SkeletonLoader rows={10} columns={8} />
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch No</th>
                    <th>Product ID</th>
                    <th className="text-right">Batch Size</th>
                    <th className="text-right">Stock Qty</th>
                    <th className="text-right">Yield %</th>
                    <th>Mfg Date</th>
                    <th>Exp Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <Layers className="h-10 w-10 mx-auto text-white/10 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-white/40">No batches found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((batch, idx) => {
                      const { label, cls } = statusColor(batch);
                      return (
                        <motion.tr
                          key={batch.batchNo}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                        >
                          <td>
                            <span className="font-mono text-sm font-medium text-white/80">{batch.batchNo}</span>
                          </td>
                          <td>
                            <span className="text-sm text-indigo-300/60 font-mono">{batch.productId}</span>
                          </td>
                          <td className="text-right">
                            <span className="text-sm text-white/50 tabular-nums">{batch.batchSize.toLocaleString()}</span>
                          </td>
                          <td className="text-right">
                            <span className={`text-sm font-medium tabular-nums ${batch.stockQty === 0 ? 'text-white/20' : 'text-white/60'}`}>{batch.stockQty.toLocaleString()}</span>
                          </td>
                          <td className="text-right">
                            <span className={`text-sm font-medium tabular-nums ${batch.yieldPercentage >= 98 ? 'text-emerald-400' : batch.yieldPercentage >= 95 ? 'text-amber-400' : 'text-red-400'}`}>
                              {batch.yieldPercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td><span className="text-sm text-white/35 font-mono tabular-nums">{batch.mfgDate}</span></td>
                          <td><span className="text-sm text-white/35 font-mono tabular-nums">{batch.expDate}</span></td>
                          <td>
                            <span className={`badge ${cls}`}>{label}</span>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination-bar">
                <span>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</span>
                <div className="flex gap-2">
                  <GlassButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} size="sm">Previous</GlassButton>
                  <GlassButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} size="sm">Next</GlassButton>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default TransactionsDashboard;
