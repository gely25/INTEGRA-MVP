"use client"

import { useStore } from "@/lib/store"
import { computeIschemia, fmtClock } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  Thermometer,
  BatteryMedium,
  Satellite,
  Wifi,
  ShieldCheck,
  Bell,
  Snowflake,
  Activity,
} from "lucide-react"

interface Metric {
  icon: typeof Thermometer
  label: string
  value: string
  tone: "ok" | "warn" | "danger" | "info"
}

export function CustodyTwin() {
  const { caseData, alerts, ischemiaSeconds } = useStore()
  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const isc = computeIschemia(ischemiaSeconds, caseData.ischemiaWindowMin, caseData.ischemiaTargetMin)

  const tempTone: Metric["tone"] = caseData.tempInternal > 8 ? "danger" : caseData.tempInternal > 6 ? "warn" : "ok"
  const battTone: Metric["tone"] = caseData.battery < 20 ? "danger" : caseData.battery < 40 ? "warn" : "ok"

  const metrics: Metric[] = [
    { icon: Thermometer, label: "Temp. interna", value: `${caseData.tempInternal.toFixed(1)} °C`, tone: tempTone },
    { icon: Snowflake, label: "Cadena de frío", value: caseData.coldChain, tone: "ok" },
    { icon: Satellite, label: "GPS", value: caseData.gpsActive ? "Activo" : "Sin señal", tone: caseData.gpsActive ? "ok" : "danger" },
    { icon: Wifi, label: "Conectividad", value: caseData.connectivity, tone: "info" },
    { icon: BatteryMedium, label: "Batería", value: `${caseData.battery}%`, tone: battTone },
    { icon: ShieldCheck, label: "Evidencia", value: caseData.evidenceStatus, tone: caseData.evidenceStatus === "VALID" ? "ok" : "danger" },
    { icon: Bell, label: "Alertas activas", value: String(activeAlerts.length), tone: activeAlerts.length ? "warn" : "ok" },
    { icon: Activity, label: "Última lectura", value: caseData.source === "SIMULATED_SENSOR" ? "Simulada" : "Real", tone: "info" },
  ]

  const toneText: Record<Metric["tone"], string> = {
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
    info: "text-primary",
  }
  const toneBg: Record<Metric["tone"], string> = {
    ok: "bg-ok/10 border-ok/25",
    warn: "bg-warn/10 border-warn/30",
    danger: "bg-danger/10 border-danger/40",
    info: "bg-primary/10 border-primary/25",
  }

  const ringColor =
    isc.level === "danger" ? "ring-danger/40" : isc.level === "warn" ? "ring-warn/40" : "ring-ok/40"

  return (
    <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
      {/* Columna izquierda de métricas */}
      <div className="order-2 grid grid-cols-2 gap-3 lg:order-1">
        {metrics.slice(0, 4).map((m) => (
          <MetricCard key={m.label} m={m} toneText={toneText} toneBg={toneBg} />
        ))}
      </div>

      {/* Centro: riñón como referencia visual */}
      <div className="order-1 flex flex-col items-center lg:order-2">
        <div
          className={cn(
            "relative flex h-52 w-52 items-center justify-center rounded-full bg-secondary/60 ring-4 ring-offset-2 ring-offset-card",
            ringColor,
          )}
        >
          <span
            className={cn(
              "absolute inset-0 animate-pulse rounded-full opacity-40",
              isc.level === "danger" ? "bg-danger/10" : isc.level === "warn" ? "bg-warn/10" : "bg-ok/10",
            )}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/kidney-realistic.png"
            alt="Referencia visual del riñón en traslado"
            className="relative z-10 h-44 w-44 object-contain drop-shadow-lg"
          />
        </div>
        <div className="mt-3 text-center">
          <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {fmtClock(isc.remainingSeconds)}
          </p>
          <p className="text-xs text-muted-foreground">isquemia fría restante</p>
        </div>
      </div>

      {/* Columna derecha de métricas */}
      <div className="order-3 grid grid-cols-2 gap-3">
        {metrics.slice(4, 8).map((m) => (
          <MetricCard key={m.label} m={m} toneText={toneText} toneBg={toneBg} />
        ))}
      </div>
    </div>
  )
}

function MetricCard({
  m,
  toneText,
  toneBg,
}: {
  m: Metric
  toneText: Record<string, string>
  toneBg: Record<string, string>
}) {
  const Icon = m.icon
  return (
    <div className={cn("rounded-lg border p-3", toneBg[m.tone])}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", toneText[m.tone])} />
        <span className="text-[11px] font-medium uppercase tracking-wide">{m.label}</span>
      </div>
      <p className={cn("mt-1 font-mono text-base font-semibold tabular-nums", toneText[m.tone])}>{m.value}</p>
    </div>
  )
}
