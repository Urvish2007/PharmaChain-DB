import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Archive, AlertCircle, RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import BatchFormModal, { BatchFormData } from '../components/ui/BatchFormModal';

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

  const canEdit = user?.role === 'ADMIN' || user?.role === 'PRODUCTION_SUPERVISOR';
  const canDelete = user?.role === 'ADMIN';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white flex items-center tracking-tight">
          <Archive className="mr-3 h-8 w-8 text-blue-400" /> 
          Batches Management
        </h1>
        <div className="flex space-x-3">
          <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </GlassButton>
          {canEdit && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </button>
          )}
        </div>
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
            <p>Loading batches data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-widest text-blue-200/70">
                  <th className="px-6 py-4 font-medium">Batch No</th>
                  <th className="px-6 py-4 font-medium">Product ID</th>
                  <th className="px-6 py-4 font-medium text-right">Batch Size</th>
                  <th className="px-6 py-4 font-medium text-right">Stock Qty</th>
                  <th className="px-6 py-4 font-medium">Mfg Date</th>
                  <th className="px-6 py-4 font-medium">Exp Date</th>
                  {(canEdit || canDelete) && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <Archive className="h-12 w-12 mx-auto text-white/10 mb-3" />
                      <p className="text-lg font-medium text-gray-300">No Batches Found</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.batchNo}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">{item.batchNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">{item.productId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-300 font-medium">{item.batchSize}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-300">{item.stockQty}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">{item.mfgDate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">{item.expDate}</span>
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canEdit && (
                              <button 
                                onClick={() => handleEditClick(item)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => handleDeleteClick(item.batchNo)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
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
        )}
      </GlassCard>

      <BatchFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        initialData={selectedBatch}
      />
    </div>
  );
};

export default BatchesManagement;
