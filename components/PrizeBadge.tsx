import React from 'react';

interface PrizeBadgeProps {
  name: string;
  amount: string;
  color: string;
}

export const PrizeBadge: React.FC<PrizeBadgeProps> = ({ name, amount, color }) => {
  return (
    <div className={`group flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm transition-all hover:border-hero-purple/50 hover:shadow-[0_0_15px_rgba(126,34,206,0.2)] cursor-default select-none`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color} relative`}>
            <div className={`absolute inset-0 rounded-full ${color} blur-[4px] opacity-70 group-hover:opacity-100 group-hover:blur-[6px] transition-all duration-500`}></div>
        </div>
        <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">{name}</span>
      </div>
      <span className="text-xs font-mono text-hero-cyan font-bold tracking-tight">{amount}</span>
    </div>
  );
};