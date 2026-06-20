"use client"

import { useStore } from "@/lib/store"
import { computeIschemia, fmtClock, fmtDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Clock, AlertTriangle } from "lucide-react"

const levelStyles = {
  ok: { ring: "text-ok", chip: "bg-ok/15 text-ok border-ok/30", label: "Dentro de ventana óptima" },
  warn: {
    ring: "text-warn",
    chip: "bg-warn/15 text-warn border-warn/40",
    label: "Superó ventana óptima (24h)",
  },
  danger: {
    ring: "text-danger",
    chip: "bg-danger/15 text-danger border-danger/40",
    label: "Crítico — cercano al límite",
  },
} as const

export function IschemiaClock({ compact = false }: { compact?: boolean }) {
  const { caseData, ischemiaSeconds } = useStore()
  const isc = computeIschemia(
    ischemiaSeconds,
    caseData.ischemiaWindowMin,
    caseData.ischemiaTargetMin,
  )
  const s = levelStyles[isc.level]

  // anillo de progreso
  const radius = compact ? 30 : 56
  const stroke = compact ? 6 : 9
  const c = 2 * Math.PI * radius
  const dash = (isc.pctOfWindow / 100) * c

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
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-muted"
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
          <p className="font-mono text-sm font-semibold tabular-nums">{fmtClock(isc.remainingSeconds)}</p>
          <p className="text-xs text-muted-foreground">restante al límite</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: radius * 2 + stroke, height: radius * 2 + stroke }}>
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
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
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
          <span className="text-xs text-muted-foreground">consumido</span>
          <span className={cn("font-mono text-lg font-bold tabular-nums", s.ring)}>
            {Math.round(isc.pctOfWindow)}%
          </span>
        </div>
      </div>

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
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tiempo restante al límite</p>
          <p className={cn("font-mono text-2xl font-bold tabular-nums", s.ring)}>
            {fmtClock(isc.remainingSeconds)}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground sm:justify-start">
          <span>
            Transcurrido:{" "}
            <span className="font-mono font-medium text-foreground tabular-nums">
              {fmtDuration(isc.elapsedSeconds)}
            </span>
          </span>
          <span>
            Ventana óptima (24h):{" "}
            <span className="font-mono font-medium text-foreground tabular-nums">
              {fmtDuration(isc.remainingToTargetSeconds)} rest.
            </span>
          </span>
          <span>
            Límite clínico:{" "}
            <span className="font-mono font-medium text-foreground">36h 00m</span>
          </span>
        </div>
      </div>
    </div>
  )
}
