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
} from "lucide-react"

interface Metric {
  icon: typeof Thermometer
  label: string
  value: string
  tone: "ok" | "warn" | "danger" | "info"
}

export function CustodyTwin() {
  const { caseData, alerts, simTimeHours } = useStore()
  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const isc = computeIschemia(simTimeHours, caseData.ischemiaWindowHours, caseData.ischemiaTargetHours)

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
    ok: "text-[#79cf9c]",
    warn: "text-[#cfa25e]",
    danger: "text-[#e5626a]",
    info: "text-[#4fb8c4]",
  }
  const toneBg: Record<Metric["tone"], string> = {
    ok: "bg-[#79cf9c]/10 border-[#79cf9c]/25",
    warn: "bg-[#cfa25e]/10 border-[#cfa25e]/30",
    danger: "bg-[#e5626a]/10 border-[#e5626a]/40",
    info: "bg-[#4fb8c4]/10 border-[#4fb8c4]/25",
  }

  const ringColor =
    isc.level === "danger" ? "ring-[#e5626a]/40" : isc.level === "warn" ? "ring-[#cfa25e]/40" : "ring-[#79cf9c]/40"

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
            "relative flex h-52 w-52 items-center justify-center rounded-full bg-[#132538]/60 ring-4 ring-offset-2 ring-offset-[#0f1e2c]",
            ringColor,
          )}
        >
          <span
            className={cn(
              "absolute inset-0 animate-pulse rounded-full opacity-40",
              isc.level === "danger" ? "bg-[#e5626a]/10" : isc.level === "warn" ? "bg-[#cfa25e]/10" : "bg-[#79cf9c]/10",
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
          <p className="font-mono text-sm font-semibold tabular-nums text-[#f0f5f9]">
            {fmtSimHours(isc.remainingHours)}
          </p>
          <p className="text-xs text-[#7d94a8]">isquemia fría restante</p>
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
      <div className="flex items-center gap-1.5 text-[#7d94a8]">
        <Icon className={cn("h-3.5 w-3.5", toneText[m.tone])} />
        <span className="text-[11px] font-medium uppercase tracking-wide">{m.label}</span>
      </div>
      <p className={cn("mt-1 font-mono text-base font-semibold tabular-nums", toneText[m.tone])}>{m.value}</p>
    </div>
  )
}
