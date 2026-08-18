"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { SIM_DURATION_HOURS } from "@/lib/case-data"
import { fmtSimHours } from "@/lib/format"
import { Play, Pause, RotateCcw, Zap, ChevronDown, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SPEED_LABELS: Record<number, string> = {
  60: "×60",
  360: "×360",
  1800: "×1800",
  3600: "×3600",
}

export function SimClockBar() {
  const {
    simTimeHours,
    simRunning,
    simSpeed,
    scenario,
    startSim,
    pauseSim,
    resetSim,
    setSimSpeed,
    jumpToSimTime,
  } = useStore()

  const [collapsed, setCollapsed] = useState(false)

  const pct = Math.min(100, (simTimeHours / SIM_DURATION_HOURS) * 100)

  // Progress bar color reflects real system state:
  const barColor =
    simTimeHours >= 20
      ? "bg-danger"
      : simTimeHours >= 10
        ? "bg-warn"
        : "bg-primary"

  // Derive narrative milestones for the active scenario
  const milestones = useMemo(() => {
    const list: { label: string; tHours: number }[] = [
      { label: "Inicio · 0h", tHours: 0 },
    ]

    if (scenario === "insider") {
      list.push({ label: "Insider 10h", tHours: 10.0 })
    } else if (scenario === "ransomware") {
      list.push({ label: "Ransomware 12h", tHours: 12.0 })
    }

    list.push(
      { label: "Alerta 20h", tHours: 20.0 },
      { label: "Llegada 28h", tHours: 28.0 },
      { label: "Cierre 34h", tHours: 34.0 },
    )

    return list
  }, [scenario])

  // Identify milestone closest to current simTimeHours for visual highlight
  const closestMilestoneT = useMemo(() => {
    let closest = milestones[0].tHours
    let minDiff = Math.abs(simTimeHours - closest)

    for (const m of milestones) {
      const diff = Math.abs(simTimeHours - m.tHours)
      if (diff < minDiff) {
        minDiff = diff
        closest = m.tHours
      }
    }
    return closest
  }, [milestones, simTimeHours])

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-md">
      {/* Row 1: Title, Time & Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
            Simulador de Tiempo
          </span>
          <span className="font-mono text-xs font-bold text-card-foreground bg-muted px-2 py-0.5 rounded border border-border tabular-nums">
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
                ? "bg-warn hover:bg-warn/80 text-warn-foreground"
                : "bg-primary hover:bg-primary/80 text-primary-foreground",
            )}
          >
            {simRunning ? (
              <>
                <Pause className="mr-1 h-3 w-3" />
                Pausa
              </>
            ) : (
              <>
                <Play className="mr-1 h-3 w-3" />
                Play
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-card-foreground hover:bg-muted"
            onClick={resetSim}
            title="Reiniciar simulación"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-card-foreground hover:bg-muted"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir simulador" : "Colapsar simulador"}
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", collapsed && "-rotate-90")}
            />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Row 2: Speed Selector */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
            <span className="text-[9px] text-muted-foreground/60 uppercase font-bold">
              Velocidad:
            </span>
            <div className="flex rounded border border-border bg-muted overflow-hidden">
              {([60, 360, 1800, 3600] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-mono font-bold transition-colors border-r border-border last:border-0 cursor-pointer",
                    simSpeed === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SPEED_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Hitos Clave (Milestones Jump Chips) */}
          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-border/50 flex-wrap">
            <div className="flex items-center gap-1">
              <Flag className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-[9px] text-muted-foreground/60 uppercase font-bold">
                Hitos:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {milestones.map((m) => {
                const isSelected = closestMilestoneT === m.tHours
                return (
                  <button
                    key={m.tHours}
                    onClick={() => jumpToSimTime(m.tHours)}
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-mono font-bold rounded border transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/60 hover:text-foreground",
                    )}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progress bar — color = real ischemia state */}
          <div className="relative h-1.5 rounded-full bg-muted overflow-visible mt-1">
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
