// ─── Roles ───────────────────────────────────────────────────────────────────
export type RoleActor = "incucai" | "hospital" | "auditor" | "iot" | "itprov"
export type Scenario  = "normal"  | "insider"  | "ransomware"

// Keep Role as alias for backward-compat imports
export type Role = RoleActor

export interface RoleInfo {
  id: RoleActor
  label: string
  short: string
  org: string
  color: string
  method: string
  note: string
}

export const ROLES: RoleInfo[] = [
  {
    id: "incucai",
    label: "Coordinador Nacional",
    short: "INCUCAI",
    org: "INCUCAI",
    color: "#4fb8c4",
    method: "Certificado X.509 institucional + MFA (token TOTP)",
    note: "Certificado raíz emitido por la Root CA nacional (INCUCAI). Requiere segundo factor en cada sesión.",
  },
  {
    id: "hospital",
    label: "Hospital Receptor",
    short: "Hospital",
    org: "INSTITUCIÓN TRASPLANTADORA",
    color: "#79cf9c",
    method: "Certificado de organización (Org CA) + mTLS",
    note: "Identidad de nodo peer emitida por la CA intermedia del hospital receptor.",
  },
  {
    id: "auditor",
    label: "Auditor Externo",
    short: "Auditoría",
    org: "CONTRALORÍA / ENTE REGULADOR",
    color: "#cfa25e",
    method: "Certificado de solo lectura, atributo audit=true + expiración",
    note: "Lectura total del ledger, ventana de tiempo limitada. Sin escritura.",
  },
  {
    id: "iot",
    label: "Dispositivo IoT",
    short: "IoT",
    org: "CONTENEDOR DE TRANSPORTE",
    color: "#8b9dff",
    method: "Certificado de dispositivo (IoT CA) + TLS mutuo, TTL 72h",
    note: "Sin login humano — el dispositivo se autentica solo con su certificado de dispositivo.",
  },
  {
    id: "itprov",
    label: "Proveedor IT",
    short: "IT",
    org: "MANTENIMIENTO TERCERIZADO",
    color: "#93a4b3",
    method: "Sin certificado propio — acceso cero por defecto",
    note: "Todo acceso pasa por PAM con grabación de sesión. Nunca ve datos clínicos ni de pacientes.",
  },
]

// ─── Case Snapshot ────────────────────────────────────────────────────────────
export type CaseStatus    = "Preparado" | "En traslado" | "Recibido" | "Cerrado"
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
  ischemiaWindowHours: number
  ischemiaTargetHours: number
  eta: string
  evidenceStatus: EvidenceStatus
  deviceAuthorized: boolean
  sealStatus: string
  coldChain: string
  routeProgress: number // 0-100
}

// ─── Simulation constants ─────────────────────────────────────────────────────
export const ISCHEMIA_WINDOW_HOURS  = 36
export const ISCHEMIA_TARGET_HOURS  = 24
export const ISCHEMIA_ALERT_HOURS   = 20
export const SIM_DURATION_HOURS     = 34

export const INITIAL_CASE: CaseSnapshot = {
  caseId: "AR-2024-0102",
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
  ischemiaWindowHours: ISCHEMIA_WINDOW_HOURS,
  ischemiaTargetHours: ISCHEMIA_TARGET_HOURS,
  eta: "14:45",
  evidenceStatus: "pending",
  deviceAuthorized: false,
  sealStatus: "Intacto",
  coldChain: "Íntegra",
  routeProgress: 0,
}

// ─── Events ───────────────────────────────────────────────────────────────────
export type EventName =
  | "CASE_CREATED"
  | "COMPATIBILITY_MATCH"
  | "ASSIGNMENT_PENDING"
  | "ASSIGNMENT_SIGNED_INCUCAI"
  | "ASSIGNMENT_SIGNED_HOSPITAL"
  | "DEVICE_LINKED"
  | "TRANSPORT_STARTED"
  | "IOT_READING_RECEIVED"
  | "TEMP_WARNING"
  | "TEMP_CRITICAL"
  | "ANOMALY_WARNING"
  | "AI_ANOMALY_DETECTED"
  | "OFFLINE_GAP_CLOSED"
  | "CUSTODY_RECEIVED"
  | "CASE_CLOSED"
  | "AUDIT_VERIFIED"
  | "EVIDENCE_VERIFIED"
  | "WAITING_LIST_TAMPER_ATTEMPT"
  | "ASSIGNMENT_ENDORSED"
  | "RANSOMWARE_NODE_ISOLATED"
  | "RANSOMWARE_NODE_RESTORED"

