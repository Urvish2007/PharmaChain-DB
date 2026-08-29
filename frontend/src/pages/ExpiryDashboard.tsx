import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { ExpiryRisk } from '../types';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white flex items-center tracking-tight">
          <AlertTriangle className="mr-3 h-8 w-8 text-yellow-400" /> 
          Expiry Risk (Next 90 Days)
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
            <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-4" />
            <p>Scanning batch records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-widest text-yellow-200/60">
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Batch No</th>
                  <th className="px-6 py-4 font-medium text-right">Stock Qty</th>
                  <th className="px-6 py-4 font-medium text-right">Expiry Date</th>
                  <th className="px-6 py-4 font-medium text-right">Time Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <AlertTriangle className="h-12 w-12 mx-auto text-white/10 mb-3" />
                      <p className="text-lg font-medium text-gray-300">No Immediate Risks</p>
                      <p className="text-sm mt-1">No batches expiring within the next 90 days.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => {
                    const isCritical = item.daysToExpiry < 30;
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={item.batchNo}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-white group-hover:text-yellow-100 transition-colors">{item.productName}</div>
                          <div className="text-xs text-yellow-200/50 font-mono mt-0.5">{item.productId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-300 bg-black/30 px-2 py-1 rounded border border-white/5">{item.batchNo}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm text-gray-300 font-medium">{item.stockQty}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm text-gray-300">{item.expiryDate}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-md border ${
                            isCritical 
                              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          }`}>
                            <span className="text-sm font-bold">{item.daysToExpiry}</span>
                            <span className="text-xs ml-1 opacity-70">days</span>
                          </div>
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

export default ExpiryDashboard;
