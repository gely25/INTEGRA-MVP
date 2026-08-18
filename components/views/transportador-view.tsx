"use client"

import { useStore } from "@/lib/store"
import { ShieldAlert, Thermometer, Battery, MapPin, Clock, Truck, ShieldCheck } from "lucide-react"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { computeIschemia, fmtSimHours } from "@/lib/format"

export function TransportadorView() {
  const { ransomwareActive, simTimeHours, scenario, caseData } = useStore()

  // Ischemia computations
  const isc = computeIschemia(simTimeHours, caseData.ischemiaWindowHours, caseData.ischemiaTargetHours)
  const tempTone = caseData.tempInternal > 4.2 ? "text-danger" : caseData.tempInternal > 3.8 ? "text-warn" : "text-ok"
  const battTone = caseData.battery < 20 ? "text-danger" : caseData.battery < 40 ? "text-warn" : "text-ok"
  const ischTone = isc.level === "danger" ? "text-danger" : isc.level === "warn" ? "text-warn" : "text-ok"
  const inTransit = simTimeHours >= 2

  return (
    <div className="space-y-5">
      {/* ── Active Transport Status Header ───────────────────────────────── */}
      <div className="rounded-lg border border-primary/30 bg-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-card-foreground tracking-tight">
              Consola de Custodia Operativa — Transportador
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitoreo en tiempo real del contenedor de traslado e intervención de alertas de custodia.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-ok/10 text-ok border border-ok/20 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
            <ShieldCheck className="h-3 w-3" /> CUSTODIA FÍSICA ASIGNADA
          </span>
        </div>
      </div>

      {/* ── Ransomware Incident Warning (if active) ───────────────────────── */}
      {scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive && (
        <div className="rounded-lg border border-danger/40 bg-danger/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">AVISO OPERATIVO: Incidente de Red en Nodo Donante</p>
              <p className="text-xs text-muted-foreground mt-1">
                peer0.hospitaldona está aislado temporalmente por infraestructura. La custodia IoT y la sincronización
                con INCUCAI y el Hospital Receptor continúan activas a través de los orderers y peers redundantes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Telemetría en vivo del contenedor ────────────────────────────── */}
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

      {/* ── Alertas de custodia (RBAC: transportador) ───────────────────── */}
      <AlertsPanel
        role="transportador"
        canAcknowledge
        plainMode
        title="Alertas de Custodia"
        description="Temperatura, GPS e isquemia del traslado en curso. Solo alertas operativas de su responsabilidad."
      />
    </div>
  )
}