export const EVENT_LABEL: Record<EventName, string> = {
  CASE_CREATED:               "Caso creado",
  COMPATIBILITY_MATCH:        "Match de compatibilidad ejecutado",
  ASSIGNMENT_PENDING:         "Contrato de asignación generado",
  ASSIGNMENT_SIGNED_INCUCAI:  "Firma INCUCAI registrada",
  ASSIGNMENT_SIGNED_HOSPITAL: "Firma Hospital registrada",
  DEVICE_LINKED:              "Dispositivo IoT vinculado",
  TRANSPORT_STARTED:          "Traslado iniciado",
  IOT_READING_RECEIVED:       "Lectura IoT recibida",
  TEMP_WARNING:               "Temperatura en zona de alerta",
  TEMP_CRITICAL:              "Temperatura crítica",
  ANOMALY_WARNING:            "Anomalía detectada (IA)",
  AI_ANOMALY_DETECTED:        "Comportamiento anómalo detectado (IA)",
  OFFLINE_GAP_CLOSED:         "Brecha offline cerrada",
  CUSTODY_RECEIVED:           "Custodia recibida por hospital",
  CASE_CLOSED:                "Caso cerrado",
  AUDIT_VERIFIED:             "Auditoría completada",
  EVIDENCE_VERIFIED:          "Evidencia verificada",
  WAITING_LIST_TAMPER_ATTEMPT: "Intento de manipulación de asignación",
  ASSIGNMENT_ENDORSED:        "Contrato de asignación endosado",
  RANSOMWARE_NODE_ISOLATED:   "Nodo aislado — actividad de cifrado detectada",
  RANSOMWARE_NODE_RESTORED:   "Nodo restaurado desde backup offline",
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
export type AlertLevel = "info" | "warn" | "danger"

export interface TimelineEvent {
  id: string
  tHours: number                   // simulation hour when this fires
  event: EventName
  scenarios: Scenario[]            // which scenarios include this event
  visibleTo: RoleActor[]           // which roles see this event in their feed
  actor: string
  org: string
  status: EvidenceStatus
  techDetail: string               // INCUCAI / Auditor feed text
  plainDetail: string              // Hospital plain-language text
  isAlert: boolean
  alertLevel?: AlertLevel
  alertTitle?: string
  // gate flags — if true, this event requires a manual click from that role
  needsIncucaiClick?: boolean
  needsHospitalClick?: boolean
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "T0.00-CASE_CREATED",
    tHours: 0,
    event: "CASE_CREATED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "auditor"],
    actor: "Coord. L. Pérez",
    org: "INCUCAI",
    status: "VALID",
    techDetail: "Caso AR-2024-0102 registrado. Donante HLA tipificado. Bloque génesis del ledger inicializado.",
    plainDetail: "",
    isAlert: false,
  },
  {
    id: "T0.25-COMPATIBILITY_MATCH",
    tHours: 0.25,
    event: "COMPATIBILITY_MATCH",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "auditor"],
    actor: "Sistema SINTRA",
    org: "INCUCAI",
    status: "VALID",
    techDetail: "Match HLA 6/6 loci. Paciente PAT-001 seleccionado. Score compatibilidad: 98/100.",
    plainDetail: "",
    isAlert: false,
  },
  {
    id: "T0.50-ASSIGNMENT_PENDING",
    tHours: 0.5,
    event: "ASSIGNMENT_PENDING",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "hospital", "auditor"],
    actor: "Sistema INTEGRA",
    org: "INCUCAI",
    status: "VALID",
    techDetail: "Contrato AR-CONTRACT-001 generado. Endorsement policy: requiere firma INCUCAI + Hospital Receptor.",
    plainDetail: "El riñón fue asignado a su paciente. Aguardando confirmación de ambas partes.",
    isAlert: false,
  },
  {
    id: "T1.00-ASSIGNMENT_SIGNED_INCUCAI",
    tHours: 1.0,
    event: "ASSIGNMENT_SIGNED_INCUCAI",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "auditor"],
    actor: "Coord. L. Pérez",
    org: "INCUCAI",
    status: "VALID",
    techDetail: "Firma ECDSA-256 INCUCAI registrada en ledger. TxId: auto-generado.",
    plainDetail: "",
    isAlert: false,
    needsIncucaiClick: true,  // if logged as incucai, requires manual click
  },
  {
    id: "T1.25-ASSIGNMENT_SIGNED_HOSPITAL",
    tHours: 1.25,
    event: "ASSIGNMENT_SIGNED_HOSPITAL",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["hospital", "incucai", "auditor"],
    actor: "Dr. M. Torres",
    org: "Hospital Receptor — Córdoba",
    status: "VALID",
    techDetail: "Firma mTLS Hospital Receptor registrada. Contrato AR-CONTRACT-001 en estado ISSUED.",
    plainDetail: "El hospital confirmó la recepción del caso. Las dos firmas están completas.",
    isAlert: false,
    needsHospitalClick: true,  // if logged as hospital, requires manual click
  },
  {
    id: "T1.50-DEVICE_LINKED",
    tHours: 1.5,
    event: "DEVICE_LINKED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "iot", "auditor"],
    actor: "DEVICE-001",
    org: "Sensor IoT",
    status: "VALID",
    techDetail: "Certificado IoT CA validado. TTL: 72h. TLS mutuo establecido con peer INCUCAI.",
    plainDetail: "",
    isAlert: false,
  },
  {
    id: "T2.00-TRANSPORT_STARTED",
    tHours: 2.0,
    event: "TRANSPORT_STARTED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "hospital", "iot", "auditor"],
    actor: "Transp. J. Ramírez",
    org: "Logística Norte",
    status: "VALID",
    techDetail: "Custodia activa. Telemetría IoT iniciada. GPS: -34.6037, -58.3816.",
    plainDetail: "El riñón salió del hospital donante. El traslado está en camino.",
    isAlert: false,
  },
  {
    id: "T4.00-IOT_READING",
    tHours: 4.0,
    event: "IOT_READING_RECEIVED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "iot", "auditor"],
    actor: "DEVICE-001",
    org: "Sensor IoT",
    status: "VALID",
    techDetail: "Temp. interna: 3.4°C · Temp. externa: 19.1°C · Batería: 96% · Firma ECDSA OK.",
    plainDetail: "",
    isAlert: false,
  },
  {
    id: "T4.10-TEMP_WARNING",
    tHours: 4.1,
    event: "TEMP_WARNING",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "hospital", "auditor"],
    actor: "DEVICE-001",
    org: "Sensor IoT",
    status: "VALID",
    techDetail: "Temperatura interna superó 3.8°C. Z-Score: 1.8σ. Tendencia ascendente, dentro de rango (2–8°C).",
    plainDetail: "Leve aumento de temperatura registrado. Todo dentro de los parámetros normales.",
    isAlert: true,
    alertLevel: "warn",
    alertTitle: "Temperatura en zona de alerta",
  },
  {
    id: "T8.00-AI_ANOMALY",
    tHours: 8.0,
    event: "AI_ANOMALY_DETECTED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "auditor"],
    actor: "Motor de IA — INTEGRA",
    org: "INCUCAI",
    status: "VALID",
    techDetail: "Acceso a registros de compatibilidad fuera de horario habitual (02:14 hs). Credenciales válidas. Desviación estadística 3.2σ respecto al patrón habitual del usuario. No hay regla fija violada.",
    plainDetail: "",
    isAlert: true,
    alertLevel: "warn",
    alertTitle: "Comportamiento anómalo detectado por IA",
  },
  {
    id: "T10.00-INSIDER_TAMPER",
    tHours: 10.0,
    event: "WAITING_LIST_TAMPER_ATTEMPT",
    scenarios: ["insider", "ransomware"],
    visibleTo: ["incucai", "auditor"],
    actor: "Coord. R. Silva (acceso no autorizado)",
    org: "INCUCAI",
    status: "BROKEN",
    techDetail: "TX RECHAZADA: intento de modificar posición en lista de espera directamente. Endorsement policy viola (requiere 2 orgs distintas). TxId: tx_REJECTED_0x4f2a.",
    plainDetail: "",
    isAlert: true,
    alertLevel: "danger",
    alertTitle: "Intento de manipulación de lista de espera — BLOQUEADO",
  },
  {
    id: "T12.00-RANSOMWARE_ISOLATED",
    tHours: 12.0,
    event: "RANSOMWARE_NODE_ISOLATED",
    scenarios: ["ransomware"],
    visibleTo: ["incucai", "hospital", "auditor", "itprov"],
    actor: "Sistema INTEGRA — Red Raft",
    org: "INCUCAI",
    status: "BROKEN",
    techDetail: "Actividad de cifrado detectada en peer0.hospitaldona. Nodo aislado automáticamente por política de red. Orderer Raft continúa con peers redundantes. Sin punto único de fallo.",
    plainDetail: "Se detectó un incidente técnico en el hospital donante. El sistema INTEGRA continuó operando con normalidad.",
    isAlert: true,
    alertLevel: "danger",
    alertTitle: "Nodo aislado — actividad de cifrado detectada",
  },
  {
    id: "T12.25-RANSOMWARE_RESTORED",
    tHours: 12.25,
    event: "RANSOMWARE_NODE_RESTORED",
    scenarios: ["ransomware"],
    visibleTo: ["incucai", "hospital", "auditor", "itprov"],
    actor: "IT Prov — Backup Team",
    org: "Proveedor IT",
    status: "VALID",
    techDetail: "peer0.hospitaldona restaurado desde backup offline (RTO: 15 min). Resincronización Raft completada. Bloque #14983 verificado.",
    plainDetail: "El incidente técnico fue resuelto. El sistema funciona con normalidad.",
    isAlert: true,
    alertLevel: "info",
    alertTitle: "Nodo restaurado desde backup offline",
  },
  {
    id: "T20.00-TEMP_CRITICAL",
    tHours: 20.0,
    event: "TEMP_CRITICAL",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "hospital", "auditor", "iot"],
    actor: "DEVICE-001",
    org: "Sensor IoT",
    status: "VALID",
    techDetail: "Umbral de 20h alcanzado. Temp. interna: 4.2°C. Isquemia en zona de alerta. Se recomienda aceleración de entrega.",
    plainDetail: "El riñón lleva 20 horas en traslado. La temperatura está siendo monitoreada de cerca.",
    isAlert: true,
    alertLevel: "danger",
    alertTitle: "Umbral de 20h alcanzado — isquemia en zona de alerta",
  },
  {
    id: "T28.00-CUSTODY_RECEIVED",
    tHours: 28.0,
    event: "CUSTODY_RECEIVED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "hospital", "auditor"],
    actor: "Dr. M. Torres",
    org: "Hospital Receptor — Córdoba",
    status: "VALID",
    techDetail: "Custodia física transferida. Cadena de frío verificada. Hash de recepción firmado por Hospital Receptor.",
    plainDetail: "El riñón llegó al hospital. Cadena de frío verificada. Recepción confirmada.",
    isAlert: false,
  },
  {
    id: "T30.00-CASE_CLOSED",
    tHours: 30.0,
    event: "CASE_CLOSED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["incucai", "auditor"],
    actor: "Coord. L. Pérez",
    org: "INCUCAI",
    status: "VALID",
    techDetail: "Caso AR-2024-0102 cerrado. Trasplante completado exitosamente. Evidencia sellada en ledger.",
    plainDetail: "",
    isAlert: false,
  },
  {
    id: "T34.00-AUDIT_VERIFIED",
    tHours: 34.0,
    event: "AUDIT_VERIFIED",
    scenarios: ["normal", "insider", "ransomware"],
    visibleTo: ["auditor"],
    actor: "Auditor Ext. — ANMAT",
    org: "Contraloría",
    status: "VALID",
    techDetail: "Cadena de custodia auditada. Todos los hashes verificados. Certificado de integridad emitido.",
    plainDetail: "",
    isAlert: false,
  },
]

