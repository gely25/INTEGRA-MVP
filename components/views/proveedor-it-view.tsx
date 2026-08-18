"use client"

import { useStore } from "@/lib/store"
import { useState, useRef, useEffect, useMemo } from "react"
import {
  ShieldAlert,
  Server,
  Lock,
  ShieldCheck,
  Activity,
  Terminal,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { fmtSimLabel } from "@/lib/format"
import { toast } from "sonner"

function NodeStatus({
  name,
  status,
  blocks,
  latency,
}: {
  name: string
  status: "online" | "offline" | "isolated"
  blocks: number
  latency: number
}) {
  const statusColor = {
    online: "bg-ok text-ok-foreground",
    offline: "bg-danger text-danger-foreground",
    isolated: "bg-warn text-warn-foreground",
  }

  const label = {
    online: "Online",
    offline: "Offline",
    isolated: "Aislado (Ransomware)",
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary">
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs font-mono font-bold text-card-foreground">{name}</p>
          <p className="text-[10px] text-muted-foreground">
            Bloques: {blocks} · Latencia: {latency}ms
          </p>
        </div>
      </div>
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${statusColor[status]}`}
      >
        {label[status]}
      </span>
    </div>
  )
}

interface LogLine {
  id: string
  time: string
  level: "INFO" | "WARN" | "OK" | "ERROR"
  text: string
}

export function ProveedorITView() {
  const {
    pamGranted,
    setPamGranted,
    ransomwareActive,
    simTimeHours,
    scenario,
    caseData,
  } = useStore()
  const [requesting, setRequesting] = useState(false)
  const [contextExpanded, setContextExpanded] = useState(false)

  const logEndRef = useRef<HTMLDivElement>(null)

  const handleRequestPAM = () => {
    setRequesting(true)
    setTimeout(() => {
      setPamGranted(true)
      setRequesting(false)
      toast.success("Acceso Privilegiado Temporal (PAM) Aprobado", {
        description: "Sesión de mantenimiento grabada y registrada en auditoría.",
      })
    }, 1200)
  }

  // ── Derived dynamic live logs for the active PAM session ─────────────────
  const pamLogs = useMemo(() => {
    if (!pamGranted) return []

    const logs: LogLine[] = [
      {
        id: "pam-start",
        time: fmtSimLabel(Math.max(0, simTimeHours - 0.2)),
        level: "OK",
        text: "PAM SESSION STARTED — Identity: Proveedor IT · Policy: Zero-Trust Temporary Grant · SessionId: PAM-9482 · Audit: RECORDED",
      },
    ]

    // Periodic infrastructure pings up to current simTimeHours
    const currentHour = Math.floor(simTimeHours)
    for (let h = 1; h <= currentHour; h++) {
      if (h === 12 && scenario === "ransomware") continue // Skip routine ping at ransomware hour
      logs.push({
        id: `ping-${h}`,
        time: fmtSimLabel(h),
        level: "INFO",
        text: `keep-alive ping OK from 4 network endpoints · latency avg 12ms`,
      })
    }

    // Ransomware incident logs if active in current scenario
    if (scenario === "ransomware" && simTimeHours >= 12) {
      logs.push({
        id: "rw-1",
        time: fmtSimLabel(12.0),
        level: "ERROR",
        text: "SECURITY ALERT: cipher pattern detected on peer0.hospitaldona",
      })
      logs.push({
        id: "rw-2",
        time: fmtSimLabel(12.01),
        level: "WARN",
        text: "SECURITY STATE: isolation policy enforced for peer0.hospitaldona",
      })
      logs.push({
        id: "rw-3",
        time: fmtSimLabel(12.02),
        level: "INFO",
        text: "consensus: Raft orderer continues with 2/3 active peers",
      })

      if (simTimeHours >= 12.25) {
        logs.push({
          id: "rw-4",
          time: fmtSimLabel(12.15),
          level: "OK",
          text: "PAM ACTION: initiate restore peer0.hospitaldona from offline backup",
        })
        logs.push({
          id: "rw-5",
          time: fmtSimLabel(12.16),
          level: "INFO",
          text: "sync: peer0.hospitaldona catching up to block #14983",
        })
        logs.push({
          id: "rw-6",
          time: fmtSimLabel(12.17),
          level: "OK",
          text: "STATUS: all network nodes synchronized",
        })
      }
    }

    // Latest live tick
    logs.push({
      id: `live-${simTimeHours}`,
      time: fmtSimLabel(simTimeHours),
      level: "INFO",
      text: `active channel monitor — custody-channel status: ${
        scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive
          ? "DEGRADED (1 node isolated)"
          : "HEALTHY (all peers online)"
      }`,
    })

    return logs
  }, [pamGranted, simTimeHours, scenario, ransomwareActive])

  // Auto-scroll console to bottom when new log entries appear
  useEffect(() => {
    if (pamGranted) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [pamLogs.length, pamGranted, simTimeHours])

  if (!pamGranted) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md mx-auto my-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-card-foreground mb-2">
          Acceso Zero Trust por Defecto
        </h3>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Su rol de Proveedor IT no cuenta con permisos permanentes ni acceso a datos clínicos de pacientes ni telemetría de custodia.
          Requiere solicitar Acceso Privilegiado Temporal (PAM) para mantenimiento exclusivo de la infraestructura blockchain.
        </p>
        <Button
          onClick={handleRequestPAM}
          disabled={requesting}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold"
        >
          {requesting ? "Verificando token mTLS/TOTP..." : "Solicitar acceso PAM"}
        </Button>
      </div>
    )
  }

  const levelColorClass = {
    INFO: "text-[#7d94a8]",
    WARN: "text-[#cfa25e] font-semibold",
    OK: "text-[#79cf9c]",
    ERROR: "text-[#e5626a] font-bold",
  }

  return (
    <div className="space-y-5">
      {/* ── Active PAM session banner ─────────────────────────────────────── */}
      <div className="rounded-lg border border-ok/30 bg-ok/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-ok" />
          <span className="text-xs font-semibold text-ok">
            Sesión PAM Activa (Mantenimiento de Red)
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          Sesión ID: PAM-9482 · Grabación: ON
        </span>
      </div>

      {/* ── Active Case Maintenance Context (Infrastructure Only - PoLP) ── */}
      <div className="rounded-lg border border-border bg-card p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold block font-sans">
              Caso en Mantenimiento
            </span>
            <span className="font-bold text-card-foreground">{caseData.caseId}</span>
          </div>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold block font-sans">
            Nodo Origen
          </span>
          <span className="text-foreground">{caseData.origin}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold block font-sans">
            Nodo Destino
          </span>
          <span className="text-foreground">{caseData.destination}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold block font-sans">
            Acceso Clínico / Custodia
          </span>
          <span className="text-danger font-bold text-[10px] bg-danger/10 px-2 py-0.5 rounded border border-danger/20">
            RESTRINGIDO (PoLP)
          </span>
        </div>
      </div>

      {/* ── Ransomware Banner ─────────────────────────────────────────────── */}
      {scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive && (
        <div className="rounded-lg border border-danger/40 bg-danger/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">
                INCIDENTE ACTIVO: Ransomware en Nodo Donante
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                peer0.hospitaldona reportó firmas de archivo anómalas (patrón de cifrado).
                El IDS aisló el nodo del canal blockchain. La red continúa operativa gracias a los
                peers redundantes en INCUCAI y Hospital Receptor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Health / Nodes status ─────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Salud de la Red Blockchain
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <NodeStatus
            name="peer0.incucai (INCUCAI)"
            status="online"
            blocks={14983}
            latency={12}
          />
          <NodeStatus
            name="peer0.hospitalrec (Receptor)"
            status="online"
            blocks={14983}
            latency={15}
          />
          <NodeStatus
            name="peer0.hospitaldona (Donante)"
            status={
              scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive
                ? "isolated"
                : "online"
            }
            blocks={
              scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive
                ? 14920
                : 14983
            }
            latency={
              scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive
                ? 999
                : 14
            }
          />
          <NodeStatus
            name="orderer.raft (Consenso)"
            status="online"
            blocks={14983}
            latency={8}
          />
        </div>
      </div>

      {/* ── Bloque 1: Contexto del canal (Histórico colapsable) ───────────── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden transition-all">
        <button
          onClick={() => setContextExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-xs font-semibold text-card-foreground">
              Contexto del canal (Histórico previo al inicio del caso)
            </h4>
            <span className="text-[9px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
              Logs pasados
            </span>
          </div>
          {contextExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {contextExpanded && (
          <div className="p-3 bg-[#0d1117] font-mono text-[10px] space-y-1 border-t border-border">
            <p className="text-muted-foreground/60 italic mb-2">
              # Registro bootstrap del canal — Eventos previos al otorgamiento de la sesión PAM actual:
            </p>
            <p className="text-[#7d94a8]">
              [T+00h00m] [INFO] channel=custody-channel joined successfully by peer0.incucai, peer0.hospitalrec, peer0.hospitaldona
            </p>
            <p className="text-[#7d94a8]">
              [T+00h00m] [INFO] consensus=Raft initialized with orderer.raft endpoint
            </p>
            <p className="text-[#79cf9c]">
              [T+01h30m] [OK] link-device: authorized mTLS tunnel for DEVICE-001 (IoT CA · TTL 72h)
            </p>
          </div>
        )}
      </div>

      {/* ── Bloque 2: Sesión PAM actual (Consola grabada en vivo) ─────────── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Header con indicador EN VIVO */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">
              Sesión PAM actual (PAM-9482)
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground/60 hidden sm:inline">
              Grabación activa: <code className="text-primary font-bold">PAM-AUDIT-9482.log</code>
            </span>
          </div>

          {/* Indicator ● EN VIVO parpadeante */}
          <div className="flex items-center gap-1.5 bg-ok/10 border border-ok/30 px-2.5 py-0.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ok" />
            </span>
            <span className="text-[10px] font-mono font-bold text-ok tracking-wider uppercase">
              EN VIVO
            </span>
          </div>
        </div>

        {/* Live Terminal Window */}
        <div className="bg-[#0d1117] p-3 font-mono text-[11px] h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
          {pamLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-muted-foreground/50 shrink-0 select-none">
                [{log.time}]
              </span>
              <span className={`shrink-0 font-bold ${levelColorClass[log.level]}`}>
                [{log.level}]
              </span>
              <span className={levelColorClass[log.level]}>{log.text}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}
