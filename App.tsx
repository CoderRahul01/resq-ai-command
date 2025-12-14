import React, { useState, useEffect } from 'react';
import { Incident, KestraStep, SimulationLog } from './types';
import { INITIAL_INCIDENTS, EMERGENCY_PROTOCOLS } from './constants';
import { analyzeIncident, generateSyntheticIncident, summarizeTelemetry } from './services/geminiService';
import { generateKestraYaml } from './services/kestraGenerator';
import { IncidentCard } from './components/IncidentCard';
import { OrchestrationPanel } from './components/OrchestrationPanel';
import { PrizeBadge } from './components/PrizeBadge';
import { HelpModal } from './components/HelpModal';
import { Shield, Radio, Activity, Globe, Menu, RefreshCw, Trash2, Code2, HelpCircle } from 'lucide-react';

const INITIAL_STEPS: KestraStep[] = [
  { id: '1', name: 'Ingest Logs', status: 'IDLE', icon: 'download' },
  { id: '2', name: 'Summarize', status: 'IDLE', icon: 'file-text' },
  { id: '3', name: 'Fetch Protocol', status: 'IDLE', icon: 'database' }, // New RAG Step
  { id: '4', name: 'AI Decision', status: 'IDLE', icon: 'cpu' },
  { id: '5', name: 'Dispatch', status: 'IDLE', icon: 'send' },
];