// ─── Custody Events (ledger) ───────────────────────────────────────────────────
export interface CustodyEvent {
  id: string
  event: EventName
  tHours: number          // simulation hour
  time: string            // human-readable HH:MM
  actor: string
  org: string
  txId: string
  prevHash: string
  hash: string
  status: EvidenceStatus
  plainText?: string      // for hospital plain mode
  visibleTo?: RoleActor[] // for role-based filtering
}

export const INITIAL_EVENTS: CustodyEvent[] = []

// ─── Alerts ───────────────────────────────────────────────────────────────────
export type AlertCode =
  | "TEMP_CRITICAL"
  | "TEMP_WARNING"
  | "ANOMALY_WARNING"
  | "AI_ANOMALY_DETECTED"
  | "OFFLINE_GAP_CLOSED"
  | "GPS_LOST"
  | "BATTERY_LOW"
  | "WAITING_LIST_TAMPER_ATTEMPT"
  | "RANSOMWARE_NODE_ISOLATED"
  | "RANSOMWARE_NODE_RESTORED"

export interface AlertItem {
  id: string
  code: AlertCode
  level: AlertLevel
  title: string
  detail: string
  plainDetail?: string      // hospital-friendly text
  time: string
  acknowledged: boolean
  visibleTo?: RoleActor[]   // if undefined → visible to all
}

