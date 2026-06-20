export type Role = "coordinador" | "transportador" | "hospital" | "auditor"

export interface RoleInfo {
  id: Role
  label: string
  short: string
  title: string
  description: string
}

export const ROLES: RoleInfo[] = [
  {
    id: "coordinador",
    label: "Coordinador / Operador INTEGRA",
    short: "Coordinación",
    title: "Coordinador — Control del traslado renal",
    description: "Controla y supervisa el flujo de traslado del caso.",
  },
  {
    id: "transportador",
    label: "Transportador / Logística",
    short: "Transporte",
    title: "Transportador — Custodia en ruta",
    description: "Custodia operativa del órgano durante la ruta.",
  },
  {
    id: "hospital",
    label: "Hospital Receptor",
    short: "Recepción",
    title: "Hospital Receptor — Verificación y recepción",
    description: "Verifica las condiciones del órgano antes de recibirlo.",
  },
  {
    id: "auditor",
    label: "Auditor Externo",
    short: "Auditoría",
    title: "Auditor Externo — Evidencia e integridad",
    description: "Revisa evidencia, integridad y eventos de custodia.",
  },
]

export type CaseStatus =
  | "Preparado"
  | "Creado"
  | "En traslado"
  | "Recibido"
  | "Cerrado"

export type CustodyStatus = "Pendiente" | "Activa" | "Recepción confirmada"

export type EvidenceStatus = "VALID" | "BROKEN" | "pending"

export type Source = "SIMULATED_SENSOR" | "REAL_SENSOR"

export interface CaseSnapshot {
  caseId: string
  organ: string
  origin: string
  originCity: string
  destination: string
  destinationCity: string
  currentLocation: string
  containerId: string
  deviceId: string
  status: CaseStatus
  custodyStatus: CustodyStatus
  tempInternal: number
  tempExternal: number
  battery: number
  gpsActive: boolean
  connectivity: string
  source: Source
  ischemiaWindowMin: number // límite clínico (36h)
  ischemiaTargetMin: number // ventana óptima (24h)
  eta: string
  evidenceStatus: EvidenceStatus
  deviceAuthorized: boolean
  sealStatus: string
  coldChain: string
  routeProgress: number // 0-100
}

// 06h 18m ya transcurridos al iniciar la demo
export const INITIAL_ISCHEMIA_MIN = 6 * 60 + 18
export const ISCHEMIA_WINDOW_MIN = 36 * 60 // 36h límite
export const ISCHEMIA_TARGET_MIN = 24 * 60 // 24h objetivo

export const INITIAL_CASE: CaseSnapshot = {
  caseId: "KIDNEY-ARG-001",
  organ: "Riñón",
  origin: "Hospital Donante — Buenos Aires",
  originCity: "Buenos Aires",
  destination: "Hospital Receptor — Córdoba",
  destinationCity: "Córdoba",
  currentLocation: "Hospital Donante",
  containerId: "CONT-001",
  deviceId: "DEVICE-001",
  status: "Preparado",
  custodyStatus: "Pendiente",
  tempInternal: 3.2,
  tempExternal: 18.7,
  battery: 100,
  gpsActive: true,
  connectivity: "MQTT Online",
  source: "SIMULATED_SENSOR",
  ischemiaWindowMin: ISCHEMIA_WINDOW_MIN,
  ischemiaTargetMin: ISCHEMIA_TARGET_MIN,
  eta: "14:45",
  evidenceStatus: "pending",
  deviceAuthorized: false,
  sealStatus: "Intacto",
  coldChain: "Íntegra",
  routeProgress: 0,
}

export type EventName =
  | "CASE_CREATED"
  | "DEVICE_LINKED"
  | "TRANSPORT_STARTED"
  | "IOT_READING_RECEIVED"
  | "TEMP_CRITICAL"
  | "ANOMALY_WARNING"
  | "OFFLINE_GAP_CLOSED"
  | "CUSTODY_RECEIVED"
  | "CASE_CLOSED"
  | "AUDIT_VERIFIED"
  | "EVIDENCE_VERIFIED"

export interface CustodyEvent {
  id: string
  event: EventName
  time: string
  actor: string
  org: string
  txId: string
  prevHash: string
  hash: string
  status: EvidenceStatus
}

export const INITIAL_EVENTS: CustodyEvent[] = []

export type AlertLevel = "info" | "warn" | "danger"

export interface AlertItem {
  id: string
  code: "TEMP_CRITICAL" | "ANOMALY_WARNING" | "OFFLINE_GAP_CLOSED" | "GPS_LOST" | "BATTERY_LOW"
  level: AlertLevel
  title: string
  detail: string
  time: string
  acknowledged: boolean
}

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "ALR-00",
    code: "OFFLINE_GAP_CLOSED",
    level: "info",
    title: "Brecha offline cerrada",
    detail: "Buffer local reenviado tras paso por zona sin señal. 3 lecturas sincronizadas.",
    time: "09:33",
    acknowledged: true,
  },
]

export interface TelemetryPoint {
  t: string
  internal: number
  external: number
}

export const INITIAL_TELEMETRY: TelemetryPoint[] = [
  { t: "09:05", internal: 3.0, external: 17.9 },
  { t: "09:12", internal: 3.1, external: 18.1 },
  { t: "09:19", internal: 3.0, external: 18.4 },
  { t: "09:26", internal: 3.2, external: 18.6 },
  { t: "09:33", internal: 3.3, external: 18.8 },
  { t: "09:40", internal: 3.1, external: 18.7 },
  { t: "09:47", internal: 3.2, external: 18.7 },
]

export interface OfflineRecord {
  id: string
  time: string
  payload: string
  synced: boolean
}

export const INITIAL_OFFLINE: OfflineRecord[] = [
  { id: "OFF-01", time: "09:33:05", payload: "GPS-LOSS / temp=3.3 / batt=83", synced: true },
  { id: "OFF-02", time: "09:33:22", payload: "GPS-LOSS / temp=3.3 / batt=83", synced: true },
  { id: "OFF-03", time: "09:33:41", payload: "GPS-RECOVER / temp=3.2 / batt=82", synced: true },
  { id: "OFF-04", time: "09:54:10", payload: "HEARTBEAT / temp=3.2 / batt=82", synced: false },
]

export const EVENT_LABEL: Record<EventName, string> = {
  CASE_CREATED: "Caso creado",
  DEVICE_LINKED: "Dispositivo vinculado",
  TRANSPORT_STARTED: "Traslado iniciado",
  IOT_READING_RECEIVED: "Lectura IoT recibida",
  TEMP_CRITICAL: "Temperatura crítica",
  ANOMALY_WARNING: "Anomalía detectada (IA)",
  OFFLINE_GAP_CLOSED: "Brecha offline cerrada",
  CUSTODY_RECEIVED: "Custodia recibida",
  CASE_CLOSED: "Caso cerrado",
  AUDIT_VERIFIED: "Auditoría verificada",
  EVIDENCE_VERIFIED: "Evidencia verificada",
}
