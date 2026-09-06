import React, { useState } from 'react';
import api from '../api/client';
import { BatchTraceability } from '../types';
import { Search, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
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
      <div>
        <h1 className="page-header">
          <Search className="page-header-icon" strokeWidth={1.75} />
          Batch Traceability
        </h1>
        <p className="text-sm text-white/30 mt-1 ml-11">Full lifecycle and QC lookup</p>
      </div>

      <GlassCard className="p-6">
        <div className="max-w-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <GlassInput
                id="batchNo"
                name="batchNo"
                type="text"
                placeholder="Enter batch number (e.g. B-001)"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
                className="w-full"
              />
            </div>
            <GlassButton
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={!batchNo.trim()}
              className="sm:w-28 h-[42px]"
              size="sm"
            >
              Search
            </GlassButton>
          </form>
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GlassCard className="p-4 bg-red-500/5 border-red-500/20 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" strokeWidth={1.75} />
              <p className="text-sm text-red-300/80">{error}</p>
            </GlassCard>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="overflow-hidden">
              <SkeletonLoader variant="cards" />
            </GlassCard>
          </motion.div>
        )}

        {data && (
          <motion.div key="data" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <GlassCard heavy className="overflow-hidden">
              {/* Report Header */}
              <div className="px-6 py-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Traceability Report</h3>
                  <p className="text-xs text-white/30 mt-0.5">Batch <span className="font-mono text-white/50">{data.batchNo}</span></p>
                </div>
                <span className={`badge ${
                  data.qcStatus === 'PASSED' ? 'badge-success' :
                  data.qcStatus === 'FAILED' ? 'badge-danger' : 'badge-warning'
                } text-xs px-3 py-1.5`}>
                  {data.qcStatus === 'PASSED' && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                  {data.qcStatus === 'FAILED' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                  QC {data.qcStatus}
                </span>
              </div>
              
              {/* Data Grid */}
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Product', value: data.productName },
                    { label: 'Manufacturing Date', value: data.mfgDate },
                    { label: 'Expiry Date', value: data.expDate },
                  ].map((field) => (
                    <div key={field.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <dt className="stat-label">{field.label}</dt>
                      <dd className="text-base font-medium text-white/90">{field.value}</dd>
                    </div>
                  ))}

                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                    <dt className="stat-label">Total Sold to Market</dt>
                    <dd className="text-2xl font-bold text-white/90 tabular-nums">
                      {data.totalSoldToMarket.toLocaleString()}
                      <span className="text-sm font-normal text-white/30 ml-1">units</span>
                    </dd>
                  </div>

                  <div className="col-span-1 sm:col-span-2 bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                    <dt className="stat-label mb-3">Raw Materials Used</dt>
                    <dd className="flex flex-wrap gap-2">
                      {data.rawMaterialsUsed
                        ? data.rawMaterialsUsed.split(',').map((m, i) => (
                            <span key={i} className="badge badge-accent">
                              {m.trim()}
                            </span>
                          ))
                        : <span className="text-xs text-white/20">No materials recorded</span>
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {!data && !error && !loading && hasSearched === false && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto mb-3 text-white/8" strokeWidth={1.25} />
            <p className="text-sm text-white/25">Enter a batch number to retrieve traceability records.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TraceabilityDashboard;