export const INITIAL_ALERTS: AlertItem[] = []

// ─── Telemetry ────────────────────────────────────────────────────────────────
export interface TelemetryPoint {
  t: string
  tHours: number
  internal: number
  external: number
}

export const INITIAL_TELEMETRY: TelemetryPoint[] = [
  { t: "T+0h", tHours: 0,    internal: 3.2, external: 18.7 },
  { t: "T+1h", tHours: 1,    internal: 3.1, external: 18.5 },
  { t: "T+2h", tHours: 2,    internal: 3.0, external: 18.9 },
  { t: "T+3h", tHours: 3,    internal: 3.3, external: 19.0 },
  { t: "T+4h", tHours: 4,    internal: 3.5, external: 19.1 },
]

// ─── Offline buffer ───────────────────────────────────────────────────────────
export interface OfflineRecord {
  id: string
  time: string
  payload: string
  synced: boolean
}

export const INITIAL_OFFLINE: OfflineRecord[] = [
  { id: "OFF-01", time: "T+3h33m", payload: "GPS-LOSS / temp=3.3 / batt=96", synced: true },
  { id: "OFF-02", time: "T+3h34m", payload: "GPS-LOSS / temp=3.3 / batt=96", synced: true },
  { id: "OFF-03", time: "T+3h35m", payload: "GPS-RECOVER / temp=3.2 / batt=95", synced: false },
]

