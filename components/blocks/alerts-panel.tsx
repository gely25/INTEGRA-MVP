"use client"

import { useStore } from "@/lib/store"
import type { RoleActor } from "@/lib/case-data"
import { cn } from "@/lib/utils"
import { AlertTriangle, Info, Check, BellRing, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const levelMeta = {
  info:   { icon: Info,          cls: "border-[#4fb8c4]/30 bg-[#1d3540]",   dot: "text-[#4fb8c4]" },
  warn:   { icon: AlertTriangle, cls: "border-[#cfa25e]/40 bg-[#332818]",   dot: "text-[#cfa25e]" },
  danger: { icon: AlertTriangle, cls: "border-[#e5626a]/40 bg-[#2a1214]",   dot: "text-[#e5626a]" },
} as const

interface Props {
  canAcknowledge?: boolean
  /** If true, hide technical codes and show plain text for Hospital mode */
  plainMode?: boolean
  /** Filter alerts to those visible for this role */
  role?: RoleActor
  title?: string
  description?: string
}

export function AlertsPanel({
  canAcknowledge = false,
  plainMode = false,
  role,
  title = "Alertas",
  description = "Eventos de temperatura, conectividad y anomalías del traslado.",
}: Props) {
  const { alerts, acknowledgeAlert } = useStore()

  // Filter by role visibility
  const filtered = alerts.filter((a) => {
    if (!role) return true
    if (!a.visibleTo) return true
    return a.visibleTo.includes(role)
  })

  return (
    <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#22384d]">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-[#4fb8c4]" />
          <h3 className="text-sm font-semibold text-[#f0f5f9]">{title}</h3>
          {filtered.filter((a) => !a.acknowledged).length > 0 && (
            <span className="rounded-full bg-[#e5626a] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {filtered.filter((a) => !a.acknowledged).length}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[#7d94a8]">{description}</p>
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#22384d] py-6 text-center">
            <Shield className="mx-auto mb-2 h-5 w-5 text-[#54697c]" />
            <p className="text-sm text-[#54697c]">Sin alertas activas.</p>
          </div>
        )}

        {filtered.map((a) => {
          const meta = levelMeta[a.level]
          const Icon = meta.icon
          const displayDetail = plainMode && a.plainDetail ? a.plainDetail : a.detail

          return (
            <div key={a.id} className={cn("flex items-start gap-3 rounded-lg border p-3", meta.cls)}>
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.dot)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-[#f0f5f9]">{a.title}</p>
                  <span className="shrink-0 font-mono text-xs text-[#54697c] tabular-nums">{a.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-[#7d94a8]">{displayDetail}</p>
                <div className="mt-2 flex items-center gap-2">
                  {!plainMode && (
                    <span className="rounded bg-[#132538] px-1.5 py-0.5 font-mono text-[10px] text-[#54697c]">
                      {a.code}
                    </span>
                  )}
                  {a.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#79cf9c]">
                      <Check className="h-3 w-3" /> Atendida
                    </span>
                  ) : canAcknowledge ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[11px] border-[#22384d] bg-transparent text-[#dbe6ef] hover:bg-[#132538]"
                      onClick={() => acknowledgeAlert(a.id)}
                    >
                      Atender
                    </Button>
                  ) : (
                    <span className="text-[11px] text-[#cfa25e]">Pendiente</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
