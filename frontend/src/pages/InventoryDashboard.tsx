import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { InventoryShortage } from '../types';
import { Package, AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { motion } from 'framer-motion';

const InventoryDashboard: React.FC = () => {
  const [data, setData] = useState<InventoryShortage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get<InventoryShortage[]>('/dashboards/inventory-shortage');
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch inventory shortage data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ITEMS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const criticalCount = data.filter(i => i.unitsToOrder > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">
            <Package className="page-header-icon" strokeWidth={1.75} />
            Inventory Shortage
          </h1>
          <p className="text-sm text-white/30 mt-1 ml-11">Materials below reorder threshold</p>
        </div>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} size="sm">
          Refresh
        </GlassButton>
      </div>

      {/* Stats */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <GlassCard className="stat-card">
            <p className="stat-label">Total Materials</p>
            <p className="stat-value">{data.length}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">Below Threshold</p>
            <p className="stat-value text-red-400">{criticalCount}</p>
          </GlassCard>
          <GlassCard className="stat-card hidden sm:block">
            <p className="stat-label">Adequate Stock</p>
            <p className="stat-value text-emerald-400">{data.length - criticalCount}</p>
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

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {loading && data.length === 0 ? (
          <SkeletonLoader rows={10} columns={4} />
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th className="text-right">Current Stock</th>
                    <th className="text-right">Reorder Level</th>
                    <th className="text-right">Shortage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <Package className="h-10 w-10 mx-auto text-white/10 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-white/40">Stock Levels Optimal</p>
                        <p className="text-xs mt-1 text-white/20">No materials currently below reorder level.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        key={item.itemId}
                      >
                        <td>
                          <div className="text-sm font-medium text-white/90">{item.materialName}</div>
                          <div className="text-[11px] text-white/30 font-mono mt-0.5">{item.materialType}</div>
                        </td>
                        <td className="text-right">
                          <span className="text-sm text-white/60 font-medium tabular-nums">{item.currentStock.toLocaleString()}</span>
                        </td>
                        <td className="text-right">
                          <span className="text-sm text-white/40 tabular-nums">{item.minimumRequired.toLocaleString()}</span>
                        </td>
                        <td className="text-right">
                          <span className={`badge ${item.unitsToOrder > 0 ? 'badge-danger' : 'badge-success'}`}>
                            {item.unitsToOrder > 0 ? `-${item.unitsToOrder.toLocaleString()}` : '✓ OK'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination-bar">
                <span>
                  {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of {data.length}
                </span>
                <div className="flex gap-2">
                  <GlassButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} size="sm">
                    Previous
                  </GlassButton>
                  <GlassButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} size="sm">
                    Next
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default InventoryDashboard;
