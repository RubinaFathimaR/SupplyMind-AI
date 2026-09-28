import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Bell, Cpu, User, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  pendingActionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, pendingActionsCount = 3 }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Identity & Status Ticker */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-bold tracking-tight text-white font-mono text-sm">SUPPLYMIND<span className="text-cyan-400">.AI</span></span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.0 CAPSTONE
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden md:block" />

        {/* Live System Telemetry Ticker */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE AGENTS: 11 ACTIVE
          </span>
          <span className="text-slate-600">•</span>
          <span>ML AUC: <strong className="text-slate-200">0.942</strong></span>
          <span className="text-slate-600">•</span>
          <span>MONITORED SUPPLIERS: <strong className="text-slate-200">300</strong></span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh System State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <div className="hidden md:block font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          {timeStr || '2026-09-14 18:16:59 UTC'}
        </div>

        {/* Action Notifications */}
        <div className="relative">
          <div className="p-1.5 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300">
            <Bell className="w-4 h-4" />
            {pendingActionsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {pendingActionsCount}
              </span>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold">
            PD
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Sarah Jenkins</div>
            <div className="text-[10px] text-slate-400 font-mono leading-tight">Procurement Director</div>
          </div>
        </div>
      </div>
    </header>
  );
};
