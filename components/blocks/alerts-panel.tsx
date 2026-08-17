"use client"

import { useStore } from "@/lib/store"
import type { RoleActor, AlertItem } from "@/lib/case-data"
import { cn } from "@/lib/utils"
import { AlertTriangle, Info, Check, BellRing, Shield, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

const levelMeta = {
  info:   { icon: Info,          cls: "border-primary/30 bg-accent",       dot: "text-primary" },
  warn:   { icon: AlertTriangle, cls: "border-warn/40 bg-warn/5",          dot: "text-warn" },
  danger: { icon: AlertTriangle, cls: "border-danger/40 bg-danger/5",      dot: "text-danger" },
} as const

interface Props {
  canAcknowledge?: boolean
  /** If true, hide technical codes and show plain text for Hospital mode */
  plainMode?: boolean
  /** Filter alerts to those visible for this role */
  role?: RoleActor
  title?: string
  description?: string
  onActionClick?: (alert: AlertItem) => void
}

export function AlertsPanel({
  canAcknowledge = false,
  plainMode = false,
  role,
  title = "Alertas",
  description = "Eventos de temperatura, conectividad y anomalías del traslado.",
  onActionClick,
}: Props) {
  const { alerts, acknowledgeAlert } = useStore()

  // Filter by role visibility
  const filtered = alerts.filter((a) => {
    if (!role) return true
    if (!a.visibleTo) return true
    return a.visibleTo.includes(role)
  })

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
          {filtered.filter((a) => !a.acknowledged).length > 0 && (
            <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-danger-foreground">
              {filtered.filter((a) => !a.acknowledged).length}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-6 text-center">
            <Shield className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground/60">Sin alertas activas.</p>
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
                  <p className="truncate text-sm font-medium text-card-foreground">{a.title}</p>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground/60 tabular-nums">{a.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{displayDetail}</p>
                <div className="mt-2 flex items-center gap-2">
                  {!plainMode && (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60">
                      {a.code}
                    </span>
                  )}
                  {a.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ok">
                      <Check className="h-3 w-3" /> Resuelta
                    </span>
                  ) : canAcknowledge ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2.5 text-[11px] border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 font-bold"
                      onClick={() => onActionClick ? onActionClick(a) : acknowledgeAlert(a.id)}
                    >
                      <ShieldAlert className="h-3 w-3" />
                      Resolver
                    </Button>
                  ) : (
                    <span className="text-[11px] text-warn">Pendiente</span>
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
