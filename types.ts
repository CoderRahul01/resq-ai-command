export interface Incident {
  id: string;
  timestamp: string;
  location: string;
  description: string;
  rawTelemetry: string; // New field for "Data from other systems"
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'ANALYZING' | 'DISPATCHED';
  resources?: string[];
  aiAnalysis?: string;
}

export interface KestraStep {
  id: string;
  name: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  icon: string;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  source: 'KESTRA' | 'OUMI' | 'SYSTEM';
  message: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}