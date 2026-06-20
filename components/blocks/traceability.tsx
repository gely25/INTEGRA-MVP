"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { EVENT_LABEL } from "@/lib/case-data"
import { StatusPill } from "@/components/status-pill"

export function Traceability({ title = "Trazabilidad" }: { title?: string }) {
  const { events } = useStore()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Línea de tiempo de eventos de custodia con hash encadenado.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0">
          {events.map((e, i) => (
            <li key={e.id} className="flex gap-4 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />
                {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{EVENT_LABEL[e.event]}</p>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{e.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {e.actor} · {e.org}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {e.hash}
                  </code>
                  <StatusPill tone={e.status === "VALID" ? "ok" : e.status === "BROKEN" ? "danger" : "warn"}>
                    {e.status}
                  </StatusPill>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