const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('resq-incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });
  
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<KestraStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentYaml, setCurrentYaml] = useState<string>("# Select an incident to generate Kestra Workflow YAML");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('resq-incidents', JSON.stringify(incidents));
  }, [incidents]);

  const addLog = (source: 'KESTRA' | 'OUMI' | 'SYSTEM', message: string) => {
    const newLog: SimulationLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      source,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleScanForIncidents = async () => {
    setIsScanning(true);
    const newIncident = await generateSyntheticIncident();
    if (newIncident) {
      setIncidents(prev => [newIncident, ...prev]);
    }
    setIsScanning(false);
  };

  const handleClearData = () => {
    if (confirm("Reset all system data?")) {
      setIncidents(INITIAL_INCIDENTS as any);
      localStorage.removeItem('resq-incidents');
      setActiveIncidentId(null);
      setLogs([]);
      setWorkflowSteps(INITIAL_STEPS.map(s => ({...s, status: 'IDLE'})));
      setCurrentYaml("# Select an incident to generate Kestra Workflow YAML");
    }
  };

  const handleAnalyze = async (id: string) => {
    if (isProcessing) return;
    
    const incident = incidents.find(i => i.id === id);
    if (!incident || incident.status === 'DISPATCHED') return;

    setActiveIncidentId(id);
    setIsProcessing(true);
    setLogs([]);
    setWorkflowSteps(INITIAL_STEPS.map(s => ({...s, status: 'IDLE'})));
    
    setCurrentYaml(generateKestraYaml(incident));

    // SIMULATION SEQUENCE
    
    // Step 1: Ingest
    updateStep('1', 'RUNNING');
    addLog('KESTRA', `Trigger: External System Webhook (${id})`);
    addLog('KESTRA', `Ingesting Raw Telemetry: ${incident.rawTelemetry.substring(0, 30)}...`);
    await delay(1000);
    updateStep('1', 'SUCCESS');

    // Step 2: Summarize (Explicitly calling Gemini for summary now)
    updateStep('2', 'RUNNING');
    addLog('KESTRA', 'Executing Task: 1_summarize_telemetry (Gemini Agent)');
    addLog('OUMI', 'Processing unstructrued sensor data...');
    
    const sitrep = await summarizeTelemetry(incident.rawTelemetry);
    
    addLog('OUMI', `SITREP Generated: "${sitrep.substring(0, 45)}..."`);
    updateStep('2', 'SUCCESS');

    // Step 3: Fetch Protocol (RAG)
    updateStep('3', 'RUNNING');
    addLog('KESTRA', 'Executing Task: 2_rag_retrieval (Python Script)');
    addLog('SYSTEM', 'Connecting to Vector Database (Simulated)...');
    
    // Determine Protocol - SIMULATING THE KESTRA PYTHON SCRIPT LOGIC
    // We use the SITREP (AI summary) to find the protocol, not the description.
    let protocolName = "DEFAULT";
    let protocolContent = EMERGENCY_PROTOCOLS.DEFAULT;
    let confidence = "0.82";
    
    const searchContext = sitrep.toLowerCase();
    
    // Logic must match the python script in kestraGenerator.ts
    if (["collapse", "structural", "debris", "vibration"].some(k => searchContext.includes(k))) { 
        protocolName = "STRUCTURAL"; 
        protocolContent = EMERGENCY_PROTOCOLS.STRUCTURAL; 
        confidence = "0.98";
    }
    else if (["leak", "chemical", "toxic", "gas", "fumes"].some(k => searchContext.includes(k))) { 
        protocolName = "CHEMICAL"; 
        protocolContent = EMERGENCY_PROTOCOLS.CHEMICAL; 
        confidence = "0.96";
    }
    else if (["traffic", "collision", "vehicle", "crash", "highway"].some(k => searchContext.includes(k))) { 
        protocolName = "TRAFFIC"; 
        protocolContent = EMERGENCY_PROTOCOLS.TRAFFIC; 
        confidence = "0.94";
    }

    addLog('SYSTEM', `Query Embedding: "${sitrep.substring(0, 30)}..."`);
    addLog('SYSTEM', `Vector Search Result: [${protocolName}]`);
    addLog('SYSTEM', `Similarity Score: ${confidence}`);
    addLog('KESTRA', `Retrieved Protocol: "${protocolContent.split('\n')[0]}"`);
    
    await delay(800);
    updateStep('3', 'SUCCESS');

    // Step 4: Decision (Uses Summary + Protocol)
    updateStep('4', 'RUNNING');
    addLog('KESTRA', 'Executing Task: 3_ai_decision_maker (Gemini)');
    addLog('OUMI', 'Contextualizing SITREP with Protocol data...');
    
    // Pass Summary + Protocol to Analysis
    const analysis = await analyzeIncident(sitrep, protocolContent);
    
    updateStep('4', 'SUCCESS');
    addLog('OUMI', `Decision: ${analysis.severity} SEVERITY`);

    // Step 5: Dispatch
    updateStep('5', 'RUNNING');
    addLog('KESTRA', `Branching Flow: ${analysis.severity} Response path`);
    addLog('SYSTEM', `Dispatching: ${analysis.resources?.join(', ')}`);
    await delay(1000);
    updateStep('5', 'SUCCESS');
    addLog('KESTRA', 'Workflow completed successfully.');

    setIncidents(prev => prev.map(inc => 
      inc.id === id ? {
        ...inc,
        status: 'DISPATCHED',
        aiAnalysis: analysis.rationale,
        resources: analysis.resources,
        severity: analysis.severity 
      } : inc
    ));
    
    setIsProcessing(false);
  };

  const updateStep = (id: string, status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED') => {
    setWorkflowSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  return (
    <div className="flex flex-col h-screen bg-hero-dark text-slate-200 overflow-hidden font-sans">
      
      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Navbar */}
      <nav className="h-16 border-b border-slate-700 bg-slate-900/90 backdrop-blur flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-hero-cyan/20 rounded flex items-center justify-center border border-hero-cyan">
             <Shield className="w-5 h-5 text-hero-cyan" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">ResQ-AI <span className="text-hero-cyan">COMMAND</span></h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">KESTRA RAG ORCHESTRATOR</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button 
             onClick={handleClearData}
             className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
             title="Reset Simulation"
          >
            <Trash2 className="w-4 h-4" />
            RESET
          </button>
          
          <button 
             onClick={() => setIsHelpOpen(true)}
             className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
             title="Documentation"
          >
            <HelpCircle className="w-4 h-4" />
            DOCS
          </button>

          <div className="h-4 w-[1px] bg-slate-700"></div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Activity className="w-4 h-4 text-purple-400" />
            KESTRA ONLINE
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Incidents */}
        <div className="w-full md:w-[450px] flex flex-col border-r border-slate-700 bg-slate-900/50">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
            <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              Incoming Signals
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{incidents.filter(i => i.status !== 'DISPATCHED').length} ACTIVE</span>
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-800 bg-slate-900/20 space-y-3">
             <button 
               onClick={handleScanForIncidents}
               disabled={isScanning}
               className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded flex items-center justify-center gap-2 text-xs font-mono transition-all hover:text-hero-cyan disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'SCANNING CHANNELS...' : 'SCAN FOR SIGNAL'}
             </button>
             
             <PrizeBadge 
                name="Stormbreaker" 
                amount="DEPLOYED" 
                color="bg-hero-purple" 
             />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {incidents.map(incident => (
              <IncidentCard 
                key={incident.id} 
                incident={incident} 
                isActive={activeIncidentId === incident.id}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        </div>

        {/* Right Area: Orchestration */}
        <div className="hidden md:flex flex-1 p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-hero-dark to-hero-dark flex-col">
          <div className="mb-4 flex items-center justify-between">
             <div>
               <h2 className="text-xl font-bold text-white mb-1">Workflow Orchestrator</h2>
               <p className="text-sm text-slate-400">Mode: <span className="text-green-400 font-bold">RAG ENABLED</span> • Orchestrator: <span className="text-purple-400 font-bold">Kestra</span></p>
             </div>
             {activeIncidentId && (
               <div className="text-right">
                 <div className="text-xs text-slate-500 font-mono">WORKFLOW ID</div>
                 <div className="text-sm text-hero-cyan font-mono font-bold">{activeIncidentId}</div>
               </div>
             )}
          </div>
          
          <div className="flex-1 min-h-0">
            <OrchestrationPanel 
              steps={workflowSteps} 
              logs={logs}
              isProcessing={isProcessing}
              yamlCode={currentYaml}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;