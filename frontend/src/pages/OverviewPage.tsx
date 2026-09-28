import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import {
  Users, AlertTriangle, ShieldCheck, DollarSign, Activity,
  ArrowUpRight, Sparkles, ChevronRight, BarChart2, GitFork
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface OverviewPageProps {
  onNavigate: (page: string, supplierId?: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getOverview();
      setData(res);
    } catch (err) {
      console.error("Failed to load overview data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Aggregating Multi-Agent Supply Chain Telemetry...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const distributionData = [
    { name: 'Low', value: data?.risk_distribution?.Low || 0, color: '#10b981' },
    { name: 'Medium', value: data?.risk_distribution?.Medium || 0, color: '#f59e0b' },
    { name: 'High', value: data?.risk_distribution?.High || 0, color: '#f97316' },
    { name: 'Critical', value: data?.risk_distribution?.Critical || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Dynamic AI Situation Brief */}
      <div className="glass-panel p-5 rounded-lg border-indigo-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shrink-0 mt-0.5">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-400">
                AI Executive Situation Brief
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AUTO-COMPUTED LIVE
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {data?.situation_brief?.replace(/\*\*/g, '')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('copilot')}
            className="px-3 py-1.5 rounded text-xs font-medium font-mono bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Ask Copilot</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Suppliers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {kpis.total_suppliers || 300}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span>100% Monitored</span> • <span>Tier 1-3 Coverage</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg space-y-2 border-rose-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>High & Critical Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 flex items-baseline gap-2">
            {kpis.high_risk_count || 0}
            <span className="text-xs font-normal text-slate-400 font-sans">
              ({kpis.critical_risk_count || 0} Critical)
            </span>
          </div>
          <div className="text-[11px] font-mono text-rose-300 flex items-center gap-1">
            <span>Action Required</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Critical Single-Sources</span>
            <GitFork className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {kpis.critical_dependencies || 4}
          </div>
          <div className="text-[11px] font-mono text-amber-300">
            Digital Twin Bottlenecks
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>High-Risk Contract Exposure</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            ${((kpis.total_exposure_usd || 0) / 1_000_000).toFixed(1)}M USD
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            At-Risk Portfolio Value
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Over Time */}
        <div className="glass-panel p-5 rounded-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Portfolio Risk Score Trend</h3>
              <p className="text-xs text-slate-400 font-mono">Weighted composite risk index (Last 6 Months)</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              6M TELEMETRY
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend_history || []}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px' }}
                  itemStyle={{ color: '#f1f5f9', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="avg_risk" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="Avg Risk Score (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Category Distribution */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Risk Category Breakdown</h3>
            <p className="text-xs text-slate-400 font-mono">Supplier count by classification</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px' }}
                  itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {distributionData.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300">{d.name}</span>
                </div>
                <span className="font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority High-Risk Watchlist Table */}
      <div className="glass-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Priority High-Risk Supplier Watchlist</h3>
            <p className="text-xs text-slate-400 font-mono">Top suppliers requiring operational investigation</p>
          </div>
          <button
            onClick={() => onNavigate('suppliers')}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Suppliers ({kpis.total_suppliers})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Contract Value</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(data?.top_risky_suppliers || []).map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-indigo-300">{s.code}</td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">{s.name}</td>
                  <td className="py-3 px-4 text-slate-400">{s.category}</td>
                  <td className="py-3 px-4 text-slate-300">{s.country}</td>
                  <td className="py-3 px-4 text-slate-200">${(s.contract_value / 1_000_000).toFixed(2)}M</td>
                  <td className="py-3 px-4">
                    <RiskBadge category={s.risk_category} score={s.overall_risk_score} showScore />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate('suppliers', s.id)}
                      className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
