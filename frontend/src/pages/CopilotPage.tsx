import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { CopilotResponse } from '../types';
import { Bot, Send, Upload, FileText, Sparkles, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; data?: CopilotResponse }>>([
    {
      role: 'assistant',
      text: "Hello, Sarah. I am your **SupplyMind RAG Copilot**. I answer grounded queries directly from live supplier telemetry, ML SHAP drivers, and indexed contract documents.\n\nTry one of the canonical queries below or type a custom question."
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadDocs = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await api.queryCopilot(text);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer,
          data: res
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I encountered an error retrieving data from the vector store. Please verify backend connection."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await api.uploadDocument(file, 'Contract');
      await loadDocs();
    } catch (err) {
      console.error("Failed to upload document", err);
    } finally {
      setUploading(false);
    }
  };

  const canonicalQueries = [
    "Which suppliers are high risk?",
    "Why is Aether Semiconductor risky?",
    "What happens if Aether Semiconductor fails?",
    "Find alternatives for Aether Semiconductor",
    "Compare top suppliers",
    "Generate an executive risk report"
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span>AI Procurement Copilot & RAG System</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Grounded vector search & document Q&A backed by FAISS vector store
          </p>
        </div>
        <span className="px-2.5 py-1 rounded text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          FAISS CPU INDEX ACTIVE
        </span>
      </div>

      {/* Suggested Canonical Queries Chips */}
      <div className="glass-panel p-3 rounded-lg flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0 font-bold">Suggested:</span>
        {canonicalQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 border border-slate-800 transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Canvas */}
        <div className="glass-panel p-4 rounded-lg lg:col-span-3 flex flex-col h-[580px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-lg p-4 text-xs font-sans space-y-3 ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white font-mono'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.text}
                  </div>

                  {/* Sources & Citations Box */}
                  {m.data?.sources && m.data.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Grounded Source Citations ({m.data.sources.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 font-mono text-[11px]">
                        {m.data.sources.map((s, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 space-y-0.5">
                            <div className="font-semibold text-slate-100 flex items-center justify-between">
                              <span>{s.title}</span>
                              <span className="text-[9px] text-slate-500">{s.type}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans">{s.snippet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Followup Suggestions */}
                  {m.data?.suggested_followups && (
                    <div className="pt-2 flex flex-wrap gap-1.5 font-mono">
                      {m.data.suggested_followups.map((f, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(f)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
                        >
                          → {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 py-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Searching vector embeddings & DB state...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-3 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot any supply chain risk question..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Knowledge Base Document Drawer */}
        <div className="glass-panel p-4 rounded-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white uppercase font-mono">Indexed Documents</h3>
              <label className="cursor-pointer px-2.5 py-1 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.txt" />
              </label>
            </div>

            <div className="space-y-2 font-mono text-xs overflow-y-auto max-h-[460px]">
              {documents.map((d) => (
                <div key={d.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-indigo-300 font-semibold">
                    <span className="truncate">{d.title}</span>
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{d.doc_type}</span>
                    <span>{(d.file_size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-500">
            <span>Vector Index: </span>
            <strong className="text-emerald-400">FAISS All-MiniLM-L6-v2</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
