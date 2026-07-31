"use client"

import { useStore } from "@/lib/store"
import { EVENT_LABEL } from "@/lib/case-data"
import type { RoleActor } from "@/lib/case-data"
import { StatusPill } from "@/components/status-pill"
import { Hash, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

interface Props {
  /** If false (Hospital mode), hide hashes and use plain-language text */
  techMode?: boolean
  /** If provided, filter to only events visible to this role */
  role?: RoleActor
}

export function Traceability({ techMode = true, role }: Props) {
  const { events } = useStore()

  // Filter by role visibility
  const filtered = events.filter((e) => {
    if (!role) return true
    if (!e.visibleTo) return true
    return e.visibleTo.includes(role)
  })

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-[#22384d] border-dashed py-10 text-center">
        <Clock className="mx-auto mb-2 h-6 w-6 text-[#54697c]" />
        <p className="text-sm text-[#54697c]">Sin eventos registrados aún.</p>
        <p className="text-xs text-[#54697c] mt-1">Inicia la simulación para ver el feed de custodia.</p>
      </div>
    )
  }

  return (
    <ol className="relative space-y-0">
      {filtered.map((e, i) => {
        const isBroken = e.status === "BROKEN"
        const label = techMode
          ? EVENT_LABEL[e.event]
          : (e.plainText || EVENT_LABEL[e.event])

        return (
          <li key={e.id} className="flex gap-4 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${
                  isBroken
                    ? "bg-[#e5626a] ring-[#e5626a]/15"
                    : "bg-[#4fb8c4] ring-[#4fb8c4]/15"
                }`}
              />
              {i < filtered.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-[#22384d]" />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#f0f5f9] flex items-center gap-1.5">
                  {isBroken && <AlertTriangle className="h-3.5 w-3.5 text-[#e5626a] shrink-0" />}
                  {label}
                </p>
                <span className="font-mono text-xs text-[#54697c] tabular-nums">{e.time}</span>
              </div>

              <p className="text-xs text-[#7d94a8]">
                {e.actor} · {e.org}
              </p>

              {techMode && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <code className="flex items-center gap-1 rounded bg-[#132538] px-1.5 py-0.5 font-mono text-[10px] text-[#54697c]">
                    <Hash className="h-2.5 w-2.5" />
                    {e.hash}
                  </code>
                  {e.txId && (
                    <code className="rounded bg-[#132538] px-1.5 py-0.5 font-mono text-[10px] text-[#54697c]">
                      {e.txId.slice(0, 18)}…
                    </code>
                  )}
                  <StatusPill
                    tone={
                      e.status === "VALID"
                        ? "ok"
                        : e.status === "BROKEN"
                          ? "danger"
                          : "warn"
                    }
                  >
                    {e.status}
                  </StatusPill>
                </div>
              )}

              {!techMode && isBroken && (
                <div className="mt-1.5">
                  <StatusPill tone="danger">Alerta registrada</StatusPill>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
