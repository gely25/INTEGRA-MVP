"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react"
import {
  INITIAL_CASE,
  INITIAL_EVENTS,
  INITIAL_ALERTS,
  INITIAL_TELEMETRY,
  INITIAL_OFFLINE,
  INITIAL_WAITING_LIST,
  INITIAL_ASSIGNMENT_CONTRACT,
  TIMELINE_EVENTS,
  SIM_DURATION_HOURS,
  deriveContractStatus,
  type CaseSnapshot,
  type CustodyEvent,
  type AlertItem,
  type AlertCode,
  type TelemetryPoint,
  type OfflineRecord,
  type EventName,
  type RoleActor,
  type Scenario,
  type WaitingListEntry,
  type AssignmentContract,
  type AssignmentSigs,
  type EvidenceStatus,
} from "./case-data"

// ─── SHA-256 hash chaining ────────────────────────────────────────────────────
async function genHash(prevHash: string, payload: string): Promise<string> {
  const data = new TextEncoder().encode(prevHash + payload)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return (
    "0x" +
    Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 12)
  )
}

function nowSimTime(tHours: number): string {
  const h = Math.floor(tHours)
  const m = Math.floor((tHours - h) * 60)
  return `T+${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}m`
}

// ─── Store interface ──────────────────────────────────────────────────────────
interface StoreValue {
  // Identity & navigation
  roleActor: RoleActor
  setRoleActor: (r: RoleActor) => void
  screen: "portal" | "verifying" | "dashboard"
  setScreen: (s: "portal" | "verifying" | "dashboard") => void
  pamGranted: boolean
  setPamGranted: (v: boolean) => void

  // Scenario
  scenario: Scenario
  setScenario: (s: Scenario) => void

  // Simulation clock
  simTimeHours: number
  simRunning: boolean
  simSpeed: 60 | 360 | 1800
  startSim: () => void
  pauseSim: () => void
  resetSim: () => void
  setSimSpeed: (s: 60 | 360 | 1800) => void

  // Case data
  caseData: CaseSnapshot
  events: CustodyEvent[]
  alerts: AlertItem[]
  telemetry: TelemetryPoint[]
  offline: OfflineRecord[]
  waitingList: WaitingListEntry[]
  assignmentContract: AssignmentContract
  contractReached: boolean    // T >= 0.5
  aiAnomalyReviewed: boolean
  ransomwareActive: boolean   // T=12..12.25 in ransomware scenario
  ransomwareRestored: boolean // T>=12.25 in ransomware scenario

  // Actions
  signAssignment: (actor: "incucai" | "hospital") => Promise<void>
  acknowledgeAlert: (id: string) => void
  markAiReviewed: () => void
  syncOffline: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  // Identity
  const [roleActor, setRoleActor] = useState<RoleActor>("incucai")
  const [screen, setScreen] = useState<"portal" | "verifying" | "dashboard">("portal")
  const [pamGranted, setPamGranted] = useState(false)

  // Scenario
  const [scenario, setScenarioState] = useState<Scenario>("normal")

  // Simulation clock
  const [simTimeHours, setSimTimeHours] = useState(0)
  const [simRunning, setSimRunning] = useState(true)
  const [simSpeed, setSimSpeedState] = useState<60 | 360 | 1800>(360)

