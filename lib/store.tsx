"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import {
  INITIAL_CASE,
  INITIAL_EVENTS,
  INITIAL_ALERTS,
  INITIAL_TELEMETRY,
  INITIAL_OFFLINE,
  INITIAL_ISCHEMIA_MIN,
  type CaseSnapshot,
  type CustodyEvent,
  type AlertItem,
  type TelemetryPoint,
  type OfflineRecord,
  type EventName,
  type Role,
} from "./case-data"

// Marca de tiempo virtual de inicio del reloj de isquemia.
// El reloj corre en vivo: cada segundo real avanza la isquemia.
function genHash() {
  const hex = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0")
  return `0x${hex.slice(0, 4)}…${hex.slice(4)}`
}

function nowTime() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

interface StoreValue {
  role: Role
  setRole: (r: Role) => void
  caseData: CaseSnapshot
  events: CustodyEvent[]
  alerts: AlertItem[]
  telemetry: TelemetryPoint[]
  offline: OfflineRecord[]
  // reloj de isquemia (en segundos, corriendo en vivo)
  ischemiaSeconds: number
  // acciones
  addEvent: (event: EventName, opts?: { actor?: string; org?: string }) => void
  updateCase: (patch: Partial<CaseSnapshot>) => void
  acknowledgeAlert: (id: string) => void
  pushAlert: (a: Omit<AlertItem, "id" | "time" | "acknowledged">) => void
  simulateReading: () => void
  syncOffline: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("coordinador")
  const [caseData, setCaseData] = useState<CaseSnapshot>(INITIAL_CASE)
  const [events, setEvents] = useState<CustodyEvent[]>(INITIAL_EVENTS)
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS)
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(INITIAL_TELEMETRY)
  const [offline, setOffline] = useState<OfflineRecord[]>(INITIAL_OFFLINE)

  // Reloj de isquemia en vivo (cuenta hacia adelante, en segundos)
  const [ischemiaSeconds, setIschemiaSeconds] = useState(INITIAL_ISCHEMIA_MIN * 60)

  useEffect(() => {
    const id = setInterval(() => {
      setIschemiaSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const addEvent = useCallback<StoreValue["addEvent"]>((event, opts) => {
    setEvents((prev) => {
      const prevHash = prev.length ? prev[prev.length - 1].hash : "0x0000…0000"
      const hash = genHash()
      const next: CustodyEvent = {
        id: `EVT-${String(prev.length + 1).padStart(2, "0")}`,
        event,
        time: nowTime(),
        actor: opts?.actor ?? "INTEGRA",
        org: opts?.org ?? "INTEGRA",
        txId: `tx_${hash.replace(/0x|…/g, "")}`,
        prevHash,
        hash,
        status: "VALID",
      }
      return [...prev, next]
    })
  }, [])

  const updateCase = useCallback<StoreValue["updateCase"]>((patch) => {
    setCaseData((prev) => ({ ...prev, ...patch }))
  }, [])

  const acknowledgeAlert = useCallback<StoreValue["acknowledgeAlert"]>((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)))
  }, [])

  const pushAlert = useCallback<StoreValue["pushAlert"]>((a) => {
    setAlerts((prev) => [
      { ...a, id: `ALR-${Date.now()}`, time: nowTime(), acknowledged: false },
      ...prev,
    ])
  }, [])

  const simulateReading = useCallback(async () => {
    try {
      // Usar la IA genérica (o mock local) a través de la API
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elapsedTimeMin: 0, // podrías calcularlo desde ischemiaSeconds / 60
          currentInternalTemp: caseData.tempInternal,
          currentExternalTemp: caseData.tempExternal,
          batteryLevel: caseData.battery,
          gpsActive: caseData.gpsActive,
        }),
      });

      if (!res.ok) throw new Error("Error en simulacion de IA");

      const result = await res.json();

      setCaseData((prev) => ({ 
        ...prev, 
        tempInternal: result.newInternalTemp, 
        tempExternal: result.newExternalTemp, 
        battery: result.newBatteryLevel 
      }));

      setTelemetry((prev) => {
        const t = nowTime();
        return [
          ...prev.slice(-11),
          {
            t,
            internal: result.newInternalTemp,
            external: result.newExternalTemp,
          },
        ];
      });

      addEvent("IOT_READING_RECEIVED", { actor: "DEVICE-001 (IA)", org: "Sensor IoT" });

      if (result.hasAnomaly) {
        pushAlert({
          code: "ANOMALY_WARNING",
          level: "danger",
          title: "Anomalía detectada",
          detail: result.anomalyDescription || "Posible riesgo en tránsito",
        });
        addEvent("ANOMALY_WARNING", { actor: "AI-MODEL", org: "INTEGRA" });
      }
    } catch (err) {
      console.error(err);
    }
  }, [caseData, addEvent, pushAlert]);

  const syncOffline = useCallback(() => {
    setOffline((prev) => prev.map((r) => ({ ...r, synced: true })))
    addEvent("OFFLINE_GAP_CLOSED", { actor: "DEVICE-001", org: "Sensor IoT" })
  }, [addEvent])

  const value = useMemo<StoreValue>(
    () => ({
      role,
      setRole,
      caseData,
      events,
      alerts,
      telemetry,
      offline,
      ischemiaSeconds,
      addEvent,
      updateCase,
      acknowledgeAlert,
      pushAlert,
      simulateReading,
      syncOffline,
    }),
    [
      role,
      caseData,
      events,
      alerts,
      telemetry,
      offline,
      ischemiaSeconds,
      addEvent,
      updateCase,
      acknowledgeAlert,
      pushAlert,
      simulateReading,
      syncOffline,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider")
  return ctx
}
