import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DigitalTwinData, DigitalTwinNode } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { GitFork, AlertTriangle, ChevronRight, Layers, Cpu, Box, ShieldCheck } from 'lucide-react';

interface DigitalTwinPageProps {
  onSelectSupplier: (supplierId: number) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ onSelectSupplier }) => {
  const [data, setData] = useState<DigitalTwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<DigitalTwinNode | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const res = await api.getDigitalTwin();
      setData(res);
      if (res.nodes && res.nodes.length > 0) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      console.error("Failed to load Digital Twin topology", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Constructing Digital Twin Graph Topology & Risk Propagation Paths...
      </div>
    );
  }

  const suppliers = data.nodes.filter(n => n.type === 'supplier');
  const components = data.nodes.filter(n => n.type === 'component');
  const productLines = data.nodes.filter(n => n.type === 'product_line');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Digital Twin Graph Topology</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Interactive multi-tier graph modeling risk propagation across Suppliers → Components → Product Lines
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {data.nodes.length} Nodes
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {data.edges.length} Dependencies
          </span>
        </div>
      </div>

      {/* Main Interactive Visual Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Graph Pipeline Columns */}
        <div className="glass-panel p-5 rounded-lg lg:col-span-3 space-y-6 overflow-hidden min-h-[500px]">
          <div className="grid grid-cols-3 gap-6 text-center text-xs font-mono border-b border-slate-800 pb-3 uppercase tracking-wider text-slate-400 font-semibold">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Tier 1-2 Suppliers</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Critical Components</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Revenue Product Lines</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 relative">
            {/* 1. Suppliers Column */}
            <div className="space-y-3">
              {suppliers.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHigh = node.risk_score >= 50.0;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 shadow-md shadow-indigo-500/20'
                        : isHigh
                        ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-white truncate">{node.label}</span>
                      <RiskBadge category={node.risk_category} score={node.risk_score} size="sm" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      HQ: {node.details.country} • Tier {node.details.tier}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Components Column */}
            <div className="space-y-3">
              {components.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHigh = node.risk_score >= 50.0;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 shadow-md shadow-indigo-500/20'
                        : isHigh
                        ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-white truncate">{node.label}</span>
                      {node.details.is_critical_single_source && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          SINGLE SOURCE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Buffer: {node.details.inventory_buffer_days} Days • ${node.details.unit_cost}/unit
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Product Lines Column */}
            <div className="space-y-3">
              {productLines.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHigh = node.risk_score >= 50.0;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 shadow-md shadow-indigo-500/20'
                        : isHigh
                        ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-white truncate">{node.label}</span>
                      <RiskBadge category={node.risk_category} score={node.risk_score} size="sm" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Annual Revenue: ${(node.details.annual_revenue_impact / 1_000_000).toFixed(0)}M
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold text-white">Node Intelligence Details</h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">{selectedNode.type}</span>
                  <RiskBadge category={selectedNode.risk_category} score={selectedNode.risk_score} showScore />
                </div>
                <div className="text-sm font-bold text-white font-sans">{selectedNode.label}</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-slate-400 font-semibold">Graph Attributes:</div>
                <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedNode.details, null, 2)}
                </pre>
              </div>

              {selectedNode.type === 'supplier' && (
                <button
                  onClick={() => onSelectSupplier(parseInt(selectedNode.id.replace('sup-', '')))}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-medium transition-colors"
                >
                  Inspect Full Supplier Profile
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 py-12 text-center">
              Click any node in the topology graph to inspect risk propagation details.
            </div>
          )}
        </div>
      </div>

      {/* Critical Single Source Dependencies Table */}
      <div className="glass-panel p-5 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Identified Critical Single-Points-of-Failure</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Component Code</th>
                <th className="py-3 px-4">Component Name</th>
                <th className="py-3 px-4">Single Supplier</th>
                <th className="py-3 px-4">Inventory Buffer</th>
                <th className="py-3 px-4">Propagated Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.critical_single_sources.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-indigo-300 font-bold">{item.component_code}</td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">{item.component_name}</td>
                  <td className="py-3 px-4 text-slate-300">{item.supplier_name}</td>
                  <td className="py-3 px-4 text-amber-400">{item.buffer_days} Days Remaining</td>
                  <td className="py-3 px-4 font-bold text-rose-400">{item.risk_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
