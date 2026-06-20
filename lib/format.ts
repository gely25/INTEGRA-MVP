export function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

export function fmtClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
}

export function fmtDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`
}

export interface IschemiaState {
  elapsedSeconds: number
  remainingSeconds: number
  remainingToTargetSeconds: number
  pctOfWindow: number // 0..100 consumido de la ventana límite
  level: "ok" | "warn" | "danger"
}

export function computeIschemia(
  elapsedSeconds: number,
  windowMinutes: number,
  targetMinutes: number,
): IschemiaState {
  const windowSec = windowMinutes * 60
  const targetSec = targetMinutes * 60
  const remainingSeconds = Math.max(0, windowSec - elapsedSeconds)
  const remainingToTargetSeconds = Math.max(0, targetSec - elapsedSeconds)
  const pctOfWindow = Math.min(100, (elapsedSeconds / windowSec) * 100)
  let level: IschemiaState["level"] = "ok"
  if (pctOfWindow >= 85) level = "danger"
  else if (elapsedSeconds >= targetSec) level = "warn"
  return {
    elapsedSeconds,
    remainingSeconds,
    remainingToTargetSeconds,
    pctOfWindow,
    level,
  }
}
