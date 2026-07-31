export function fmtClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
}

export function fmtDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`
}

/** Format simulated hours (e.g. 10.5 → "10h 30m") */
export function fmtSimHours(tHours: number): string {
  const h = Math.floor(tHours)
  const m = Math.round((tHours - h) * 60)
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`
}

/** Format as T+HH:MM label */
export function fmtSimLabel(tHours: number): string {
  const h = Math.floor(tHours)
  const m = Math.round((tHours - h) * 60)
  return `T+${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}m`
}

export interface IschemiaState {
  elapsedHours: number
  remainingHours: number
  remainingToTargetHours: number
  pctOfWindow: number   // 0..100 consumed of the window limit
  level: "ok" | "warn" | "danger"
  pastAlert: boolean    // >= 20h
}

export function computeIschemia(
  elapsedHours: number,
  windowHours: number,
  targetHours: number,
  alertHours = 20,
): IschemiaState {
  const remainingHours        = Math.max(0, windowHours - elapsedHours)
  const remainingToTargetHours = Math.max(0, targetHours - elapsedHours)
  const pctOfWindow            = Math.min(100, (elapsedHours / windowHours) * 100)
  const pastAlert              = elapsedHours >= alertHours

  let level: IschemiaState["level"] = "ok"
  if (pctOfWindow >= 85)              level = "danger"
  else if (elapsedHours >= targetHours) level = "warn"

  return {
    elapsedHours,
    remainingHours,
    remainingToTargetHours,
    pctOfWindow,
    level,
    pastAlert,
  }
}
