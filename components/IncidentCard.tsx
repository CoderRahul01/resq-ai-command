import React from 'react';
import { Incident } from '../types';
import { AlertTriangle, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  incident: Incident;
  isActive: boolean;
  onAnalyze: (id: string) => void;
}

export const IncidentCard: React.FC<Props> = ({ incident, isActive, onAnalyze }) => {
  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'CRITICAL': return 'border-red-500 bg-red-500/10 text-red-500';
      case 'HIGH': return 'border-orange-500 bg-orange-500/10 text-orange-500';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-500/10 text-yellow-500';
      default: return 'border-blue-500 bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className={`relative p-5 rounded-xl border transition-all duration-300 cursor-pointer group ${
      isActive 
        ? 'bg-slate-800 border-hero-cyan shadow-[0_0_20px_rgba(6,182,212,0.15)] scale-[1.02]' 
        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
    }`}
    onClick={() => onAnalyze(incident.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityColor(incident.severity)}`}>
          {incident.severity}
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <Clock className="w-3 h-3" />
          {incident.timestamp}
        </div>
      </div>

      <h3 className="text-slate-200 font-bold mb-1 truncate">{incident.location}</h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{incident.description}</p>

      {incident.status === 'DISPATCHED' ? (
        <div className="mt-2 p-3 bg-green-900/20 border border-green-800 rounded-lg">
           <div className="flex items-center gap-2 mb-2 text-green-400 text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Response Active</span>
           </div>
           <p className="text-xs text-slate-300 italic">"{incident.aiAnalysis}"</p>
           <div className="mt-2 flex flex-wrap gap-1">
              {incident.resources?.map(r => (
                <span key={r} className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded-full">{r}</span>
              ))}
           </div>
        </div>
      ) : (
        <button className="w-full mt-2 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 group-hover:text-hero-cyan transition-colors">
          <span>INITIATE KESTRA WORKFLOW</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
