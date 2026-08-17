"use client"

import { useEffect, useRef, useState } from "react"
import { useStore } from "@/lib/store"
import { fmtSimLabel } from "@/lib/format"
import { Terminal, Wifi, BatteryMedium, MapPin, ShieldCheck } from "lucide-react"

interface LogLine {
  id: number
  time: string
  type: "INFO" | "WARN" | "OK" | "SIG"
  msg: string
}

let lineCount = 0

function makeReading(tHours: number, temp: number, battery: number): LogLine[] {
  const time = fmtSimLabel(tHours)
  const ecdsa = "0x" + Math.random().toString(16).slice(2, 14)
  const lines: LogLine[] = [
    { id: ++lineCount, time, type: "INFO", msg: `READ  temp_internal=${temp.toFixed(2)}°C  temp_external=${(temp + 15.3 + Math.random()).toFixed(2)}°C` },
    { id: ++lineCount, time, type: "INFO", msg: `READ  battery=${battery}%  gps=ACTIVE  rssi=-${(42 + Math.floor(Math.random() * 12))}dBm` },
    { id: ++lineCount, time, type: "SIG",  msg: `ECDSA sign=OK  sig=${ecdsa}  cert=IoT-CA/DEVICE-001  ttl=72h` },
    { id: ++lineCount, time, type: "OK",   msg: `PUSH  mqtt://broker.integra/telemetry → ACK` },
  ]
  if (temp > 4.5) {
    lines.push({ id: ++lineCount, time, type: "WARN", msg: `WARN  temp_threshold=4.0°C exceeded → alert dispatched` })
  }
  return lines
}

export function IotView() {
  const { simTimeHours, simRunning, caseData } = useStore()

  const [lines, setLines] = useState<LogLine[]>(() => [
    { id: ++lineCount, time: "T+00h00m", type: "INFO", msg: "INTEGRA IoT Runtime v3.2.1 — DEVICE-001 initializing…" },
    { id: ++lineCount, time: "T+00h00m", type: "OK",   msg: "TLS mutual auth OK · IoT CA cert loaded · TTL=72h" },
    { id: ++lineCount, time: "T+00h00m", type: "OK",   msg: "MQTT broker connected · channel: custody-channel" },
    { id: ++lineCount, time: "T+00h00m", type: "INFO", msg: "Awaiting transport start event…" },
  ])

  const lastTHours = useRef(-1)
  const logRef = useRef<HTMLDivElement>(null)

  // Generate a log entry every 2 simulated hours after transport
  useEffect(() => {
    if (!simRunning) return
    if (simTimeHours < 2) return

    const bucket = Math.floor(simTimeHours * 2) / 2 // every 0.5 simulated hours
    if (bucket <= lastTHours.current) return
    lastTHours.current = bucket

    const driftedTemp = caseData.tempInternal + Math.random() * 0.3 - 0.1
    const newLines = makeReading(simTimeHours, Math.max(1, driftedTemp), Math.max(60, caseData.battery))

    setLines((prev) => {
      const next = [...prev, ...newLines]
      return next.slice(-80) // keep last 80 lines
    })
  }, [simRunning, simTimeHours, caseData.tempInternal, caseData.battery])

  // Auto-scroll to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [lines])

  const lineColor: Record<LogLine["type"], string> = {
    INFO: "text-muted-foreground",
    OK:   "text-ok",
    WARN: "text-warn",
    SIG:  "text-[--color-chart-5]",
  }

  return (
    <div className="space-y-4">

      {/* ── Header banner ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[--color-chart-5]/40 bg-[--color-chart-5]/5 p-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[--color-chart-5]" />
          <span className="font-mono text-sm font-bold text-[--color-chart-5]">DEVICE-001</span>
          <span className="text-[10px] text-muted-foreground/60">IoT CA · TLS mutuo · TTL 72h</span>
        </div>
        <div className="flex items-center gap-4 ml-auto text-xs font-mono">
          <span className="flex items-center gap-1 text-ok">
            <Wifi className="h-3 w-3" /> MQTT Online
          </span>
          <span className="flex items-center gap-1 text-ok">
            <BatteryMedium className="h-3 w-3" /> {caseData.battery}%
          </span>
          <span className="flex items-center gap-1 text-ok">
            <MapPin className="h-3 w-3" /> GPS Active
          </span>
          <span className="flex items-center gap-1 text-[--color-chart-5]">
            <ShieldCheck className="h-3 w-3" /> cert=OK
          </span>
        </div>
      </div>

      {/* ── Terminal log ─────────────────────────────────────────────────── */}
      <div
        ref={logRef}
        className="rounded-lg border border-border bg-background p-4 h-[500px] overflow-y-auto font-mono text-xs leading-relaxed scroll-smooth"
        style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
      >
        {lines.map((l) => (
          <div key={l.id} className="flex gap-3 hover:bg-card/50 rounded px-1 py-0.5">
            <span className="shrink-0 text-muted-foreground/40 tabular-nums w-16">{l.time}</span>
            <span className={`shrink-0 w-7 font-bold ${lineColor[l.type]}`}>{l.type}</span>
            <span className={lineColor[l.type]}>{l.msg}</span>
          </div>
        ))}
        {simRunning && (
          <div className="flex gap-3 px-1 py-0.5">
            <span className="shrink-0 text-muted-foreground/40 w-16">{fmtSimLabel(simTimeHours)}</span>
            <span className="shrink-0 w-7 text-primary">SYS</span>
            <span className="text-primary">
              <span className="animate-pulse">▌</span>
            </span>
          </div>
        )}
        {!simRunning && simTimeHours === 0 && (
          <div className="mt-4 text-muted-foreground/40">
            ► Inicia la simulación para ver telemetría en vivo…
          </div>
        )}
      </div>

      {/* ── Telemetría actual ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Temp. interna",  value: `${caseData.tempInternal.toFixed(2)} °C`, cls: caseData.tempInternal > 4.5 ? "text-warn" : "text-ok" },
          { label: "Batería",        value: `${caseData.battery}%`,                  cls: caseData.battery < 30 ? "text-danger" : "text-ok" },
          { label: "Conectividad",   value: caseData.connectivity,                   cls: "text-[--color-chart-5]" },
          { label: "Firma ECDSA",    value: "OK · IoT-CA",                            cls: "text-[--color-chart-5]" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60">{m.label}</p>
            <p className={`mt-1 font-mono text-sm font-bold ${m.cls}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Nota: sin datos clínicos ──────────────────────────────────────── */}
      <div className="rounded-lg border border-dashed border-border p-3 text-center">
        <p className="text-xs text-muted-foreground/60">
          Este dispositivo solo tiene acceso a datos de telemetría del contenedor.
          No recibe ni procesa información clínica, de pacientes ni de asignaciones.
        </p>
      </div>
    </div>
  )
}
