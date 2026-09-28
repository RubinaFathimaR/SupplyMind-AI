import React from 'react';

interface RiskBadgeProps {
  category: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ category, score, showScore = false, size = 'md' }) => {
  let badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotStyle = 'bg-emerald-400';

  if (category === 'Medium') {
    badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotStyle = 'bg-amber-400';
  } else if (category === 'High') {
    badgeStyle = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    dotStyle = 'bg-orange-400';
  } else if (category === 'Critical') {
    badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotStyle = 'bg-rose-400';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-mono',
    md: 'px-2.5 py-1 text-xs font-mono font-medium',
    lg: 'px-3 py-1.5 text-sm font-mono font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border ${badgeStyle} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle} animate-pulse`} />
      <span>{category.toUpperCase()}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 border-l border-current/20 pl-1.5">
          {score.toFixed(1)}%
        </span>
      )}
    </span>
  );
};
