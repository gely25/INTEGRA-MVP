"use client"

import { useStore } from "@/lib/store"
import { useState } from "react"
import { ShieldAlert, Server, Lock, ShieldCheck, Activity, Terminal, Thermometer, Battery, MapPin, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { computeIschemia, fmtSimHours } from "@/lib/format"
import { toast } from "sonner"

function NodeStatus({ name, status, blocks, latency }: { name: string; status: "online" | "offline" | "isolated"; blocks: number; latency: number }) {
  const statusColor = {
    online: "bg-ok text-ok-foreground",
    offline: "bg-danger text-danger-foreground",
    isolated: "bg-warn text-warn-foreground"
  }

  const label = {
    online: "Online",
    offline: "Offline",
    isolated: "Aislado (Ransomware)"
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary">
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs font-mono font-bold text-card-foreground">{name}</p>
          <p className="text-[10px] text-muted-foreground">Bloques: {blocks} · Latencia: {latency}ms</p>
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${statusColor[status]}`}>
        {label[status]}
      </span>
    </div>
  )
}

export function TransportadorView() {
  const { pamGranted, setPamGranted, ransomwareActive, simTimeHours, scenario, caseData } = useStore()
  const [requesting, setRequesting] = useState(false)

  const handleRequestPAM = () => {
    setRequesting(true)
    setTimeout(() => {
      setPamGranted(true)
      setRequesting(false)
      toast.success("Acceso Privilegiado Temporal (PAM) Aprobado", {
        description: "Sesión grabada y registrada en auditoría."
      })
    }, 1200)
  }

  if (!pamGranted) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md mx-auto my-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-card-foreground mb-2">Acceso Zero Trust por Defecto</h3>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Su rol de Proveedor IT no cuenta con permisos permanentes ni acceso a datos clínicos de pacientes.
          Requiere solicitar Acceso Privilegiado Temporal (PAM) para mantenimiento de infraestructura.
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

  // Ischemia computations
  const isc = computeIschemia(simTimeHours, caseData.ischemiaWindowHours, caseData.ischemiaTargetHours)
  const tempTone = caseData.tempInternal > 4.2 ? "text-danger" : caseData.tempInternal > 3.8 ? "text-warn" : "text-ok"
  const battTone = caseData.battery < 20 ? "text-danger" : caseData.battery < 40 ? "text-warn" : "text-ok"
  const ischTone = isc.level === "danger" ? "text-danger" : isc.level === "warn" ? "text-warn" : "text-ok"
  const inTransit = simTimeHours >= 2

  return (
    <div className="space-y-5">
      {/* ── Active PAM session banner ─────────────────────────────────────── */}
      <div className="rounded-lg border border-ok/30 bg-ok/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-ok" />
          <span className="text-xs font-semibold text-ok">Sesión PAM Activa (Mantenimiento de Red)</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Sesión ID: PAM-9482 · Grabación: ON</span>
      </div>

      {/* ── Ransomware Banner ─────────────────────────────────────────────── */}
      {scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive && (
        <div className="rounded-lg border border-danger/40 bg-danger/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">INCIDENTE ACTIVO: Ransomware en Nodo Donante</p>
              <p className="text-xs text-muted-foreground mt-1">
                peer0.hospitaldona reportó firmas de archivo anómalas (patrón de cifrado).
                El IDS aisló el nodo del canal blockchain. La red continúa operativa gracias a los
                peers redundantes en INCUCAI y Hospital Receptor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Telemetría en vivo del contenedor ────────────────────────────── */}
      {inTransit && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <Thermometer className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Telemetría del Contenedor en Custodia</h3>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">DEVICE-001 · Lectura en vivo</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temperatura interna */}
            <div className="rounded-lg border border-border bg-secondary p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Thermometer className={`h-3.5 w-3.5 ${tempTone}`} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">Temp. interna</span>
              </div>
              <p className={`font-mono text-xl font-bold tabular-nums ${tempTone}`}>
                {caseData.tempInternal.toFixed(1)}°C
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Rango: 2–8°C</p>
            </div>
            {/* Isquemia transcurrida */}
            <div className="rounded-lg border border-border bg-secondary p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className={`h-3.5 w-3.5 ${ischTone}`} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">Isquemia</span>
              </div>
              <p className={`font-mono text-xl font-bold tabular-nums ${ischTone}`}>
                {fmtSimHours(isc.elapsedHours)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Máximo: {fmtSimHours(caseData.ischemiaWindowHours)}
              </p>
            </div>
            {/* GPS */}
            <div className="rounded-lg border border-border bg-secondary p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className={`h-3.5 w-3.5 ${caseData.gpsActive ? "text-ok" : "text-danger"}`} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">GPS</span>
              </div>
              <p className={`font-mono text-sm font-bold ${caseData.gpsActive ? "text-ok" : "text-danger"}`}>
                {caseData.gpsActive ? "Activo" : "Sin señal"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {caseData.gpsActive ? "Señal OK" : "Recuperando..."}
              </p>
            </div>
            {/* Batería */}
            <div className="rounded-lg border border-border bg-secondary p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Battery className={`h-3.5 w-3.5 ${battTone}`} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">Batería</span>
              </div>
              <p className={`font-mono text-xl font-bold tabular-nums ${battTone}`}>
                {caseData.battery}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {caseData.battery < 20 ? "⚠ Batería crítica" : "Nivel normal"}
              </p>
            </div>
          </div>

          {/* Barra de progreso de ruta */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">Progreso de ruta</span>
              <span className="text-[10px] font-mono text-muted-foreground">{caseData.routeProgress}% completado</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${caseData.routeProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground/60">{caseData.origin}</span>
              <span className="text-[10px] text-muted-foreground/60">{caseData.destination}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Alertas de custodia (RBAC: itprov) ───────────────────────────── */}
      <AlertsPanel
        role="itprov"
        canAcknowledge
        plainMode
        title="Alertas de Custodia"
        description="Temperatura, GPS e isquemia del traslado en curso. Solo alertas operativas de su responsabilidad."
      />

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
            blocks={scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive ? 14920 : 14983}
            latency={scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive ? 999 : 14}
          />
          <NodeStatus
            name="orderer.raft (Consenso)"
            status="online"
            blocks={14983}
            latency={8}
          />
        </div>
      </div>

      {/* ── Infrastructure logs ───────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" /> Logs de Infraestructura (PAM)
        </h3>
        <div className="bg-background p-3 rounded-lg border border-border font-mono text-[10px] text-muted-foreground space-y-1 h-40 overflow-y-auto">
          <p>[00:00:01] channel=custody-channel joined successfully by 3 peers</p>
          <p>[00:00:02] consensus=Raft initialized with 3 orderer endpoints</p>
          <p>[01:30:15] link-device: authorized TLS tunnel for DEVICE-001</p>
          {scenario === "ransomware" && simTimeHours >= 12 && (
            <>
              <p className="text-danger">[12:00:00] SECURITY ALERT: cipher pattern detected on peer0.hospitaldona</p>
              <p className="text-danger">[12:00:05] SECURITY STATE: isolation policy enforced for peer0.hospitaldona</p>
              <p className="text-warn">[12:00:10] consensus: raft orderer continues with 2/3 active peers</p>
              {simTimeHours >= 12.25 && (
                <>
                  <p className="text-ok">[12:15:00] PAM ACTION: restore peer0.hospitaldona from offline backup</p>
                  <p className="text-ok">[12:15:30] sync: peer0.hospitaldona catching up to block #14983</p>
                  <p className="text-ok">[12:16:00] status: all nodes synchronized</p>
                </>
              )}
            </>
          )}
          {!ransomwareActive && <p>[{Math.floor(simTimeHours).toString().padStart(2, "0")}:14:00] keep-alive ping OK from 4 endpoints</p>}
        </div>
      </div>
    </div>
  )
}
