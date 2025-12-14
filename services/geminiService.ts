import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Summarize Raw Data from External Systems
 * Matches Kestra Task: 1_summarize_telemetry
 */
export const summarizeTelemetry = async (rawTelemetry: string): Promise<string> => {
  try {
    const prompt = `
      You are a Data Ingestion Agent for ResQ-AI.
      
      TASK:
      Summarize the following RAW TELEMETRY DATA from external sensors/systems.
      Convert technical logs into a concise, human-readable Situation Report (SITREP).
      Focus strictly on facts: confirmed hazards, casualty counts, and structural status.
      
      RAW DATA:
      ${rawTelemetry}
      
      OUTPUT:
      A single paragraph summary (max 30 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Data stream inconclusive.";
  } catch (error) {
    console.error("Summarization failed:", error);
    return "CRITICAL ERROR: Telemetry ingestion failed.";
  }
};

/**
 * Step 2: Make Decision based on Summary + Protocol
 * Matches Kestra Task: 3_ai_decision_maker
 */
export const analyzeIncident = async (summary: string, protocol: string) => {
  try {
    const prompt = `
      SITUATION REPORT (SITREP):
      ${summary}
      
      === MANDATORY SAFETY PROTOCOL ===
      ${protocol}
      ================================
      
      ACT AS INCIDENT COMMANDER.
      Based on the SITREP and the PROTOCOL above:
      1. Determine the Severity (LOW, MEDIUM, HIGH, CRITICAL).
      2. List 3 key resources to dispatch.
      3. Provide a rationale that EXPLICITLY QUOTES the protocol used.
      
      Output strictly in JSON format:
      {
        "summary": "...", 
        "severity": "...",
        "resources": ["...", "..."],
        "rationale": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2, 
      },
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("ResQ-AI Analysis Failed:", error);
    return {
      summary: "System Offline",
      severity: "CRITICAL",
      resources: ["Manual Intervention"],
      rationale: "AI Connection Lost"
    };
  }
};

export const generateSyntheticIncident = async () => {
  try {
    const prompt = `
      Generate a realistic disaster scenario with TWO parts:
      1. A general description.
      2. "Raw Telemetry" which looks like technical log data, sensor readings, or code output that defines the disaster.
      
      Output JSON:
      {
        "location": "Sector name...",
        "description": "Short description...",
        "rawTelemetry": "String containing logs/sensor data...",
        "severity": "HIGH",
        "timestamp": "HH:MM:SS"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    });

    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      id: `INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      status: 'PENDING'
    };
  } catch (error) {
    console.error("Failed to generate incident:", error);
    return null;
  }
};