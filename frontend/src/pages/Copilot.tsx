import React, { useState, useRef, useEffect } from 'react';
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
    { role: 'assistant', content: 'Hello! I am the PharmaChain Compliance Copilot. Ask me about compliance rules or query live data.' }
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
      const answer = response.data.answer || (typeof response.data === 'string' ? response.data : 'Received empty response');
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err: any) {
      setError('Failed to connect to the Copilot.');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200 flex items-center mb-6 tracking-tight flex-shrink-0">
        <MessageSquare className="mr-3 h-8 w-8 text-blue-400" /> 
        AI Compliance Copilot
      </h1>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex-shrink-0">
          <GlassCard className="p-4 bg-red-500/10 border-red-500/30 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard heavy className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
        
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
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg border ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/50 border-blue-400/50 text-white ml-4' 
                      : 'bg-indigo-900/50 border-indigo-400/50 text-indigo-200 mr-4'
                  }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`px-5 py-4 rounded-2xl shadow-lg backdrop-blur-md border ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/40 border-blue-500/30 text-white rounded-tr-sm' 
                      : 'bg-white/10 border-white/10 text-gray-100 rounded-tl-sm'
                  }`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex flex-row max-w-[75%]">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 border border-indigo-400/50 text-indigo-200 mr-4 flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center space-x-2">
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

        <div className="p-4 sm:p-6 bg-black/30 border-t border-white/10 relative z-10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <GlassInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a compliance question or query live data..."
              className="flex-1 bg-white/5 focus:bg-white/10 text-base py-3"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] flex-shrink-0 border border-blue-400/50"
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
