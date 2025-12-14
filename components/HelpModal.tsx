import React from 'react';
import { X, Shield, Cpu, Database, GitBranch, Zap, PlayCircle, Radio, Key, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Shield className="w-6 h-6 text-hero-cyan" />
               Operator Manual & System Docs
             </h2>
             <p className="text-sm text-slate-400 mt-1">ResQ-AI Autonomous Command System</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
             <X className="w-6 h-6 text-slate-400 hover:text-white" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

          {/* Intro Section */}
          <section className="space-y-4">
             <h3 className="text-lg font-bold text-hero-cyan uppercase tracking-wide">System Overview</h3>
             <p className="text-slate-300 leading-relaxed">
               ResQ-AI Command is an event-driven disaster response platform designed to handle high-velocity telemetry data.
               It automates the critical path from <strong>Signal Ingestion</strong> to <strong>Resource Dispatch</strong> using
               AI Agents and Orchestration workflows.
             </p>
          </section>

          {/* API Key Configuration Section */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
             <h3 className="text-lg font-bold text-hero-cyan uppercase tracking-wide flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Configuration
             </h3>
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <Key className="w-5 h-5 text-yellow-500" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-bold text-sm">Google Gemini API Key Required</h4>
                      <p className="text-slate-400 text-sm mt-1">
                         This system relies on <code>gemini-2.5-flash</code> for telemetry summarization and decision making. 
                         You must configure a valid API key to enable AI features.
                      </p>
                   </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between group">
                   <div className="text-slate-400">
                      <span className="text-purple-400">process</span>.<span className="text-blue-400">env</span>.API_KEY
                   </div>
                   <a 
                     href="https://aistudio.google.com/app/apikey" 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center gap-1 text-hero-cyan hover:underline"
                   >
                     Get API Key <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
                
                <div className="text-xs text-slate-500 flex gap-2">
                   <span className="font-bold text-slate-400">Setup:</span>
                   <span>Add <code>API_KEY=your_key_here</code> to your environment variables or <code>.env</code> file.</span>
                </div>
             </div>
          </section>

          {/* Architecture Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
             <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-hero-purple/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition-colors"><Cpu className="w-5 h-5 text-purple-400" /></div>
                  <h4 className="font-bold text-white">Gemini 2.5 Flash Intelligence</h4>
                </div>
                <p className="text-sm text-slate-400">
                  Acts as the "Incident Commander". It standardizes raw sensor logs (JSON, Hex dumps) into human-readable Situation Reports (SITREPs) and makes dispatch decisions.
                </p>
             </div>

             <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-hero-cyan/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-cyan-900/30 rounded-lg group-hover:bg-cyan-900/50 transition-colors"><Zap className="w-5 h-5 text-hero-cyan" /></div>
                   <h4 className="font-bold text-white">Kestra Orchestration</h4>
                </div>
                <p className="text-sm text-slate-400">
                   The central nervous system. It triggers on Webhooks, manages state, and executes the pipeline: Summarize → RAG → Decision → Dispatch.
                </p>
             </div>

             <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-green-500/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-green-900/30 rounded-lg group-hover:bg-green-900/50 transition-colors"><Database className="w-5 h-5 text-green-400" /></div>
                   <h4 className="font-bold text-white">RAG Protocol Retrieval</h4>
                </div>
                <p className="text-sm text-slate-400">
                   Retrieves "Proprietary" Emergency Protocols based on the semantic context of the incident, ensuring AI decisions are grounded in official safety rules.
                </p>
             </div>

             <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-red-500/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-red-900/30 rounded-lg group-hover:bg-red-900/50 transition-colors"><GitBranch className="w-5 h-5 text-red-400" /></div>
                   <h4 className="font-bold text-white">Conditional Dispatch</h4>
                </div>
                <p className="text-sm text-slate-400">
                   Final execution logic (Switch Flow) that deploys resources based on the AI's severity assessment (e.g., National Guard for CRITICAL events).
                </p>
             </div>
          </div>

          {/* Workflow Steps */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
             <h3 className="text-lg font-bold text-hero-cyan uppercase tracking-wide">How to Use</h3>
             <ul className="space-y-4">
               <li className="flex gap-4">
                 <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white"><Radio className="w-4 h-4 text-hero-cyan"/></span>
                 <div>
                   <h5 className="font-bold text-white">1. Scan for Signals</h5>
                   <p className="text-sm text-slate-400">Use the <span className="text-hero-cyan font-mono text-xs border border-hero-cyan/30 px-1 rounded">SCAN FOR SIGNAL</span> button to simulate incoming distress calls from IoT networks.</p>
                 </div>
               </li>
               <li className="flex gap-4">
                 <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white"><Database className="w-4 h-4 text-green-400"/></span>
                 <div>
                   <h5 className="font-bold text-white">2. Analyze Incident</h5>
                   <p className="text-sm text-slate-400">Click on an incident card to load its telemetry. This auto-generates a Kestra Workflow YAML specific to that event.</p>
                 </div>
               </li>
               <li className="flex gap-4">
                 <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white"><PlayCircle className="w-4 h-4 text-purple-400"/></span>
                 <div>
                   <h5 className="font-bold text-white">3. Initiate Response</h5>
                   <p className="text-sm text-slate-400">The system will autonomously execute the pipeline. Watch the <strong>Orchestration Panel</strong> to see Kestra tasks firing in real-time.</p>
                 </div>
               </li>
             </ul>
          </section>

          {/* Footer Note */}
           <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-purple-300 text-sm">Stormbreaker Deployment Ready</h5>
                <p className="text-xs text-purple-200/70 mt-1">
                   This architecture is designed for "Day 2" operations. The generated YAML includes robust error handling, Webhook triggers, and dynamic variable resolution suitable for production Kestra instances.
                </p>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};