"use client"

import { useStore } from "@/lib/store"
import { SIM_DURATION_HOURS } from "@/lib/case-data"
import { fmtSimHours } from "@/lib/format"
import { Play, Pause, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SPEED_LABELS: Record<number, string> = {
  60:   "×60",
  360:  "×360",
  1800: "×1800",
}

export function SimClockBar() {
  const { simTimeHours, simRunning, simSpeed, startSim, pauseSim, resetSim, setSimSpeed } =
    useStore()

  const pct = Math.min(100, (simTimeHours / SIM_DURATION_HOURS) * 100)

  // Color zones
  const barColor =
    simTimeHours >= 20
      ? "bg-[#e5626a]"
      : simTimeHours >= 10
        ? "bg-[#cfa25e]"
        : "bg-[#4fb8c4]"

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-[#22384d] bg-[#0f1e2c] p-3">
      {/* Top row: label + controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Zap className="h-3 w-3 text-[#4fb8c4]" />
          <span className="text-[9px] uppercase tracking-wider text-[#54697c] font-bold">
            SIMULACIÓN
          </span>
          <span className="font-mono text-xs font-bold text-[#f0f5f9] bg-[#132538] px-1.5 py-0.5 rounded border border-[#22384d]">
            {fmtSimHours(simTimeHours)}
          </span>
          <span className="text-[9px] text-[#54697c]">/ {SIM_DURATION_HOURS}h</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Speed selector */}
          <div className="flex rounded border border-[#22384d] overflow-hidden">
            {([60, 360, 1800] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono font-bold transition-colors",
                  simSpeed === s
                    ? "bg-[#4fb8c4] text-[#0a141f]"
                    : "text-[#54697c] hover:text-[#dbe6ef]",
                )}
              >
                {SPEED_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Reset */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-[#54697c] hover:text-[#f0f5f9]"
            onClick={resetSim}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* Play / Pause */}
          <Button
            size="sm"
            onClick={simRunning ? pauseSim : startSim}
            disabled={simTimeHours >= SIM_DURATION_HOURS}
            className={cn(
              "h-7 px-3 text-xs font-bold rounded transition-all",
              simRunning
                ? "bg-[#cfa25e] hover:bg-[#cfa25e]/80 text-[#0a141f]"
                : "bg-[#4fb8c4] hover:bg-[#4fb8c4]/80 text-[#0a141f]",
            )}
          >
            {simRunning ? (
              <><Pause className="mr-1 h-3 w-3" />Pausa</>
            ) : (
              <><Play  className="mr-1 h-3 w-3" />Play</>
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar with zone markers */}
      <div className="relative h-2 rounded-full bg-[#132538] overflow-visible">
        {/* Filled portion */}
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${pct}%` }}
        />
        {/* 20h alert marker */}
        <div
          className="absolute top-[-2px] h-[10px] w-[2px] bg-[#cfa25e] rounded-full"
          style={{ left: `${(20 / SIM_DURATION_HOURS) * 100}%` }}
          title="20h — umbral de alerta"
        />
        {/* 24h target marker */}
        <div
          className="absolute top-[-2px] h-[10px] w-[2px] bg-[#e5626a] rounded-full"
          style={{ left: `${(24 / SIM_DURATION_HOURS) * 100}%` }}
          title="24h — ventana óptima"
        />
      </div>

      {/* Zone labels */}
      <div className="flex justify-between text-[9px] text-[#54697c] font-mono">
        <span>0h</span>
        <span className="text-[#cfa25e]">20h ⚠</span>
        <span className="text-[#e5626a]">24h ✕</span>
        <span>34h</span>
      </div>
    </div>
  )
}
