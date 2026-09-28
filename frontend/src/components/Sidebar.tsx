import React from 'react';
import {
  LayoutDashboard, Users, ShieldAlert, GitFork, FlaskConical,
  Bot, Rss, CheckSquare, BookOpen, FileText, Activity, BarChart3
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'suppliers'
  | 'risk-observatory'
  | 'digital-twin'
  | 'scenario-lab'
  | 'copilot'
  | 'intelligence'
  | 'actions'
  | 'knowledge'
  | 'reports'
  | 'agent-activity'
  | 'model-eval';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pendingActionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, pendingActionsCount = 0 }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Supplier Intelligence', icon: Users },
    { id: 'risk-observatory', label: 'Risk Observatory', icon: ShieldAlert },
    { id: 'digital-twin', label: 'Digital Twin', icon: GitFork },
    { id: 'scenario-lab', label: 'Scenario Lab', icon: FlaskConical },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'RAG' },
    { id: 'intelligence', label: 'Intelligence Feed', icon: Rss },
    { id: 'actions', label: 'Action Center', icon: CheckSquare, badgeCount: pendingActionsCount },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'agent-activity', label: 'Agent Activity', icon: Activity, pulse: true },
    { id: 'model-eval', label: 'Model Evaluation', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-3.5rem)]">
      <div className="py-3 px-2">
        <div className="px-3 mb-2 font-mono text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          Intelligence Control
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as PageId)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}

                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white">
                    {item.badgeCount}
                  </span>
                )}

                {item.pulse && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-900 bg-slate-900/40 text-[11px] font-mono text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span>Engine Status:</span>
          <span className="text-emerald-400 font-semibold">OPTIMAL</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span>Database:</span>
          <span className="text-slate-400">PostgreSQL / Vector DB</span>
        </div>
      </div>
    </aside>
  );
};
