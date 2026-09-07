import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Package, Calendar, Beaker, ShieldCheck } from 'lucide-react';
import api from '../api/client';

interface TrackingResponse {
  serialNo: string;
  authenticityStatus: string;
  batchNo: number;
  productName: string;
  mfgDate: string;
  expDate: string;
  qcStatus: string;
}

const PublicTracking: React.FC = () => {
  const [serialNo, setSerialNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNo.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.get(`/public/tracking/${serialNo}`);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not verify serial number. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center pt-20 px-4">
      {/* Header */}
      <div className="text-center max-w-2xl w-full mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent mb-4">
          Medicine Authenticity Check
        </h1>
        <p className="text-slate-400 text-lg">
          Enter the unique 36-character serial number found on your medicine packaging to verify its authenticity, safety, and quality control status.
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl mb-10">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              placeholder="Enter Serial Number (e.g., 550e8400-e29b-41d4-a716-446655440000)"
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !serialNo}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Results State */}
      {result && (
        <div className="w-full max-w-2xl animate-fade-in-up">
          <div className={`p-1 mb-6 rounded-2xl bg-gradient-to-r ${
            result.authenticityStatus === 'Authentic' 
              ? 'from-emerald-500 to-teal-500' 
              : 'from-red-500 to-rose-500'
          }`}>
            <div className="bg-slate-900 rounded-xl p-8 flex flex-col items-center text-center">
              {result.authenticityStatus === 'Authentic' ? (
                <>
                  <ShieldCheck className="h-20 w-20 text-emerald-400 mb-4" />
                  <h2 className="text-3xl font-bold text-emerald-400 mb-2">Authentic Medicine</h2>
                  <p className="text-slate-300">This product is verified and safe for consumption.</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-20 w-20 text-red-400 mb-4" />
                  <h2 className="text-3xl font-bold text-red-400 mb-2">Warning: {result.authenticityStatus}</h2>
                  <p className="text-slate-300">Do not consume this product. Please return it to the point of purchase.</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Product</p>
                <p className="text-lg font-semibold text-white">{result.productName}</p>
                <p className="text-sm text-slate-500 mt-1">Batch No: {result.batchNo}</p>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Lifespan</p>
                <p className="text-white"><span className="text-slate-400 mr-2">Mfg:</span> {result.mfgDate}</p>
                <p className="text-white"><span className="text-slate-400 mr-2">Exp:</span> {result.expDate}</p>
              </div>
            </div>

            <div className={`col-span-1 md:col-span-2 bg-slate-800/50 backdrop-blur-sm border p-6 rounded-xl flex items-center justify-between ${
              result.qcStatus === 'PASSED' ? 'border-emerald-500/30' : 'border-slate-700'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${result.qcStatus === 'PASSED' ? 'bg-emerald-500/10' : 'bg-slate-700'}`}>
                  <Beaker className={`h-6 w-6 ${result.qcStatus === 'PASSED' ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Quality Control (QC) Status</p>
                  <p className="text-lg font-semibold text-white">{result.qcStatus || 'Unknown'}</p>
                </div>
              </div>
              {result.qcStatus === 'PASSED' && (
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTracking;
