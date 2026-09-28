import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RecommendationItem, AuditLogItem } from '../types';
import { CheckSquare, Check, X, ShieldCheck, DollarSign, ArrowDownRight, Clock, UserCheck, Lock } from 'lucide-react';

export const ActionCenterPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [decisionNotes, setDecisionNotes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const recs = await api.getRecommendations(statusFilter);
      const logs = await api.getAuditLog();
      setRecommendations(recs);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Failed to load Action Center data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (recommendationId: number, actionTaken: 'Approved' | 'Rejected') => {
    try {
      const notes = decisionNotes[recommendationId] || '';
      await api.postDecision(recommendationId, actionTaken, notes);
      await loadData();
    } catch (err) {
      console.error("Decision recording failed", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Human-in-the-Loop Action Center</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Mandatory human review queue for high-impact mitigation recommendations (Strict Governance Mode)
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Auto-Execution Disabled</span>
          </span>
        </div>
      </div>

      {/* Recommendations Pending Review Queue */}
      <div className="glass-panel p-5 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Pending High-Impact Mitigation Proposals</h3>
          <div className="flex items-center gap-2 font-mono text-xs">
            {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === s ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            Loading governance action queue...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            No recommendations match status filter '{statusFilter}'.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {rec.action_type}
                    </span>
                    <span className="font-semibold text-white font-sans text-sm">{rec.title}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-slate-400">Target: <strong className="text-indigo-300">{rec.supplier_name}</strong></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      rec.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {rec.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec.description}</p>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs bg-slate-950 p-3 rounded border border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Estimated Risk Reduction</span>
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>-{rec.estimated_risk_reduction_pct}% Risk</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Action Implementation Cost</span>
                    <div className="font-bold text-slate-200">${(rec.cost_usd / 1000).toFixed(0)}k USD</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Feasibility Rating</span>
                    <div className="font-bold text-cyan-300">{rec.feasibility_score}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Agent Confidence</span>
                    <div className="font-bold text-indigo-300">{(rec.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>

                {/* Decision Actions (If Pending) */}
                {rec.status === 'Pending' && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Add reviewer notes / decision rationale (optional)..."
                      value={decisionNotes[rec.id] || ''}
                      onChange={(e) => setDecisionNotes({ ...decisionNotes, [rec.id]: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDecision(rec.id, 'Approved')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Action</span>
                      </button>
                      <button
                        onClick={() => handleDecision(rec.id, 'Rejected')}
                        className="px-4 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded text-xs font-mono font-bold transition-colors flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Audit Log Table */}
      <div className="glass-panel p-5 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-white">Immutable Decision Audit Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Details & Notes</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-slate-400">{log.timestamp.substring(0, 19).replace('T', ' ')}</td>
                  <td className="py-3 px-4 text-indigo-300 font-semibold">{log.user_name}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{log.action_type}</td>
                  <td className="py-3 px-4 text-slate-200 font-sans">{log.details}</td>
                  <td className="py-3 px-4 text-slate-500">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
