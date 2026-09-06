import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { ExpiryRisk } from '../types';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { motion } from 'framer-motion';

const ExpiryDashboard: React.FC = () => {
  const [data, setData] = useState<ExpiryRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get<ExpiryRisk[]>('/dashboards/expiry-risk');
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch expiry risk data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const ITEMS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const criticalCount = data.filter(i => i.daysRemaining < 30 && i.daysRemaining >= 0).length;
  const expiredCount = data.filter(i => i.daysRemaining < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">
            <AlertTriangle className="page-header-icon" strokeWidth={1.75} />
            Expiry Risk
          </h1>
          <p className="text-sm text-white/30 mt-1 ml-11">Batches expiring within 90 days</p>
        </div>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} size="sm">
          Refresh
        </GlassButton>
      </div>

      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="stat-card">
            <p className="stat-label">At Risk</p>
            <p className="stat-value">{data.length}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">Critical (&lt;30d)</p>
            <p className="stat-value text-red-400">{criticalCount}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">Expired</p>
            <p className="stat-value text-white/30">{expiredCount}</p>
          </GlassCard>
        </div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-4 bg-red-500/5 border-red-500/20 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" strokeWidth={1.75} />
            <p className="text-sm text-red-300/80">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard className="overflow-hidden">
        {loading && data.length === 0 ? (
          <SkeletonLoader rows={10} columns={5} />
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Batch No</th>
                    <th className="text-right">Stock Qty</th>
                    <th className="text-right">Expiry Date</th>
                    <th className="text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <AlertTriangle className="h-10 w-10 mx-auto text-white/10 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-white/40">No Immediate Risks</p>
                        <p className="text-xs mt-1 text-white/20">No batches expiring within the next 90 days.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => {
                      const isCritical = item.daysRemaining < 30 && item.daysRemaining >= 0;
                      const isExpired = item.daysRemaining < 0;
                      return (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          key={item.batchNo}
                        >
                          <td>
                            <div className="text-sm font-medium text-white/90">{item.productName}</div>
                            <div className="text-[11px] text-white/30 font-mono mt-0.5">{item.riskStatus}</div>
                          </td>
                          <td>
                            <span className="text-sm font-mono text-white/50 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04]">{item.batchNo}</span>
                          </td>
                          <td className="text-right">
                            <span className="text-sm text-white/60 font-medium tabular-nums">{item.unsoldInventory.toLocaleString()}</span>
                          </td>
                          <td className="text-right">
                            <span className="text-sm text-white/40 tabular-nums">{item.expDate}</span>
                          </td>
                          <td className="text-right">
                            <span className={`badge ${
                              isExpired ? 'badge-neutral' : isCritical ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {item.daysRemaining}d
                            </span>
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
                <span>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of {data.length}</span>
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

export default ExpiryDashboard;
