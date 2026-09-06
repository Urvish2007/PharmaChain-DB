import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Thermometer, Activity, AlertTriangle, Send, RefreshCw, Box } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

interface Batch {
  batchNo: number;
  productId: string;
  stockQty: number;
  utQA: string;
}

const IotDashboard = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number>(5.0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/batches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for approved or under-test batches with stock
      const activeBatches = res.data.filter((b: Batch) => b.stockQty > 0 && b.utQA !== 'Q');
      setBatches(activeBatches);
      if (activeBatches.length > 0 && !selectedBatch) {
        setSelectedBatch(activeBatches[0].batchNo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const sendPing = async () => {
    if (!selectedBatch) return;
    
    setSending(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/iot/telemetry/temperature', {
        sensorId: `SENS-${selectedBatch}-X1`,
        batchNo: selectedBatch,
        temperatureCelsius: temperature
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const isViolation = temperature < 2.0 || temperature > 8.0;
      
      setFeedback({
        type: isViolation ? 'error' : 'success',
        message: isViolation 
          ? `COLD CHAIN VIOLATION: ${temperature}°C is outside bounds. Automated quarantine initiated!` 
          : `Sensor ping successful. ${temperature}°C is within safe limits (2.0°C - 8.0°C).`
      });
      
      if (isViolation) {
        // Refresh batches after a slight delay to let the async quarantine finish
        setTimeout(fetchBatches, 1500);
      }
      
    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send IoT ping'
      });
    } finally {
      setSending(false);
    }
  };

  const getTempColor = (temp: number) => {
    if (temp < 2.0) return 'text-blue-500';
    if (temp > 8.0) return 'text-red-500';
    return 'text-emerald-500';
  };

  const getBgTempColor = (temp: number) => {
    if (temp < 2.0) return 'bg-blue-500';
    if (temp > 8.0) return 'bg-red-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="h-6 w-6 text-indigo-500" />
          IoT Cold-Chain Simulator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Simulate real-time temperature sensors attached to physical medicine batches. 
          Event-driven architecture will automatically quarantine batches if they fall outside the 2.0°C - 8.0°C range.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Box className="h-5 w-5 text-gray-400" />
            1. Select Monitored Batch
          </h2>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {batches.map(batch => (
                <div 
                  key={batch.batchNo}
                  onClick={() => setSelectedBatch(batch.batchNo)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedBatch === batch.batchNo 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Batch #{batch.batchNo}</p>
                      <p className="text-sm text-gray-500">Product: {batch.productId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{batch.stockQty} units</p>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {batch.utQA === 'A' ? 'Approved' : 'Under Test'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {batches.length === 0 && (
                <div className="text-center p-6 text-gray-500 border border-dashed rounded-xl border-gray-300 dark:border-gray-700">
                  No active batches with stock available to monitor.
                </div>
              )}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Thermometer className="h-5 w-5 text-gray-400" />
            2. Inject Sensor Reading
          </h2>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div 
              className={`text-6xl font-bold tracking-tighter ${getTempColor(temperature)} mb-8 transition-colors duration-300`}
            >
              {temperature.toFixed(1)}°C
            </motion.div>
            
            <div className="w-full max-w-xs space-y-6">
              <input 
                type="range" 
                min="-5" 
                max="15" 
                step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              
              <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                <span>-5°C</span>
                <span>Safe (2-8°C)</span>
                <span>15°C</span>
              </div>
              
              <button
                onClick={sendPing}
                disabled={!selectedBatch || sending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium shadow-lg transition-all ${getBgTempColor(temperature)} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {sending ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Transmit IoT Ping
                  </>
                )}
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            feedback.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400'
          }`}
        >
          <AlertTriangle className={`h-5 w-5 shrink-0 ${feedback.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`} />
          <div>
            <p className="font-semibold">{feedback.type === 'error' ? 'Anomaly Detected' : 'All Clear'}</p>
            <p className="text-sm mt-0.5">{feedback.message}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IotDashboard;