// ─── Waiting list ─────────────────────────────────────────────────────────────
export interface WaitingListEntry {
  id: string
  patientName: string
  compatibilityScore: number
  urgencyLevel: "ALTA" | "MEDIA" | "CRITICA"
  position: number
  assignedOrganId?: string
}

export const INITIAL_WAITING_LIST: WaitingListEntry[] = [
  { id: "PAT-001", patientName: "Carlos Gómez (ID: 4821)", compatibilityScore: 98, urgencyLevel: "CRITICA", position: 1, assignedOrganId: "AR-2024-0102" },
  { id: "PAT-002", patientName: "María Rodríguez (ID: 9102)", compatibilityScore: 92, urgencyLevel: "ALTA",   position: 2 },
  { id: "PAT-003", patientName: "Juan Martínez (ID: 3341)",  compatibilityScore: 87, urgencyLevel: "MEDIA",  position: 3 },
  { id: "PAT-004", patientName: "Ana López (ID: 7729)",      compatibilityScore: 84, urgencyLevel: "MEDIA",  position: 4 },
]

// ─── Assignment Contract ──────────────────────────────────────────────────────
export type ContractStatus =
  | "NOT_STARTED"
  | "PENDING_BOTH"
  | "PENDING_HOSPITAL"
  | "PENDING_INCUCAI"
  | "ISSUED"
  | "REJECTED"

export interface AssignmentSigs {
  incucai: boolean
  hospital: boolean
}

export interface AssignmentContract {
  id: string
  selectedPatientId: string
  status: ContractStatus
  sigs: AssignmentSigs
  requestedBy: string
  tamperAttemptCount: number
}

export const INITIAL_ASSIGNMENT_CONTRACT: AssignmentContract = {
  id: "AR-CONTRACT-001",
  selectedPatientId: "PAT-001",
  status: "NOT_STARTED",
  sigs: { incucai: false, hospital: false },
  requestedBy: "Sistema INTEGRA",
  tamperAttemptCount: 0,
}

// Helper to derive contract status from sigs
export function deriveContractStatus(
  sigs: AssignmentSigs,
  reached: boolean,
): ContractStatus {
  if (!reached) return "NOT_STARTED"
  if (sigs.incucai && sigs.hospital) return "ISSUED"
  if (sigs.incucai && !sigs.hospital) return "PENDING_HOSPITAL"
  if (!sigs.incucai && sigs.hospital) return "PENDING_INCUCAI"
  return "PENDING_BOTH"
}
