"use client"

import { useStore } from "@/lib/store"
import { computeIschemia, fmtSimHours } from "@/lib/format"
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
  Heart,
  CalendarCheck,
} from "lucide-react"

interface Metric {
  icon: typeof Thermometer
  label: string
  value: string
  tone: "ok" | "warn" | "danger" | "info"
}

interface CustodyTwinProps {
  plainMode?: boolean
  compact?: boolean
}

export function CustodyTwin({ plainMode = false, compact = false }: CustodyTwinProps) {
  const { caseData, alerts, simTimeHours } = useStore()
  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const isc = computeIschemia(simTimeHours, caseData.ischemiaWindowHours, caseData.ischemiaTargetHours)

  const tempTone: Metric["tone"] = caseData.tempInternal > 4.2 ? "danger" : caseData.tempInternal > 3.8 ? "warn" : "ok"
  const battTone: Metric["tone"] = caseData.battery < 20 ? "danger" : caseData.battery < 40 ? "warn" : "ok"

  // Adjust metrics based on plainMode
  const metrics: Metric[] = plainMode ? [
    { icon: Thermometer, label: "Temp. del Contenedor", value: `${caseData.tempInternal.toFixed(1)} °C`, tone: tempTone },
    { icon: Snowflake, label: "Cadena de Frío", value: caseData.coldChain, tone: "ok" },
    { icon: Satellite, label: "Señal GPS", value: caseData.gpsActive ? "Ubicación activa" : "Buscando señal", tone: caseData.gpsActive ? "ok" : "danger" },
    { icon: Wifi, label: "Conexión", value: "Estable (Online)", tone: "info" },
    { icon: BatteryMedium, label: "Carga de Batería", value: `${caseData.battery}%`, tone: battTone },
    { icon: CalendarCheck, label: "Estado del Órgano", value: caseData.status, tone: "info" },
    { icon: Bell, label: "Avisos Recientes", value: String(activeAlerts.length), tone: activeAlerts.length ? "warn" : "ok" },
    { icon: Heart, label: "Compatibilidad", value: "Óptima (Match 6/6)", tone: "ok" },
  ] : [
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

  if (compact) {
    const leftMetrics = [
      { icon: Thermometer, label: "Temp. del Contenedor", value: `${caseData.tempInternal.toFixed(1)} °C`, tone: tempTone, valueClass: tempTone === "ok" ? "text-card-foreground" : toneText[tempTone] },
      { icon: Snowflake, label: "Cadena de Frío", value: caseData.coldChain, tone: "ok" as const, valueClass: "text-ok" },
      { icon: Satellite, label: "Señal GPS", value: caseData.gpsActive ? "Ubicación activa" : "Buscando señal", tone: caseData.gpsActive ? "ok" as const : "danger" as const, valueClass: "text-card-foreground" },
    ]

    const rightMetrics = [
      { icon: BatteryMedium, label: "Carga de Batería", value: `${caseData.battery}%`, tone: battTone, valueClass: battTone === "ok" ? "text-card-foreground" : toneText[battTone] },
      { icon: Wifi, label: "Conexión", value: "Estable (online)", tone: "ok" as const, valueClass: "text-ok" },
      { icon: Heart, label: "Compatibilidad", value: "Óptima (6/6)", tone: "ok" as const, valueClass: "text-ok" },
    ]

    return (
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] w-full px-2 py-1">
        {/* Left Column */}
        <div className="flex flex-col gap-3">
          {leftMetrics.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className={cn("rounded-lg border p-2.5", toneBg[m.tone])}>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">{m.label}</span>
                </div>
                <p className={cn("mt-1.5 font-mono text-base sm:text-lg font-bold tabular-nums", m.valueClass)}>{m.value}</p>
              </div>
            )
          })}
        </div>

        {/* Center Kidney Circle */}
        <div className="flex flex-col items-center shrink-0 py-2">
          <div
            className={cn(
              "relative flex h-36 w-36 items-center justify-center rounded-full bg-secondary/40 ring-4 ring-offset-2 ring-offset-card transition-all duration-700",
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
              src="/images/kidney.png"
              alt="Visual"
              className="relative z-10 h-24 w-24 object-contain drop-shadow-xl"
            />
          </div>
          <div className="mt-3 text-center">
            <p className="font-mono text-base font-bold text-card-foreground tracking-tight">
              {fmtSimHours(isc.remainingHours)}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">isquemia fría restante</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3">
          {rightMetrics.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className={cn("rounded-lg border p-2.5", toneBg[m.tone])}>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">{m.label}</span>
                </div>
                <p className={cn("mt-1.5 font-mono text-base sm:text-lg font-bold tabular-nums", m.valueClass)}>{m.value}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

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
            "relative flex h-48 w-48 items-center justify-center rounded-full bg-secondary/60 ring-4 ring-offset-2 ring-offset-card transition-all duration-700",
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
            src="/images/kidney.png"
            alt="Referencia visual del riñón en traslado"
            className="relative z-10 h-40 w-40 object-contain drop-shadow-xl"
          />
        </div>
        <div className="mt-2 text-center">
          <p className="font-mono text-sm font-bold text-card-foreground tracking-tight">
            {fmtSimHours(isc.remainingHours)}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">isquemia fría restante</p>
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
    <div className={cn("rounded-lg border p-2.5", toneBg[m.tone])}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", toneText[m.tone])} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{m.label}</span>
      </div>
      <p className={cn("mt-1 font-mono text-sm font-bold tabular-nums", toneText[m.tone])}>{m.value}</p>
    </div>
  )
}
