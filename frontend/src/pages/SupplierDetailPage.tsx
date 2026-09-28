import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SupplierDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import {
  ArrowLeft, Activity, ShieldAlert, Cpu, DollarSign, Clock,
  Play, Sparkles, AlertCircle, FileText, CheckCircle, ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface SupplierDetailPageProps {
  supplierId: number;
  onBack: () => void;
  onSimulateDisruption: (supplierId: number) => void;
}

export const SupplierDetailPage: React.FC<SupplierDetailPageProps> = ({
  supplierId, onBack, onSimulateDisruption
}) => {
  const [data, setData] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [supplierId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getSupplierDetail(supplierId);
      setData(res);
    } catch (err) {
      console.error("Failed to load supplier detail", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunInvestigation = async () => {
    try {
      setInvestigating(true);
      await api.runInvestigation(supplierId);
      await loadDetail();
    } catch (err) {
      console.error("Investigation failed", err);
    } finally {
      setInvestigating(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Fetching SHAP Model Explainability Telemetry...</span>
        </div>
      </div>
    );
  }

  // Dimension Radar Data
  const radarData = [
    { subject: 'Financial', score: data.radar_dimensions.financial },
    { subject: 'Operational', score: data.radar_dimensions.operational },
    { subject: 'Geopolitical', score: data.radar_dimensions.geopolitical },
    { subject: 'ESG & Compliance', score: data.radar_dimensions.esg },
    { subject: 'Cyber Risk', score: data.radar_dimensions.cyber },
    { subject: 'News Sentiment', score: data.radar_dimensions.news },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Top Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunInvestigation}
            disabled={investigating}
            className="px-3.5 py-1.5 rounded text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${investigating ? 'animate-spin' : ''}`} />
            <span>{investigating ? 'Executing Multi-Agent Investigation...' : 'Re-Run Multi-Agent Audit'}</span>
          </button>

          <button
            onClick={() => onSimulateDisruption(supplierId)}
            className="px-3.5 py-1.5 rounded text-xs font-mono font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Disruption in Scenario Lab</span>
          </button>
        </div>
      </div>

      {/* Supplier Profile Header Card */}
      <div className="glass-panel p-6 rounded-lg space-y-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {data.code}
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">{data.name}</h1>
              <RiskBadge category={data.risk_category} score={data.overall_risk_score} showScore size="lg" />
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Tier {data.tier} {data.category} Supplier • Headquarters: <strong className="text-slate-200">{data.city}, {data.country}</strong> ({data.region})
            </p>
          </div>

          {/* Quick Metrics Summary */}
          <div className="flex items-center gap-6 font-mono text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div>
              <div className="text-[10px] uppercase text-slate-500">Contract Exposure</div>
              <div className="text-base font-bold text-white">${(data.contract_value / 1_000_000).toFixed(2)}M</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Volume Reliance</div>
              <div className="text-base font-bold text-amber-400">{data.dependency_pct}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">ML Confidence</div>
              <div className="text-base font-bold text-emerald-400">{(data.confidence_score * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Explainability & Risk Dimensions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Feature Attribution (Key Drivers) */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>SHAP Explainability Driver Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">TreeExplainer feature attribution for prediction</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              XGB/RF SHAP
            </span>
          </div>

          <div className="space-y-3">
            {data.shap_drivers.map((driver, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-medium text-slate-200">{driver.label}</span>
                  <span className={`font-bold ${driver.direction === 'increases' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {driver.impact_display}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${driver.direction === 'increases' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, driver.abs_pct * 2.5)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{driver.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension Risk Radar & Operational Telemetry */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Multi-Dimensional Risk Profile</h3>
            <p className="text-xs text-slate-400 font-mono font-normal">Score breakdown across 6 evaluation vectors</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Risk Score" dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Operational Metrics Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-2">
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Avg Lead Time</span>
              <div className="font-bold text-slate-200">{data.metrics.avg_lead_time_days} Days</div>
            </div>
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">On-Time Delivery</span>
              <div className="font-bold text-emerald-400">{data.metrics.on_time_delivery_pct}%</div>
            </div>
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Altman Z-Score</span>
              <div className={`font-bold ${data.metrics.altman_z_score < 1.8 ? 'text-rose-400' : 'text-slate-200'}`}>
                {data.metrics.altman_z_score.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Timeline & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intelligence Events Feed */}
        <div className="glass-panel p-5 rounded-lg lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-white">Intelligence Event Timeline</h3>

          {data.events.length === 0 ? (
            <div className="text-xs font-mono text-slate-500 py-6 text-center">
              No recent news or anomaly events flagged for this supplier.
            </div>
          ) : (
            <div className="space-y-3">
              {data.events.map((evt) => (
                <div key={evt.id} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 font-sans">{evt.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{evt.created_at.substring(0, 10)}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{evt.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold text-white">AI Mitigation Options</h3>

          {data.recommendations.length === 0 ? (
            <div className="text-xs font-mono text-slate-500 py-6 text-center">
              Supplier risk score is within baseline limits. No active mitigation needed.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recommendations.map((rec) => (
                <div key={rec.id} className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                      {rec.action_type}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      -{rec.estimated_risk_reduction_pct}% Risk
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white font-sans">{rec.title}</h4>
                  <p className="text-[11px] text-slate-400 font-sans">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
