import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/client';
import { MessageSquare, Send, User, Bot, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Copilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am the PharmaChain Compliance Copilot. I can help you with:\n\n• 📊 Live database queries — inventory, batches, expiry risk, traceability\n• 📋 Compliance rules — FDA regulations, audit procedures\n• 🌐 Medicine information — search the internet for drug side effects, interactions, dosage, and more\n\nAsk me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/ai/ask', { question: userMessage });
      const data = response.data;
      const answer = data?.answer
        || (typeof data === 'string' && data.trim() ? data : null)
        || 'Received an empty response. The AI service may be temporarily unavailable — please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('PharmaChain Copilot', {
          body: 'The AI Copilot has responded to your question.',
        });
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message
        || err?.response?.data?.error
        || err?.message
        || '';
      const detail = serverMsg
        ? `Error: ${serverMsg}`
        : 'Sorry, I encountered an error while processing your request. Please check that the backend is running and try again.';
      setError('Failed to get a response from the Copilot.');
      setMessages(prev => [...prev, { role: 'assistant', content: detail }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="page-header">
          <MessageSquare className="page-header-icon" strokeWidth={1.75} />
          AI Compliance Copilot
        </h1>
        <p className="text-sm text-white/30 mt-1 ml-11">Ask questions about live data, compliance rules, or medicines</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex-shrink-0">
          <GlassCard className="p-4 bg-red-500/5 border-red-500/20 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" strokeWidth={1.75} />
            <p className="text-sm text-red-300/80">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard heavy className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth relative z-10">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg border ${
                    msg.role === 'user' 
                      ? 'bg-indigo-500/50 border-indigo-400/50 text-white ml-4' 
                      : 'bg-indigo-900/50 border-indigo-400/30 text-indigo-200 mr-4'
                  }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  {/* Bubble */}
                  <div className={`px-5 py-4 rounded-2xl shadow-lg backdrop-blur-md border ${
                    msg.role === 'user' 
                      ? 'bg-indigo-500/30 border-indigo-400/25 text-white rounded-tr-sm' 
                      : 'bg-white/[0.06] border-white/[0.08] text-white/90 rounded-tl-sm'
                  }`}>
                    <div className="text-[15px] leading-relaxed prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-th:bg-white/10 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-table:border-collapse prose-table:w-auto prose-table:border prose-table:border-white/20">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex flex-row max-w-[75%]">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 border border-indigo-400/30 text-indigo-200 mr-4 flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] rounded-tl-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input area */}
        <div className="p-4 sm:p-6 bg-black/20 border-t border-white/[0.06] relative z-10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <GlassInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a compliance question or query live data..."
              className="flex-1 bg-white/[0.03] focus:bg-white/[0.06] text-base py-3"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white bg-indigo-500 hover:bg-indigo-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_-4px_rgba(99,102,241,0.6)] flex-shrink-0 border border-indigo-400/40 active:scale-[0.98]"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};

export default Copilot;
