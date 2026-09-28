import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Supplier } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { Search, Filter, RefreshCw, ChevronRight, ShieldAlert, ArrowUpDown } from 'lucide-react';

interface SupplierIntelligencePageProps {
  onSelectSupplier: (supplierId: number) => void;
}

export const SupplierIntelligencePage: React.FC<SupplierIntelligencePageProps> = ({ onSelectSupplier }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');

  useEffect(() => {
    loadSuppliers();
  }, [categoryFilter, riskFilter, countryFilter]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.getSuppliers({
        category: categoryFilter,
        risk_category: riskFilter,
        country: countryFilter,
        search: search
      });
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSuppliers();
  };

  const categories = ['All', 'Semiconductor', 'Pharma', 'Automotive', 'Electronics', 'Raw Materials', 'Aerospace'];
  const riskLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Supplier Intelligence Directory</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Continuous multi-factor intelligence on active supplier base ({suppliers.length} Records)
          </p>
        </div>
        <button
          onClick={loadSuppliers}
          className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search supplier name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="All">Category: All Sectors</option>
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="All">Risk Level: All Categories</option>
              {riskLevels.filter(r => r !== 'All').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </form>
      </div>

      {/* Directory Table */}
      <div className="glass-panel rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            Loading supplier profiles...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            No supplier records matched the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Supplier Code</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Country / HQ</th>
                  <th className="py-3 px-4">Contract Exposure</th>
                  <th className="py-3 px-4">Reliance %</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {suppliers.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectSupplier(s.id)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-semibold text-indigo-300 group-hover:text-indigo-200">
                      {s.code}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-100">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{s.category}</td>
                    <td className="py-3 px-4 text-slate-300">Tier {s.tier}</td>
                    <td className="py-3 px-4 text-slate-300">{s.country}</td>
                    <td className="py-3 px-4 text-slate-200">${(s.contract_value / 1_000_000).toFixed(2)}M</td>
                    <td className="py-3 px-4 text-slate-300">{s.dependency_pct}%</td>
                    <td className="py-3 px-4">
                      <RiskBadge category={s.risk_category} score={s.overall_risk_score} showScore />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSupplier(s.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 group-hover:bg-indigo-600/30 text-slate-300 group-hover:text-indigo-200 border border-slate-700 transition-all flex items-center gap-1 ml-auto"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
