"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { SIM_DURATION_HOURS } from "@/lib/case-data"
import { fmtSimHours } from "@/lib/format"
import { Play, Pause, RotateCcw, Zap, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SPEED_LABELS: Record<number, string> = {
  60:   "×60",
  360:  "×360",
  1800: "×1800",
  3600: "×3600",
}

export function SimClockBar() {
  const { simTimeHours, simRunning, simSpeed, startSim, pauseSim, resetSim, setSimSpeed } =
    useStore()

  const [collapsed, setCollapsed] = useState(false)

  const pct = Math.min(100, (simTimeHours / SIM_DURATION_HOURS) * 100)

  // Color zones
  const barColor =
    simTimeHours >= 20
      ? "bg-[#e5626a]"
      : simTimeHours >= 10
        ? "bg-[#cfa25e]"
        : "bg-[#4fb8c4]"

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#22384d] bg-[#0f1e2c] p-3 shadow-md">
      {/* Row 1: Title, Time & Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#4fb8c4] animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-[#54697c] font-bold">
            Simulador de Tiempo
          </span>
          <span className="font-mono text-xs font-bold text-[#f0f5f9] bg-[#132538] px-2 py-0.5 rounded border border-[#22384d] tabular-nums">
            {fmtSimHours(simTimeHours)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={simRunning ? pauseSim : startSim}
            disabled={simTimeHours >= SIM_DURATION_HOURS}
            className={cn(
              "h-6 px-2.5 text-[10px] font-bold rounded transition-all",
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
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-[#54697c] hover:text-[#f0f5f9] hover:bg-[#132538]"
            onClick={resetSim}
            title="Reiniciar simulación"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-[#54697c] hover:text-[#f0f5f9] hover:bg-[#132538]"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir simulador" : "Colapsar simulador"}
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", collapsed && "-rotate-90")} />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Row 2: Speed Selector */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#22384d]/50">
            <span className="text-[9px] text-[#54697c] uppercase font-bold">Velocidad:</span>
            <div className="flex rounded border border-[#22384d] bg-[#132538] overflow-hidden">
              {([60, 360, 1800, 3600] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-mono font-bold transition-colors border-r border-[#22384d] last:border-0",
                    simSpeed === s
                      ? "bg-[#4fb8c4] text-[#0a141f]"
                      : "text-[#54697c] hover:text-[#dbe6ef]",
                  )}
                >
                  {SPEED_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 rounded-full bg-[#132538] overflow-visible mt-1">
            <div
              className={cn("h-full rounded-full transition-all duration-700", barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}
