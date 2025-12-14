export const INITIAL_INCIDENTS = [
  {
    id: 'INC-2025-001',
    timestamp: '10:42:15',
    location: 'Sector 4 - Downtown Metro',
    description: 'Structural collapse at central station.',
    rawTelemetry: `[SYSTEM_LOG_V4] SOURCE: STRUCTURAL_MONITOR_04
> VIBRATION_SENSOR_X: 8.4 (CRITICAL)
> DUST_PARTICLE_PM2.5: 4500 (HAZARDOUS)
> AUDIO_INPUT: "Help... trapped... falling debris..."
> THERMAL_CAM_02: MULTIPLE_HEAT_SIGNATURES_DETECTED_UNDER_RUBBLE`,
    severity: 'CRITICAL',
    status: 'PENDING'
  },
  {
    id: 'INC-2025-002',
    timestamp: '10:45:30',
    location: 'Sector 7 - Industrial Zone',
    description: 'Chemical leak detected.',
    rawTelemetry: `[IOT_SENSOR_NET_7]
{ "sensor_id": "CHEM_44", "type": "CHLORINE", "ppm": 450, "threshold": 50 }
{ "wind_direction": "SE", "wind_speed": "12km/h", "impact_zone": "RESIDENTIAL_BLOCK_B" }
ALERT: TOXICITY_LEVEL_EXCEEDS_SAFETY_LIMITS`,
    severity: 'HIGH',
    status: 'PENDING'
  },
  {
    id: 'INC-2025-003',
    timestamp: '10:48:10',
    location: 'Sector 2 - North Highway',
    description: 'Traffic collision.',
    rawTelemetry: `[TRAFFIC_CAM_NET]
EVENT: COLLISION_DETECTED
VEHICLES: 3
LANE_STATUS: BLOCKED_ALL_LANES
INJURY_PROBABILITY: MODERATE
AIRBAG_DEPLOYMENT: CONFIRMED_VEHICLE_1`,
    severity: 'MEDIUM',
    status: 'PENDING'
  }
];

// RAG DATA: "Proprietary" protocols to ground the AI model
export const EMERGENCY_PROTOCOLS = {
  STRUCTURAL: `PROTOCOL-ALPHA-9: STRUCTURAL FAILURE
1. Establish 500m exclusion zone.
2. Cut gas/power to grid sector.
3. Deploy seismic sensors before personnel entry.
4. Priority: Stabilization over rapid extraction.`,
  
  CHEMICAL: `PROTOCOL-HAZMAT-4: TOXIC RELEASE
1. Determine wind vector immediately.
2. Issue shelter-in-place order for downwind sectors.
3. Deploy autonomous sniffers (no humans in red zone).
4. Prepare decontamination showers at perimeter.`,
  
  TRAFFIC: `PROTOCOL-TRAFFIC-1: HIGHWAY OBSTRUCTION
1. Re-route autonomous traffic grid.
2. Deploy drone airspace clearing.
3. Dispatch rapid medical response unit.
4. Clear wreckage within 45 mins to restore flow.`,
  
  DEFAULT: `PROTOCOL-STD-0: GENERAL RESPONSE
1. Assess scene safety.
2. Triage casualties.
3. Notify central command.
4. Await further instructions.`
};

export const SYSTEM_INSTRUCTION = `
You are the brain of ResQ-AI, an autonomous disaster response agent.
Your input will be a raw distress signal description AND a specific Safety Protocol.

Your task is to:
1. SUMMARIZE the core threat.
2. ANALYZE the severity.
3. DETERMINE resources based on the PROTOCOL provided.
4. Provide a rationale that EXPLICITLY QUOTES the protocol used.

Output strictly in JSON format:
{
  "summary": "...",
  "severity": "...",
  "resources": ["...", "..."],
  "rationale": "..."
}
`;