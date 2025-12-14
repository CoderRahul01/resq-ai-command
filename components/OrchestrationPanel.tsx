import React, { useState } from 'react';
import { KestraStep, SimulationLog } from '../types';
import { Activity, Zap, CheckCircle2, Circle, Code, Eye, Copy, Check, Download, Database, GitBranch, Cpu, FileJson, Server, ArrowRight } from 'lucide-react';

interface Props {
  steps: KestraStep[];
  logs: SimulationLog[];
  isProcessing: boolean;
  yamlCode: string;
}

export const OrchestrationPanel: React.FC<Props> = ({ steps, logs, isProcessing, yamlCode }) => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'CODE'>('VISUAL');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlCode], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kestra-incident-workflow.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTaskInfo = (index: number) => {
    const infos = [
      { id: 'inputs', type: 'Webhook Trigger', icon: FileJson },
      { id: '1_summarize', type: 'Gemini Chat', icon: Activity },
      { id: '2_rag_retrieve', type: 'Python Script', icon: Database },
      { id: '3_decision', type: 'Gemini Chat', icon: Cpu },
      { id: '5_dispatch', type: 'Flow Switch', icon: GitBranch },
    ];
    return infos[index] || { id: 'task', type: 'Task', icon: Server };
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl relative">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="text-purple-400 w-5 h-5" />
          <h2 className="font-bold text-slate-100">Kestra Workflow Engine</h2>
        </div>
        
        {/* Toggle Switches */}
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={() => setActiveTab('VISUAL')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'VISUAL' 
                ? 'bg-slate-700 text-white shadow' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Eye className="w-3 h-3" />
            TOPOLOGY
          </button>
          <button 
            onClick={() => setActiveTab('CODE')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'CODE' 
                ? 'bg-slate-700 text-hero-cyan shadow' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Code className="w-3 h-3" />
            SOURCE
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        {/* VISUAL TAB */}
        {activeTab === 'VISUAL' && (
          <>
            {/* Visual Flow */}
            <div className="p-8 bg-slate-900/50 flex flex-col justify-center min-h-[240px] relative overflow-hidden">
               {/* Background Grid Pattern */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

               <div className="flex items-start justify-between relative z-10 px-4">
                  {steps.map((step, idx) => {
                    const info = getTaskInfo(idx);
                    const isLast = idx === steps.length - 1;
                    const isActive = step.status === 'RUNNING';
                    const isDone = step.status === 'SUCCESS';
                    
                    // Line status based on current step completion
                    const lineActive = isDone; 
                    const linePulsing = isActive; // Maybe pulse the line going OUT if active? No, usually line going IN.
                    // Let's say line to next is active if THIS step is done.

                    return (
                      <div key={step.id} className="flex-1 flex relative">
                         {/* Node Container */}
                         <div className="flex flex-col items-center gap-3 relative z-10 w-full group">
                            
                            {/* Icon Box */}
                            <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-500 relative ${
                                isActive ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-110' :
                                isDone ? 'bg-green-900/20 border-green-500/50' :
                                'bg-slate-800 border-slate-700 group-hover:border-slate-600'
                            }`}>
                                {isActive ? (
                                    <>
                                      <info.icon className="w-7 h-7 text-purple-400 animate-pulse relative z-10" />
                                      <span className="absolute inset-0 rounded-xl bg-purple-500/10 animate-ping"></span>
                                    </>
                                ) : isDone ? (
                                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                                ) : (
                                    <info.icon className="w-7 h-7 text-slate-600 group-hover:text-slate-500 transition-colors" />
                                )}
                                
                                {/* Status Dot */}
                                {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg"></div>}
                            </div>

                            {/* Labels */}
                            <div className="text-center transition-all duration-300">
                                <div className={`text-[10px] font-mono mb-1 uppercase tracking-wider ${
                                    isActive ? 'text-purple-400 font-bold' : isDone ? 'text-green-500/70' : 'text-slate-600'
                                }`}>
                                    {info.id}
                                </div>
                                <div className={`text-xs font-bold whitespace-nowrap ${
                                    isActive ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'
                                }`}>
                                    {step.name}
                                </div>
                                <div className="text-[10px] text-slate-600 mt-0.5 font-mono opacity-80">{info.type}</div>
                            </div>
                         </div>

                         {/* Connector Line (Right side of node, connecting to next) */}
                         {!isLast && (
                            <div className="absolute top-8 left-[50%] w-full h-[2px] -z-0">
                                {/* Base Line */}
                                <div className="absolute inset-0 bg-slate-800"></div>
                                
                                {/* Active/Success Fill */}
                                <div className={`absolute inset-0 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-700 ease-out ${
                                    lineActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                                }`}></div>

                                {/* Running Pulse (if current is active, maybe show line being processed? 
                                    Actually if current (idx) is active, line from prev is done. 
                                    Line from current is waiting. 
                                    Let's add a small 'traveling' particle if lineActive is true to show data flow) 
                                */}
                                {lineActive && (
                                   <div className="absolute top-[-2px] right-0 w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                )}
                            </div>
                         )}
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Terminal Logs */}
            <div className="flex-1 bg-[#0c0c0c] p-4 font-mono text-xs overflow-y-auto border-t border-slate-800 custom-scrollbar">
              <div className="flex items-center justify-between mb-3 text-slate-500 border-b border-slate-800 pb-2 sticky top-0 bg-[#0c0c0c] z-10">
                <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                   EXECUTION LOGS
                </span>
                <span className={`flex items-center gap-1 ${isProcessing ? "text-green-500" : "text-slate-600"}`}>
                   {isProcessing && <Zap className="w-3 h-3 animate-pulse" />}
                   {isProcessing ? "RUNNING" : "IDLE"}
                </span>
              </div>
              <div className="space-y-1.5 pb-2">
                {logs.length === 0 && (
                   <div className="text-slate-700 italic text-center py-8">Waiting for execution trigger...</div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 group hover:bg-white/5 p-0.5 rounded transition-colors">
                    <span className="text-slate-600 min-w-[60px] select-none">[{log.timestamp}]</span>
                    <span className={`font-bold w-20 text-right select-none ${
                      log.source === 'KESTRA' ? 'text-purple-400' : 
                      log.source === 'OUMI' ? 'text-red-400' : 'text-blue-400'
                    }`}>{log.source}</span>
                    <span className="text-slate-300 group-hover:text-white break-all border-l border-slate-800 pl-3">{log.message}</span>
                  </div>
                ))}
                 {/* Auto-scroll anchor if needed, but flex-col handles it mostly */}
              </div>
            </div>
          </>
        )}

        {/* CODE TAB */}
        {activeTab === 'CODE' && (
          <div className="flex-1 bg-[#1e1e1e] p-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center bg-[#252526] px-4 py-2 border-b border-[#3e3e42]">
               <div className="flex items-center gap-4">
                 <span className="text-xs text-slate-400 font-mono">workflow.yaml</span>
                 <span className="text-[10px] text-green-500 font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-900">READY FOR DEPLOYMENT</span>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={handleCopy}
                   className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700"
                 >
                   {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                   {copied ? 'COPIED' : 'COPY'}
                 </button>
                 <button 
                   onClick={handleDownload}
                   className="flex items-center gap-1 text-xs text-hero-cyan hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700 border border-slate-700 hover:border-hero-cyan"
                 >
                   <Download className="w-3 h-3" />
                   DOWNLOAD
                 </button>
               </div>
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-[#d4d4d4]">
              <code>{yamlCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};