  // Case state
  const [caseData, setCaseData] = useState<CaseSnapshot>(INITIAL_CASE)
  const [events, setEvents] = useState<CustodyEvent[]>(INITIAL_EVENTS)
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS)
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(INITIAL_TELEMETRY)
  const [offline, setOffline] = useState<OfflineRecord[]>(INITIAL_OFFLINE)
  const [waitingList] = useState<WaitingListEntry[]>(INITIAL_WAITING_LIST)
  const [assignmentSigs, setAssignmentSigs] = useState<AssignmentSigs>({ incucai: false, hospital: false })
  const [contractReached, setContractReached] = useState(false)
  const [aiAnomalyReviewed, setAiAnomalyReviewed] = useState(false)
  const [ransomwareActive, setRansomwareActive] = useState(false)
  const [ransomwareRestored, setRansomwareRestored] = useState(false)

  // ─── Refs to avoid stale closures in the interval ─────────────────────────
  const simSpeedRef   = useRef(simSpeed)
  const scenarioRef   = useRef(scenario)
  const roleRef       = useRef(roleActor)
  const firedRef      = useRef<Set<string>>(new Set())
  const eventsRef     = useRef(events)

  useEffect(() => { simSpeedRef.current   = simSpeed },   [simSpeed])
  useEffect(() => { scenarioRef.current   = scenario },   [scenario])
  useEffect(() => { roleRef.current       = roleActor },  [roleActor])
  useEffect(() => { eventsRef.current     = events },     [events])

  // ─── addEvent (async SHA-256 chaining) ────────────────────────────────────
  const addEventRaw = useCallback(
    (
      event: EventName,
      opts: {
        actor: string
        org: string
        status?: EvidenceStatus
        plainText?: string
        visibleTo?: RoleActor[]
        tHours?: number
      },
    ): void => {
      const tHours = opts.tHours ?? 0
      const time   = nowSimTime(tHours)
      const status = opts.status ?? "VALID"

      setEvents((prev) => {
        const prevHash = prev.length ? prev[prev.length - 1].hash : "0x000000000000"
        const payload  = `${event}${time}${opts.actor}${opts.org}`
        const tempHash = "0x" + Math.random().toString(16).slice(2, 14)

        const next: CustodyEvent = {
          id: `EVT-${String(prev.length + 1).padStart(3, "0")}`,
          event,
          tHours,
          time,
          actor: opts.actor,
          org: opts.org,
          txId: `tx_${Date.now()}`,
          prevHash,
          hash: tempHash,
          status,
          plainText: opts.plainText,
          visibleTo: opts.visibleTo,
        }

        // Async upgrade hash with real SHA-256
        genHash(prevHash, payload).then((realHash) => {
          setEvents((curr) =>
            curr.map((e) =>
              e.id === next.id
                ? { ...e, hash: realHash, txId: `tx_${realHash.slice(2)}` }
                : e,
            ),
          )
        })

        return [...prev, next]
      })
    },
    [],
  )

  const addEventRef = useRef(addEventRaw)
  useEffect(() => { addEventRef.current = addEventRaw }, [addEventRaw])

  // ─── pushAlert ────────────────────────────────────────────────────────────
  const pushAlertRaw = useCallback(
    (a: Omit<AlertItem, "id" | "time" | "acknowledged">, tHours: number): void => {
      setAlerts((prev) => [
        {
          ...a,
          id: `ALR-${Date.now()}`,
          time: nowSimTime(tHours),
          acknowledged: false,
        },
        ...prev,
      ])
    },
    [],
  )
  const pushAlertRef = useRef(pushAlertRaw)
  useEffect(() => { pushAlertRef.current = pushAlertRaw }, [pushAlertRaw])

  // ─── Fire a single timeline event ─────────────────────────────────────────
  const fireTimelineEvent = useCallback(
    (te: (typeof TIMELINE_EVENTS)[number], tHours: number) => {
      addEventRef.current(te.event, {
        actor: te.actor,
        org: te.org,
        status: te.status,
        plainText: te.plainDetail || undefined,
        visibleTo: te.visibleTo,
        tHours,
      })

      if (te.isAlert) {
        pushAlertRef.current(
          {
            code: te.event as AlertCode,
            level: te.alertLevel ?? "info",
            title: te.alertTitle ?? te.event,
            detail: te.techDetail,
            plainDetail: te.plainDetail || undefined,
            visibleTo: te.visibleTo,
          },
          tHours,
        )
      }

      // Side effects
      if (te.event === "ASSIGNMENT_SIGNED_INCUCAI") {
        setAssignmentSigs((p) => ({ ...p, incucai: true }))
      }
      if (te.event === "ASSIGNMENT_SIGNED_HOSPITAL") {
        setAssignmentSigs((p) => ({ ...p, hospital: true }))
      }
      if (te.event === "ASSIGNMENT_PENDING") {
        setContractReached(true)
      }
      if (te.event === "TRANSPORT_STARTED") {
        setCaseData((p) => ({ ...p, status: "En traslado", custodyStatus: "Activa", currentLocation: "En ruta" }))
      }
      if (te.event === "CUSTODY_RECEIVED") {
        setCaseData((p) => ({ ...p, status: "Recibido", custodyStatus: "Recepción confirmada", currentLocation: "Hospital Receptor — Córdoba", routeProgress: 100 }))
      }
      if (te.event === "CASE_CLOSED") {
        setCaseData((p) => ({ ...p, status: "Cerrado" }))
      }
      if (te.event === "DEVICE_LINKED") {
        setCaseData((p) => ({ ...p, deviceAuthorized: true }))
      }
      if (te.event === "RANSOMWARE_NODE_ISOLATED") {
        setRansomwareActive(true)
      }
      if (te.event === "RANSOMWARE_NODE_RESTORED") {
        setRansomwareActive(false)
        setRansomwareRestored(true)
      }
    },
    [],
  )
  const fireTimelineEventRef = useRef(fireTimelineEvent)
  useEffect(() => { fireTimelineEventRef.current = fireTimelineEvent }, [fireTimelineEvent])

  // ─── Simulation tick ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!simRunning) return

    const id = setInterval(() => {
      setSimTimeHours((prev) => {
        if (prev >= SIM_DURATION_HOURS) {
          setSimRunning(false)
          return SIM_DURATION_HOURS
        }

        const next = Math.min(SIM_DURATION_HOURS, prev + simSpeedRef.current / 3600)

        // Check which timeline events should fire now
        const sc   = scenarioRef.current
        const role = roleRef.current

        for (const te of TIMELINE_EVENTS) {
          if (firedRef.current.has(te.id))       continue
          if (te.tHours > next)                   continue
          if (!te.scenarios.includes(sc))         continue

          firedRef.current.add(te.id)
          fireTimelineEventRef.current(te, te.tHours)
        }

        // Update telemetry point every 2 simulated hours of transport
        if (next >= 2) {
          const tBucket = Math.floor(next / 2) * 2
          const label   = `T+${tBucket}h`
          setTelemetry((pts) => {
            if (pts.some((p) => p.t === label)) return pts
            const last = pts[pts.length - 1] ?? { internal: 3.2, external: 18.7 }
            const drift = (tBucket / 34) * 0.8 // gradual temperature drift
            return [
              ...pts.slice(-15),
              {
                t:        label,
                tHours:   tBucket,
                internal: +(last.internal + (Math.random() - 0.4) * 0.3 + drift * 0.05).toFixed(1),
                external: +(last.external + (Math.random() - 0.5) * 0.4).toFixed(1),
              },
            ]
          })

          // Update route progress
          const progress = Math.min(100, Math.round(((next - 2) / (28 - 2)) * 100))
          setCaseData((p) => ({ ...p, routeProgress: Math.max(p.routeProgress, progress) }))
        }

        return next
      })
    }, 1000)

    return () => clearInterval(id)
  }, [simRunning]) // Only depends on simRunning — everything else via refs

  // ─── Clock controls ───────────────────────────────────────────────────────
  const startSim = useCallback(() => setSimRunning(true),  [])
  const pauseSim = useCallback(() => setSimRunning(false), [])
  const resetSim = useCallback(() => {
    setSimRunning(false)
    setSimTimeHours(0)
    setEvents(INITIAL_EVENTS)
    setAlerts(INITIAL_ALERTS)
    setTelemetry(INITIAL_TELEMETRY)
    setCaseData(INITIAL_CASE)
    setAssignmentSigs({ incucai: false, hospital: false })
    setContractReached(false)
    setAiAnomalyReviewed(false)
    setRansomwareActive(false)
    setRansomwareRestored(false)
    firedRef.current = new Set()
  }, [])

  const setScenario = useCallback((s: Scenario) => {
    setScenarioState(s)
    // Reset if scenario changes mid-run
    setSimRunning(false)
    setSimTimeHours(0)
    setEvents(INITIAL_EVENTS)
    setAlerts(INITIAL_ALERTS)
    setTelemetry(INITIAL_TELEMETRY)
    setCaseData(INITIAL_CASE)
    setAssignmentSigs({ incucai: false, hospital: false })
    setContractReached(false)
    setAiAnomalyReviewed(false)
    setRansomwareActive(false)
    setRansomwareRestored(false)
    firedRef.current = new Set()
  }, [])

  const setSimSpeed = useCallback((s: 60 | 360 | 1800) => {
    setSimSpeedState(s)
  }, [])

  // ─── signAssignment gate ──────────────────────────────────────────────────
  const signAssignment = useCallback(
    async (actor: "incucai" | "hospital") => {
      setAssignmentSigs((p) => {
        const next = { ...p, [actor]: true }
        return next
      })

      const teId = actor === "incucai"
        ? "T1.00-ASSIGNMENT_SIGNED_INCUCAI"
        : "T1.25-ASSIGNMENT_SIGNED_HOSPITAL"

      if (!firedRef.current.has(teId)) {
        firedRef.current.add(teId)
        const te = TIMELINE_EVENTS.find((t) => t.id === teId)
        if (te) fireTimelineEventRef.current(te, simTimeHours)
      }
    },
    [simTimeHours],
  )

  // ─── Other actions ────────────────────────────────────────────────────────
  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)))
  }, [])

  const markAiReviewed = useCallback(() => setAiAnomalyReviewed(true), [])

  const syncOffline = useCallback(() => {
    setOffline((prev) => prev.map((r) => ({ ...r, synced: true })))
  }, [])

  // ─── Derived contract ─────────────────────────────────────────────────────
  const assignmentContract: AssignmentContract = useMemo(() => ({
    ...INITIAL_ASSIGNMENT_CONTRACT,
    sigs: assignmentSigs,
    status: deriveContractStatus(assignmentSigs, contractReached),
  }), [assignmentSigs, contractReached])

  // ─── Context value ────────────────────────────────────────────────────────
  const value = useMemo<StoreValue>(
    () => ({
      roleActor,
      setRoleActor,
      screen,
      setScreen,
      pamGranted,
      setPamGranted,
      scenario,
      setScenario,
      simTimeHours,
      simRunning,
      simSpeed,
      startSim,
      pauseSim,
      resetSim,
      setSimSpeed,
      caseData,
      events,
      alerts,
      telemetry,
      offline,
      waitingList,
      assignmentContract,
      contractReached,
      aiAnomalyReviewed,
      ransomwareActive,
      ransomwareRestored,
      signAssignment,
      acknowledgeAlert,
      markAiReviewed,
      syncOffline,
    }),
    [
      roleActor, screen, pamGranted,
      scenario, setScenario,
      simTimeHours, simRunning, simSpeed,
      startSim, pauseSim, resetSim, setSimSpeed,
      caseData, events, alerts, telemetry, offline, waitingList,
      assignmentContract, contractReached,
      aiAnomalyReviewed, ransomwareActive, ransomwareRestored,
      signAssignment, acknowledgeAlert, markAiReviewed, syncOffline,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside StoreProvider")
  return ctx
}
