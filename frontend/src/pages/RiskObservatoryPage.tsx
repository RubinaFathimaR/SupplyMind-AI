import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ShieldAlert, Grid, DollarSign, Layers } from 'lucide-react';

interface RiskObservatoryPageProps {
  onSelectSupplier: (supplierId: number) => void;
}

export const RiskObservatoryPage: React.FC<RiskObservatoryPageProps> = ({ onSelectSupplier }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getRiskObservatory();
      setData(res);
    } catch (err) {
      console.error("Failed to load Risk Observatory data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Generating sector risk matrix and cross-supplier heatmaps...
      </div>
    );
  }

  const categories = data?.category_summary || [];
  const matrix = data?.suppliers_matrix || [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Risk Observatory</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Cross-category vulnerability heatmaps and multi-vector risk exposure analysis
        </p>
      </div>

      {/* Category Risk Heatmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat: any) => {
          let bgGradient = 'from-slate-900 via-slate-900 to-slate-800';
          let borderCol = 'border-slate-800';
          if (cat.avg_risk_score >= 50.0) {
            bgGradient = 'from-slate-900 via-slate-900 to-rose-950/30';
            borderCol = 'border-rose-500/30';
          } else if (cat.avg_risk_score >= 35.0) {
            bgGradient = 'from-slate-900 via-slate-900 to-amber-950/30';
            borderCol = 'border-amber-500/30';
          }

          return (
            <div key={cat.category} className={`glass-panel p-5 rounded-lg border ${borderCol} bg-gradient-to-br ${bgGradient} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm font-sans">{cat.category}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  {cat.count} Suppliers
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Sector Avg Risk</div>
                  <div className="text-2xl font-bold font-mono text-white">{cat.avg_risk_score}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-500">High Risk Count</div>
                  <div className="text-lg font-bold font-mono text-rose-400">{cat.high_risk_count}</div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Contract Value:</span>
                <strong className="text-slate-200">${(cat.total_contract_value / 1_000_000).toFixed(1)}M USD</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Matrix Table */}
      <div className="glass-panel p-5 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Full Cross-Supplier Risk Matrix</h3>
            <p className="text-xs text-slate-400 font-mono">Sorted by evaluated composite risk score</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Showing {matrix.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Exposure ($)</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {matrix.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">{s.name}</td>
                  <td className="py-3 px-4 text-slate-400">{s.category}</td>
                  <td className="py-3 px-4 text-slate-300">{s.country}</td>
                  <td className="py-3 px-4 text-slate-200">${(s.contract_value / 1_000_000).toFixed(2)}M</td>
                  <td className="py-3 px-4">
                    <RiskBadge category={s.risk_category} score={s.risk_score} showScore />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectSupplier(s.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700 transition-colors"
                    >
                      View
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
