import { Incident } from '../types';
import { EMERGENCY_PROTOCOLS } from '../constants';

export const generateKestraYaml = (incident: Incident): string => {
  const safeTelemetry = incident.rawTelemetry.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  
  // Serialize the protocols to inject into the Python script (simulating a DB load)
  const protocolsJson = JSON.stringify(EMERGENCY_PROTOCOLS)
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/"/g, '\\"');  // Escape quotes

  return `id: resq-automated-incident-response
namespace: com.resq.production
description: "Event-Driven RAG Response System"

# ---------------------------------------------------------
# EVENT TRIGGER: WEBHOOK
# Critical for Event-Driven Architecture.
# Listens for POST requests from IoT grids/external monitors.
# ---------------------------------------------------------
triggers:
  - id: ingest_telemetry_webhook
    type: io.kestra.plugin.core.trigger.Webhook
    key: "resq-secure-auth-token"

# ---------------------------------------------------------
# INPUTS
# Define interface for Manual Runs or API calls.
# Defaults populated for simulation/testing purposes.
# ---------------------------------------------------------
inputs:
  - name: raw_telemetry
    type: STRING
    defaults: "${safeTelemetry}"
  - name: location
    type: STRING
    defaults: "${incident.location}"

# ---------------------------------------------------------
# VARIABLES
# Smart resolution: Use Webhook Payload if available,
# otherwise fall back to Manual Inputs.
# ---------------------------------------------------------
variables:
  # If triggered by Webhook, data is in {{ trigger.body }}
  # If triggered manually, data is in {{ inputs }}
  data_payload: "{{ trigger.body.raw_telemetry ?? inputs.raw_telemetry }}"
  target_location: "{{ trigger.body.location ?? inputs.location }}"

tasks:
  # ---------------------------------------------------------
  # STEP 1: SUMMARIZE TELEMETRY
  # uses {{ vars.data_payload }} to be source-agnostic
  # ---------------------------------------------------------
  - id: 1_summarize_telemetry
    type: io.kestra.plugin.googleworkspace.gemini.Chat
    apiKey: "{{ secret('GEMINI_API_KEY') }}"
    model: "gemini-2.5-flash"
    prompt: |
      ANALYZE THIS RAW SENSOR DATA:
      {{ vars.data_payload }}
      
      OUTPUT: A concise Situation Report (SITREP).

  # ---------------------------------------------------------
  # STEP 2: RAG - RETRIEVE PROTOCOL (Python)
  # ---------------------------------------------------------
  - id: 2_rag_retrieval
    type: io.kestra.plugin.scripts.python.Script
    containerImage: python:3.11-slim
    script: |
      import json
      import sys

      # LOAD SIMULATED DATABASE (Emergency Protocols)
      db_content = "${protocolsJson}" 
      protocols = json.loads(db_content)

      # GET CONTEXT
      sitrep = """{{ outputs.1_summarize_telemetry.response.text }}""".lower()
      
      print(f"RAG: Searching for protocols relevant to: {sitrep[:50]}...", file=sys.stderr)

      # RETRIEVAL LOGIC
      if any(x in sitrep for x in ["collapse", "structural", "debris", "vibration"]):
          key = "STRUCTURAL"
      elif any(x in sitrep for x in ["leak", "chemical", "toxic", "gas", "fumes"]):
          key = "CHEMICAL"
      elif any(x in sitrep for x in ["traffic", "collision", "vehicle", "crash", "highway"]):
          key = "TRAFFIC"
      else:
          key = "DEFAULT"

      print(f"RAG: Match found -> {key}", file=sys.stderr)
      
      # OUTPUT
      print(protocols[key])

  # ---------------------------------------------------------
  # STEP 3: DECISION ENGINE
  # ---------------------------------------------------------
  - id: 3_ai_decision_maker
    type: io.kestra.plugin.googleworkspace.gemini.Chat
    apiKey: "{{ secret('GEMINI_API_KEY') }}"
    model: "gemini-2.5-flash"
    prompt: |
      ACT AS INCIDENT COMMANDER.
      
      SITUATION: {{ outputs.1_summarize_telemetry.response.text }}
      
      MANDATORY PROTOCOL:
      {{ outputs.2_rag_retrieval.stdOut }}
      
      TASK:
      1. Declare Severity (LOW/MEDIUM/HIGH/CRITICAL).
      2. List Resources to dispatch.
      
      RETURN JSON ONLY: {"severity": "...", "resources": [...]}

  # ---------------------------------------------------------
  # STEP 4: EXECUTION BRANCHING
  # ---------------------------------------------------------
  - id: 4_parse_json
    type: io.kestra.plugin.core.json.JsonReader
    from: "{{ outputs.3_ai_decision_maker.response.text }}"

  - id: 5_dispatch_resources
    type: io.kestra.plugin.core.flow.Switch
    value: "{{ outputs.4_parse_json.output.severity }}"
    cases:
      CRITICAL:
        - id: alert_national_guard
          type: io.kestra.plugin.scripts.shell.Commands
          commands:
            - ./deploy_assets.sh --level=CRITICAL --target="{{ vars.target_location }}"
      HIGH:
        - id: alert_emergency_services
          type: io.kestra.plugin.notifications.slack.Post
          url: "{{ secret('SLACK_WEBHOOK') }}"
          text: "DEPLOYING FOR {{ vars.target_location }}"
      default:
        - id: log_monitor
          type: io.kestra.plugin.core.log.Log
          message: "Situation monitoring active for {{ vars.target_location }}"
`;
};