import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from './GlassButton';

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

  const inputClass = "w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all duration-200 placeholder:text-white/25 disabled:opacity-40";
  const labelClass = "block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-lg glass-panel-heavy rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-semibold text-white">
                {mode === 'add' ? 'Add New Batch' : 'Edit Batch'}
              </h2>
              <p className="text-[11px] text-white/30 mt-0.5">
                {mode === 'add' ? 'Create a new production batch' : `Editing batch #${formData.batchNo}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Batch Number</label>
                <input
                  type="number"
                  name="batchNo"
                  required
                  disabled={mode === 'edit'}
                  value={formData.batchNo || ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Product ID</label>
                <input
                  type="text"
                  name="productId"
                  required
                  value={formData.productId}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Batch Size</label>
                <input
                  type="number"
                  name="batchSize"
                  required
                  step="0.01"
                  value={formData.batchSize || ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Stock Qty</label>
                <input
                  type="number"
                  name="stockQty"
                  required
                  step="0.01"
                  value={formData.stockQty || ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Manufacturing Date</label>
                <input
                  type="date"
                  name="mfgDate"
                  required
                  value={formData.mfgDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Expiry Date</label>
                <input
                  type="date"
                  name="expDate"
                  required
                  value={formData.expDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end gap-3">
              <GlassButton
                type="button"
                onClick={onClose}
                disabled={loading}
                size="sm"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                isLoading={loading}
                size="sm"
              >
                {loading ? 'Saving...' : mode === 'add' ? 'Create Batch' : 'Save Changes'}
              </GlassButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BatchFormModal;
