import React, { useState } from 'react';
import api from '../api/client';
import { BatchTraceability } from '../types';
import { Search, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';

const TraceabilityDashboard: React.FC = () => {
  const [batchNo, setBatchNo] = useState('');
  const [data, setData] = useState<BatchTraceability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNo.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    setData(null);

    try {
      const response = await api.get<BatchTraceability[]>(`/dashboards/traceability/${batchNo.trim()}`);
      if (response.data && response.data.length > 0) {
        setData(response.data[0]);
      } else {
        setError('No traceability data found for this batch number.');
      }
    } catch (err: any) {
      setError('Failed to fetch traceability data. Verify the batch number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white flex items-center tracking-tight">
        <Search className="mr-3 h-8 w-8 text-purple-400" /> 
        Batch Traceability
      </h1>

      <GlassCard className="p-6 sm:p-8">
        <div className="max-w-2xl">
          <h3 className="text-xl font-medium text-white mb-2">FDA Traceability Lookup</h3>
          <p className="text-sm text-purple-200/60 mb-6">Enter a batch number (e.g. B-001) to view its full lifecycle, QC status, and distribution record.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <GlassInput
                id="batchNo"
                name="batchNo"
                type="text"
                placeholder="Batch Number"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                icon={<FileText className="h-4 w-4" />}
                className="w-full text-lg"
              />
            </div>
            <GlassButton
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={!batchNo.trim()}
              className="sm:w-32 h-[46px]" // match input height
            >
              Search
            </GlassButton>
          </form>
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlassCard className="p-4 bg-red-500/10 border-red-500/30 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </GlassCard>
          </motion.div>
        )}

        {data && (
          <motion.div key="data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <GlassCard heavy className="overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Traceability Report</h3>
                  <p className="text-sm text-purple-200/50 mt-1">Batch: <span className="font-mono text-purple-200">{data.batchNo}</span></p>
                </div>
                <div className={`mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-full border ${
                  data.qcStatus === 'PASSED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  data.qcStatus === 'FAILED' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                  'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}>
                  {data.qcStatus === 'PASSED' && <CheckCircle className="w-5 h-5 mr-2" />}
                  {data.qcStatus === 'FAILED' && <XCircle className="w-5 h-5 mr-2" />}
                  {(data.qcStatus !== 'PASSED' && data.qcStatus !== 'FAILED') && <AlertCircle className="w-5 h-5 mr-2" />}
                  <span className="font-semibold tracking-wide">QC {data.qcStatus}</span>
                </div>
              </div>
              
              <div className="p-6 sm:p-8">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                    <dt className="text-xs font-medium text-purple-200/50 uppercase tracking-widest mb-1">Product</dt>
                    <dd className="text-lg font-medium text-white">{data.productName}</dd>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                    <dt className="text-xs font-medium text-purple-200/50 uppercase tracking-widest mb-1">Manufacturing Date</dt>
                    <dd className="text-lg font-medium text-white">{data.mfgDate}</dd>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                    <dt className="text-xs font-medium text-purple-200/50 uppercase tracking-widest mb-1">Expiry Date</dt>
                    <dd className="text-lg font-medium text-white">{data.expDate}</dd>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                    <dt className="text-xs font-medium text-purple-200/50 uppercase tracking-widest mb-1">Total Sold to Market</dt>
                    <dd className="text-3xl font-light text-white">{data.totalSoldToMarket.toLocaleString()}<span className="text-lg text-gray-400 ml-1">units</span></dd>
                  </div>

                  {/* Raw Materials — col-span-2 so it always fills the remaining row */}
                  <div className="col-span-1 sm:col-span-2 bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                    <dt className="text-xs font-medium text-purple-200/50 uppercase tracking-widest mb-3">Raw Materials Used</dt>
                    <dd className="flex flex-wrap gap-2">
                      {data.rawMaterialsUsed
                        ? data.rawMaterialsUsed.split(',').map((m, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300"
                            >
                              {m.trim()}
                            </span>
                          ))
                        : <span className="text-gray-500 text-sm">No materials recorded</span>
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {!data && !error && !loading && hasSearched === false && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Enter a batch number to retrieve records.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TraceabilityDashboard;
