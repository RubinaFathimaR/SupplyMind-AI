import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Supplier, SimulationResult } from '../types';
import { FlaskConical, Play, DollarSign, Clock, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ScenarioLabPageProps {
  initialSupplierId?: number;
  onNavigateToActions: () => void;
}

export const ScenarioLabPage: React.FC<ScenarioLabPageProps> = ({ initialSupplierId, onNavigateToActions }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(initialSupplierId || 1);
  const [scenarioType, setScenarioType] = useState<string>('30-day disruption');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [severityPct, setSeverityPct] = useState<number>(80);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
      if (!initialSupplierId && data.length > 0) {
        setSelectedSupplierId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load suppliers", err);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.simulateScenario({
        scenario_type: scenarioType,
        supplier_id: selectedSupplierId,
        duration_days: durationDays,
        severity_pct: severityPct,
        demand_multiplier: demandMultiplier
      });
      setResult(res);
    } catch (err) {
      console.error("Scenario simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const scenarioOptions = [
    '30-day disruption', 'shutdown', 'factory outage', 'natural disaster',
    'cyberattack', 'port closure', 'geopolitical event', 'financial failure'
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Scenario Simulation Lab</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Quantified "What-If" stress testing and mathematical financial impact forecasting
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Configuration Panel */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-400" />
            <span>Scenario Parameters</span>
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-4 text-xs font-mono">
            {/* Target Supplier Select */}
            <div className="space-y-1">
              <label className="text-slate-300">Target Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans text-xs"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) — {s.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Type Select */}
            <div className="space-y-1">
              <label className="text-slate-300">Disruption Scenario Type</label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans text-xs"
              >
                {scenarioOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Duration (Days)</span>
                <span className="font-bold text-indigo-400">{durationDays} Days</span>
              </div>
              <input
                type="range"
                min="7"
                max="180"
                step="7"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Severity % Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Disruption Severity (%)</span>
                <span className="font-bold text-rose-400">{severityPct}% Capacity Loss</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={severityPct}
                onChange={(e) => setSeverityPct(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Demand Multiplier Select */}
            <div className="space-y-1">
              <label className="text-slate-300">Downstream Demand Factor</label>
              <select
                value={demandMultiplier}
                onChange={(e) => setDemandMultiplier(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans text-xs"
              >
                <option value={0.8}>0.8x (Low Demand Baseline)</option>
                <option value={1.0}>1.0x (Standard Market Demand)</option>
                <option value={1.25}>1.25x (Peak Demand Surge)</option>
                <option value={1.5}>1.5x (Extreme Surge Event)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing Impact Engine...' : 'Run Scenario Simulation'}</span>
            </button>
          </form>
        </div>

        {/* Computed Simulation Output Panel */}
        <div className="glass-panel p-5 rounded-lg lg:col-span-2 space-y-6">
          <h3 className="text-sm font-semibold text-white">Simulation Results & Quantified Metrics</h3>

          {result ? (
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500">Evaluated Disruption Target</div>
                  <div className="text-base font-bold text-white font-sans">{result.supplier_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Overall Severity Rating</div>
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    result.overall_severity_rating === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {result.overall_severity_rating.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 6 Computed Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Estimated Financial Impact</span>
                  <div className="text-lg font-bold text-rose-400">
                    ${(result.estimated_financial_impact_usd / 1_000_000).toFixed(2)}M USD
                  </div>
                </div>

                <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Buffer Days Remaining</span>
                  <div className="text-lg font-bold text-amber-400">
                    {result.inventory_buffer_remaining_days} Days
                  </div>
                </div>

                <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Units at Risk</span>
                  <div className="text-lg font-bold text-slate-100">
                    {result.units_at_risk.toLocaleString()} Units
                  </div>
                </div>

                <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Affected Product Lines</span>
                  <div className="text-lg font-bold text-indigo-300">
                    {result.affected_products_count} Lines
                  </div>
                </div>

                <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Alternate Coverage %</span>
                  <div className="text-lg font-bold text-emerald-400">
                    {result.alternate_coverage_pct}%
                  </div>
                </div>

                <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Estimated Recovery Time</span>
                  <div className="text-lg font-bold text-cyan-300">
                    {result.estimated_recovery_time_days} Days
                  </div>
                </div>
              </div>

              {/* Auto-Surfaced Ranked Mitigation Recommendations */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 font-mono uppercase">
                    Surfaced Agent Recommendations
                  </h4>
                  <button
                    onClick={onNavigateToActions}
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Open Action Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                            {rec.action_type}
                          </span>
                          <span className="text-xs font-semibold text-white font-sans">{rec.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">{rec.description}</p>
                      </div>
                      <div className="text-right font-mono text-xs shrink-0">
                        <div className="font-bold text-emerald-400">-{rec.estimated_risk_reduction_pct}% Risk</div>
                        <div className="text-[10px] text-slate-500">${(rec.cost_usd / 1000).toFixed(0)}k Est. Cost</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 py-20 text-center space-y-2">
              <FlaskConical className="w-8 h-8 mx-auto text-slate-700" />
              <p>Configure parameters on the left and click 'Run Scenario Simulation' to execute impact model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
