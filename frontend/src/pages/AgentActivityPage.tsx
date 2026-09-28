import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AgentLogItem } from '../types';
import { Activity, RefreshCw, Cpu, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export const AgentActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AgentLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AgentLogItem | null>(null);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 4000); // Polling for live activity stream
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.getAgentActivity(50);
      setLogs(data);
      if (!selectedLog && data.length > 0) {
        setSelectedLog(data[0]);
      }
    } catch (err) {
      console.error("Failed to load agent activity", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>Multi-Agent Activity & Reasoning Stream</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time audit log of timestamped agent actions and multi-agent orchestration steps
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Stream</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Timeline Column */}
        <div className="glass-panel p-5 rounded-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Live Execution Event Stream</h3>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ORCHESTRATOR ONLINE</span>
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs overflow-y-auto max-h-[560px]">
            {logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-indigo-300 font-mono">{log.agent_name}</span>
                    <span className="text-[10px] text-slate-500">
                      {log.timestamp.substring(11, 19)} UTC • {log.execution_time_ms.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 font-sans">{log.action}</div>
                  <p className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-0.5">{log.reasoning}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspect Log Details Drawer */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold text-white">Agent Step Reasoning Inspector</h3>

          {selectedLog ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400">{selectedLog.agent_name}</span>
                <div className="font-bold text-white font-sans text-sm">{selectedLog.action}</div>
                <div className="text-[10px] text-slate-400">
                  Execution Time: <strong className="text-slate-200">{selectedLog.execution_time_ms} ms</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 font-semibold">Bounded Agent Reasoning:</div>
                <p className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-300 font-sans leading-relaxed text-xs">
                  {selectedLog.reasoning}
                </p>
              </div>

              {selectedLog.output_data && (
                <div className="space-y-1">
                  <div className="text-slate-400 font-semibold">Structured Output Payload:</div>
                  <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-[220px]">
                    {JSON.stringify(selectedLog.output_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 py-12 text-center">
              Select any event step from the stream to inspect full reasoning payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
