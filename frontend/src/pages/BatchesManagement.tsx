import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Archive, AlertCircle, RefreshCw, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import BatchFormModal, { BatchFormData } from '../components/ui/BatchFormModal';
import ESignatureModal, { SignatureConfig } from '../components/ui/ESignatureModal';

interface Batch {
  batchNo: number;
  batchSize: number;
  mfgDate: string;
  expDate: string;
  productId: string;
  stockQty: number;
  utQA: string;
  yieldPercentage: number | null;
}

const BatchesManagement: React.FC = () => {
  const [data, setData] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBatch, setSelectedBatch] = useState<BatchFormData | null>(null);
  
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [sigConfig, setSigConfig] = useState<SignatureConfig | null>(null);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'PRODUCTION_SUPERVISOR';
  const canDelete = user?.role === 'ADMIN';
  const canRelease = user?.role === 'ADMIN' || user?.role === 'QUALITY_ASSURANCE';

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get<Batch[]>('/batches');
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch batches data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedBatch(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (batch: Batch) => {
    setModalMode('edit');
    setSelectedBatch({
      batchNo: batch.batchNo,
      productId: batch.productId,
      batchSize: batch.batchSize,
      stockQty: batch.stockQty,
      mfgDate: batch.mfgDate,
      expDate: batch.expDate
    });
    setIsModalOpen(true);
  };

  const handleQAReleaseClick = (batchNo: number) => {
    setSigConfig({
      entityId: batchNo.toString(),
      entityName: 'Batch',
      action: 'QA Release'
    });
    setIsSigModalOpen(true);
  };

  const handleSignatureSuccess = async () => {
    setIsSigModalOpen(false);
    if (sigConfig?.action === 'QA Release') {
      try {
        await api.post(`/batches/${sigConfig.entityId}/qa-release`);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to release batch.');
      }
    }
  };

  const handleDeleteClick = async (batchNo: number) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await api.delete(`/batches/${batchNo}`);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete batch.');
      }
    }
  };

  const handleModalSubmit = async (formData: BatchFormData) => {
    try {
      if (modalMode === 'add') {
        await api.post('/batches', formData);
      } else {
        await api.put(`/batches/${formData.batchNo}`, formData);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save batch.');
      throw err;
    }
  };

  const ITEMS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">
            <Archive className="page-header-icon" strokeWidth={1.75} />
            Batches Management
          </h1>
          <p className="text-sm text-white/30 mt-1 ml-11">Create, edit, and manage production batches</p>
        </div>
        <div className="flex gap-3">
          <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} size="sm">
            Refresh
          </GlassButton>
          {canEdit && (
            <GlassButton
              onClick={handleAddClick}
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
              size="sm"
            >
              Add Batch
            </GlassButton>
          )}
        </div>
      </div>

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
          <SkeletonLoader rows={10} columns={7} />
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
                    <th>Mfg Date</th>
                    <th>Exp Date</th>
                    <th>QA Status</th>
                    {(canEdit || canDelete || canRelease) && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <Archive className="h-10 w-10 mx-auto text-white/10 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-white/40">No Batches Found</p>
                        <p className="text-xs mt-1 text-white/20">Production batches will appear here once created.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        key={item.batchNo}
                      >
                        <td>
                          <span className="font-mono text-sm font-medium text-white/80">{item.batchNo}</span>
                        </td>
                        <td>
                          <span className="text-sm text-indigo-300/60 font-mono">{item.productId}</span>
                        </td>
                        <td className="text-right">
                          <span className="text-sm text-white/50 font-medium tabular-nums">{item.batchSize.toLocaleString()}</span>
                        </td>
                        <td className="text-right">
                          <span className={`text-sm font-medium tabular-nums ${item.stockQty === 0 ? 'text-white/20' : 'text-white/60'}`}>{item.stockQty.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="text-sm text-white/35 font-mono tabular-nums">{item.mfgDate}</span>
                        </td>
                        <td>
                          <span className="text-sm text-white/35 font-mono tabular-nums">{item.expDate}</span>
                        </td>
                        <td>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            item.utQA === 'A' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.utQA === 'UT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            item.utQA === 'Q' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {item.utQA === 'A' ? 'Approved' : item.utQA === 'UT' ? 'Under Test' : item.utQA === 'Q' ? 'Quarantined' : item.utQA}
                          </span>
                        </td>
                        {(canEdit || canDelete || canRelease) && (
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canRelease && item.utQA === 'UT' && (
                                <button 
                                  onClick={() => handleQAReleaseClick(item.batchNo)}
                                  title="Approve QA Release (Requires E-Signature)"
                                  className="p-2 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                              )}
                              {canEdit && (
                                <button 
                                  onClick={() => handleEditClick(item)}
                                  className="p-2 text-white/25 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                              )}
                              {canDelete && (
                                <button 
                                  onClick={() => handleDeleteClick(item.batchNo)}
                                  className="p-2 text-white/25 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))
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

      <BatchFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        initialData={selectedBatch}
      />

      <ESignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSuccess={handleSignatureSuccess}
        config={sigConfig}
      />
    </div>
  );
};

export default BatchesManagement;
