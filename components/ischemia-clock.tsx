"use client"

import { useStore } from "@/lib/store"
import { computeIschemia, fmtSimHours } from "@/lib/format"
import { ISCHEMIA_ALERT_HOURS } from "@/lib/case-data"
import { cn } from "@/lib/utils"
import { Clock, AlertTriangle } from "lucide-react"

const levelStyles = {
  ok: {
    ring:  "text-[#79cf9c]",
    chip:  "bg-[#79cf9c]/15 text-[#79cf9c] border-[#79cf9c]/30",
    label: "Dentro de ventana óptima",
  },
  warn: {
    ring:  "text-[#cfa25e]",
    chip:  "bg-[#cfa25e]/15 text-[#cfa25e] border-[#cfa25e]/40",
    label: "Superó ventana óptima (24h)",
  },
  danger: {
    ring:  "text-[#e5626a]",
    chip:  "bg-[#e5626a]/15 text-[#e5626a] border-[#e5626a]/40",
    label: "Crítico — cercano al límite",
  },
} as const

export function IschemiaClock({ compact = false }: { compact?: boolean }) {
  const { caseData, simTimeHours } = useStore()

  const isc = computeIschemia(
    simTimeHours,
    caseData.ischemiaWindowHours,
    caseData.ischemiaTargetHours,
    ISCHEMIA_ALERT_HOURS,
  )
  const s = levelStyles[isc.level]

  const radius = compact ? 30 : 56
  const stroke = compact ? 6  : 9
  const c      = 2 * Math.PI * radius
  const dash   = (isc.pctOfWindow / 100) * c

  // 20h alert marker angle on the ring
  const alertPct   = (ISCHEMIA_ALERT_HOURS / caseData.ischemiaWindowHours) * 100
  const alertAngle = (alertPct / 100) * 360 - 90 // -90 to start from top

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative" style={{ width: radius * 2 + stroke, height: radius * 2 + stroke }}>
          <svg
            className="-rotate-90"
            width={radius * 2 + stroke}
            height={radius * 2 + stroke}
            viewBox={`0 0 ${radius * 2 + stroke} ${radius * 2 + stroke}`}
          >
            <circle
              cx={(radius * 2 + stroke) / 2}
              cy={(radius * 2 + stroke) / 2}
              r={radius}
              fill="none"
              stroke="#132538"
              strokeWidth={stroke}
            />
            <circle
              cx={(radius * 2 + stroke) / 2}
              cy={(radius * 2 + stroke) / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
              className={cn("transition-all duration-1000 ease-linear", s.ring)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock className={cn("h-4 w-4", s.ring)} />
          </div>
        </div>
        <div className="leading-tight">
          <p className="font-mono text-sm font-semibold tabular-nums text-[#f0f5f9]">
            {fmtSimHours(isc.remainingHours)}
          </p>
          <p className="text-xs text-[#7d94a8]">restante al límite</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      {/* Circular gauge */}
      <div
        className="relative shrink-0"
        style={{ width: radius * 2 + stroke, height: radius * 2 + stroke }}
      >
        <svg
          className="-rotate-90"
          width={radius * 2 + stroke}
          height={radius * 2 + stroke}
          viewBox={`0 0 ${radius * 2 + stroke} ${radius * 2 + stroke}`}
        >
          {/* Background ring */}
          <circle
            cx={(radius * 2 + stroke) / 2}
            cy={(radius * 2 + stroke) / 2}
            r={radius}
            fill="none"
            stroke="#132538"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx={(radius * 2 + stroke) / 2}
            cy={(radius * 2 + stroke) / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            className={cn("transition-all duration-1000 ease-linear", s.ring)}
          />
          {/* 20h marker dot */}
          <circle
            cx={
              (radius * 2 + stroke) / 2 +
              radius *
                Math.cos((alertAngle * Math.PI) / 180)
            }
            cy={
              (radius * 2 + stroke) / 2 +
              radius *
                Math.sin((alertAngle * Math.PI) / 180)
            }
            r={4}
            fill="#cfa25e"
            className="transition-all"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-[#7d94a8]">consumido</span>
          <span className={cn("font-mono text-lg font-bold tabular-nums", s.ring)}>
            {Math.round(isc.pctOfWindow)}%
          </span>
        </div>
      </div>

      {/* Info column */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            s.chip,
          )}
        >
          {isc.level !== "ok" && <AlertTriangle className="h-3 w-3" />}
          {s.label}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[#7d94a8]">Tiempo restante al límite</p>
          <p className={cn("font-mono text-2xl font-bold tabular-nums", s.ring)}>
            {fmtSimHours(isc.remainingHours)}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-[#7d94a8] sm:justify-start">
          <span>
            Transcurrido:{" "}
            <span className="font-mono font-medium text-[#dbe6ef] tabular-nums">
              {fmtSimHours(isc.elapsedHours)}
            </span>
          </span>
          <span>
            Ventana óptima:{" "}
            <span className="font-mono font-medium text-[#dbe6ef] tabular-nums">
              {fmtSimHours(isc.remainingToTargetHours)} rest.
            </span>
          </span>
          <span>
            {isc.pastAlert && (
              <span className="text-[#cfa25e] font-semibold">⚠ Umbral 20h superado</span>
            )}
            {!isc.pastAlert && <>Alerta: <span className="font-mono font-medium text-[#dbe6ef]">a las 20h</span></>}
          </span>
        </div>
      </div>
    </div>
  )
}
