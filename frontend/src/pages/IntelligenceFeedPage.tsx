import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { EventItem } from '../types';
import { Rss, AlertCircle, RefreshCw, ExternalLink, Filter } from 'lucide-react';

export const IntelligenceFeedPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadFeed();
  }, [categoryFilter]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await api.getIntelligenceFeed(categoryFilter);
      setEvents(data);
    } catch (err) {
      console.error("Failed to load intelligence feed", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Operational', 'Geopolitical', 'Financial', 'ESG', 'Cyber'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Rss className="w-5 h-5 text-indigo-400" />
            <span>Global Intelligence & News Feed</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Continuous NLP monitoring of global logistics wires, shipping ports, and macroeconomic events
          </p>
        </div>
        <button
          onClick={loadFeed}
          className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Wire</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="glass-panel p-3 rounded-lg flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">Filter Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors shrink-0 ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Timeline Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            Ingesting latest global logistics events...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            No intelligence events found for category '{categoryFilter}'.
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="glass-panel p-5 rounded-lg space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    {evt.category.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    evt.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {evt.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Source: <strong className="text-slate-200">{evt.source}</strong>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {evt.created_at.substring(0, 19).replace('T', ' ')} UTC
                </div>
              </div>

              <h3 className="text-base font-semibold text-white font-sans pt-1">{evt.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{evt.summary}</p>

              <div className="pt-2 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Target Supplier: <strong className="text-indigo-300">{evt.supplier_name || 'Global Macro Network'}</strong>
                </span>
                <span className="text-rose-400 font-bold">
                  Impact Score: {evt.impact_score}/100
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
