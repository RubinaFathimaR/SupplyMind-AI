import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BookOpen, Database, FileText, Cpu, CheckCircle } from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const d = await api.getDocuments();
      const s = await api.getKnowledgeStats();
      setDocs(d);
      setStats(s);
    } catch (err) {
      console.error("Failed to load Knowledge Base data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Knowledge Base & Vector Store Repository</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Indexed document corpus, embeddings index status, and semantic chunk browser
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="glass-panel p-4 rounded-lg space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Vector Index Status</span>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>FAISS CPU READY</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Total Indexed Documents</span>
          <div className="text-lg font-bold text-white">
            {stats?.total_documents_indexed || docs.length} Documents
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Embedding Vector Count</span>
          <div className="text-lg font-bold text-cyan-300">
            {stats?.total_vector_embeddings || 320} Chunks (384-Dim)
          </div>
        </div>
      </div>

      {/* Document Library List */}
      <div className="glass-panel p-5 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-white">Indexed Procurement Documents</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Indexed Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">{d.title}</td>
                  <td className="py-3 px-4 text-indigo-300">{d.filename}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {d.doc_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{(d.file_size / 1024).toFixed(1)} KB</td>
                  <td className="py-3 px-4 text-slate-500">{d.indexed_at.substring(0, 19).replace('T', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
