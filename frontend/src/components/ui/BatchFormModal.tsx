import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BatchFormData {
  batchNo: number;
  productId: string;
  batchSize: number;
  stockQty: number;
  mfgDate: string;
  expDate: string;
}

interface BatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BatchFormData) => Promise<void>;
  initialData?: BatchFormData | null;
  mode: 'add' | 'edit';
}

const BatchFormModal: React.FC<BatchFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState<BatchFormData>({
    batchNo: 0,
    productId: '',
    batchSize: 0,
    stockQty: 0,
    mfgDate: '',
    expDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      setFormData({
        batchNo: 0,
        productId: '',
        batchSize: 0,
        stockQty: 0,
        mfgDate: '',
        expDate: ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Error handling is managed by parent
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'batchNo' || name === 'batchSize' || name === 'stockQty' ? Number(value) : value
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-bold text-white">
              {mode === 'add' ? 'Add New Batch' : 'Edit Batch'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Batch Number</label>
                <input
                  type="number"
                  name="batchNo"
                  required
                  disabled={mode === 'edit'}
                  value={formData.batchNo || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Product ID</label>
                <input
                  type="text"
                  name="productId"
                  required
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Batch Size</label>
                <input
                  type="number"
                  name="batchSize"
                  required
                  step="0.01"
                  value={formData.batchSize || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Stock Qty</label>
                <input
                  type="number"
                  name="stockQty"
                  required
                  step="0.01"
                  value={formData.stockQty || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Mfg Date</label>
                <input
                  type="date"
                  name="mfgDate"
                  required
                  value={formData.mfgDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Expiry Date</label>
                <input
                  type="date"
                  name="expDate"
                  required
                  value={formData.expDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Batch'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BatchFormModal;
