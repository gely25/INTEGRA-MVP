"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { AlertTriangle, Info, Check, BellRing } from "lucide-react"

const levelMeta = {
  info: { icon: Info, cls: "border-primary/30 bg-primary/5", dot: "text-primary" },
  warn: { icon: AlertTriangle, cls: "border-warn/40 bg-warn/5", dot: "text-warn" },
  danger: { icon: AlertTriangle, cls: "border-danger/40 bg-danger/5", dot: "text-danger" },
} as const

export function AlertsPanel({
  canAcknowledge = false,
  title = "Alertas",
  description = "Eventos de temperatura, conectividad y anomalías del traslado.",
}: {
  canAcknowledge?: boolean
  title?: string
  description?: string
}) {
  const { alerts, acknowledgeAlert } = useStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {alerts.length === 0 && (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            Sin alertas registradas.
          </p>
        )}
        {alerts.map((a) => {
          const meta = levelMeta[a.level]
          const Icon = meta.icon
          return (
            <div key={a.id} className={cn("flex items-start gap-3 rounded-lg border p-3", meta.cls)}>
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.dot)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{a.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {a.code}
                  </span>
                  {a.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ok">
                      <Check className="h-3 w-3" /> Atendida
                    </span>
                  ) : canAcknowledge ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[11px]"
                      onClick={() => acknowledgeAlert(a.id)}
                    >
                      Atender
                    </Button>
                  ) : (
                    <span className="text-[11px] text-warn">Pendiente</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
