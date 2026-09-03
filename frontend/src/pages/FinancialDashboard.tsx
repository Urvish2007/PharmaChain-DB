import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { AlertCircle, RefreshCw, DollarSign, Wallet } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white flex items-center tracking-tight">
          <DollarSign className="mr-3 h-8 w-8 text-emerald-400" />
          Financial Ledger
        </h1>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Purchases (Buy)', value: totalBuy, color: 'text-red-400' },
          { label: 'Total Sales (Sell)', value: totalSell, color: 'text-green-400' },
          { label: 'Net Balance', value: netBalance, color: netBalance >= 0 ? 'text-emerald-300' : 'text-red-300' },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>
              ${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </GlassCard>
        ))}
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
          <div className="p-12 flex flex-col items-center justify-center text-emerald-200/50">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p>Loading financial records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-widest text-emerald-200/60">
                  <th className="px-6 py-4 font-medium">Invoice No</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Account No</th>
                  <th className="px-6 py-4 font-medium text-right">Value</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <Wallet className="h-12 w-12 mx-auto text-white/10 mb-3" />
                      <p className="text-lg font-medium text-gray-300">No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  data.map((tx, idx) => (
                    <motion.tr
                      key={tx.invoiceNo}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-white group-hover:text-emerald-200 transition-colors">
                          INV-{tx.invoiceNo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400 font-mono">{tx.transactionDate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          tx.transactionType.toLowerCase() === 'buy'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {tx.transactionType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-emerald-300/80 font-mono">{tx.accountNo}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-200">
                          {tx.currency} {tx.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${tx.paidReceived ? 'text-emerald-400' : 'text-yellow-400'}`}>
                          {tx.paidReceived ? 'Settled' : 'Pending'}
                        </span>
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

export default FinancialDashboard;
