import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { InventoryShortage } from '../types';
import { Package, AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white flex items-center tracking-tight">
          <Package className="mr-3 h-8 w-8 text-blue-400" /> 
          Inventory Shortage Alerts
        </h1>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </GlassButton>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-4 bg-red-500/10 border-red-500/30 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard className="overflow-hidden">
        {loading && data.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-blue-200/50">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p>Syncing warehouse data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-widest text-blue-200/70">
                  <th className="px-6 py-4 font-medium">Material</th>
                  <th className="px-6 py-4 font-medium text-right">Current Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Reorder Level</th>
                  <th className="px-6 py-4 font-medium text-right">Shortage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <Package className="h-12 w-12 mx-auto text-white/10 mb-3" />
                      <p className="text-lg font-medium text-gray-300">Stock Levels Optimal</p>
                      <p className="text-sm mt-1">No materials currently below reorder level.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.itemId}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">{item.materialName}</div>
                        <div className="text-xs text-blue-200/50 font-mono mt-0.5">{item.materialType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-300 font-medium">{item.currentStock.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-300">{item.minimumRequired.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md border ${
                          item.unitsToOrder > 0
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-green-500/10 border-green-500/20 text-green-400'
                        }`}>
                          <span className="text-sm font-bold">{item.unitsToOrder > 0 ? `-${item.unitsToOrder.toLocaleString()}` : '✓ OK'}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default InventoryDashboard;
