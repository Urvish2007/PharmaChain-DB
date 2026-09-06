import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { AlertCircle, RefreshCw, DollarSign, Wallet } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { motion } from 'framer-motion';

interface Transaction {
  invoiceNo: number;
  transactionDate: string;
  currency: string;
  transactionType: string;
  paidReceived: boolean;
  accountNo: string;
  totalValue: number;
}

const FinancialDashboard: React.FC = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Transaction[]>('/transactions');
      setData(res.data);
      setError('');
    } catch {
      setError('Failed to load financial transactions. Ensure backend is restarted with new endpoints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalBuy = data.filter(t => t.transactionType.toLowerCase() === 'buy').reduce((s, t) => s + t.totalValue, 0);
  const totalSell = data.filter(t => t.transactionType.toLowerCase() === 'sell').reduce((s, t) => s + t.totalValue, 0);
  const netBalance = totalSell - totalBuy;

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
            <DollarSign className="page-header-icon" strokeWidth={1.75} />
            Financial Ledger
          </h1>
          <p className="text-sm text-white/30 mt-1 ml-11">Revenue, expenses, and transaction history</p>
        </div>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} size="sm">
          Refresh
        </GlassButton>
      </div>

      {/* Stats */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GlassCard className="stat-card">
            <p className="stat-label">Total Purchases (Buy)</p>
            <p className="stat-value text-red-400">${totalBuy.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">Total Sales (Sell)</p>
            <p className="stat-value text-emerald-400">${totalSell.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">Net Balance</p>
            <p className={`stat-value ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
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
          <SkeletonLoader rows={10} columns={6} />
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Account No</th>
                    <th className="text-right">Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <Wallet className="h-10 w-10 mx-auto text-white/10 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-white/40">No Transactions Found</p>
                        <p className="text-xs mt-1 text-white/20">Financial records will appear here once transactions are logged.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((tx, idx) => (
                      <motion.tr
                        key={tx.invoiceNo}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <td>
                          <span className="font-mono text-sm font-medium text-white/80">INV-{tx.invoiceNo}</span>
                        </td>
                        <td>
                          <span className="text-sm text-white/35 font-mono tabular-nums">{tx.transactionDate}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            tx.transactionType.toLowerCase() === 'buy'
                              ? 'badge-danger'
                              : 'badge-success'
                          }`}>
                            {tx.transactionType.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-indigo-300/60 font-mono">{tx.accountNo}</span>
                        </td>
                        <td className="text-right">
                          <span className="text-sm font-medium text-white/60 tabular-nums">
                            {tx.currency} {tx.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${tx.paidReceived ? 'badge-success' : 'badge-warning'}`}>
                            {tx.paidReceived ? 'Settled' : 'Pending'}
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

export default FinancialDashboard;
