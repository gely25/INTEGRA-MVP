"use client"

import { Brain, ShieldAlert, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

// The AI anomaly uses chart-5 (#8b9dff) for the "AI/model" color — this is a
// dedicated chart token, not a semantic status. We keep it as chart-5 references.
// Everything else maps to semantic tokens.

interface AiAnomalyCardProps {
  readOnly?: boolean
}

export function AiAnomalyCard({ readOnly = false }: AiAnomalyCardProps = {}) {
  const { aiAnomalyReviewed, markAiReviewed, simTimeHours } = useStore()

  // Only visible after T=8h
  if (simTimeHours < 8) return null

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-500 ${
        readOnly ? "opacity-[0.85]" : ""
      } ${
        aiAnomalyReviewed
          ? "border-border bg-card opacity-60"
          : "border-chart-5/60 bg-chart-5/15"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            aiAnomalyReviewed ? "bg-muted" : "bg-chart-5/20 ring-1 ring-chart-5/40"
          }`}
        >
          <Brain
            className={`h-4 w-4 ${aiAnomalyReviewed ? "text-muted-foreground/60" : "text-chart-5"}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p
              className={`text-sm font-semibold ${
                aiAnomalyReviewed ? "text-muted-foreground/60" : "text-card-foreground"
              }`}
            >
              {aiAnomalyReviewed ? "Evento revisado" : "⚠ Comportamiento anómalo detectado (IA)"}
            </p>
            {!aiAnomalyReviewed && (
              <span className="text-[10px] font-mono bg-chart-5/20 text-chart-5 px-2 py-0.5 rounded-full border border-chart-5/30">
                T+08h00m
              </span>
            )}
          </div>

          {!aiAnomalyReviewed ? (
            <>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Un coordinador consultó registros de compatibilidad a las <strong className="text-foreground">02:14 hs</strong>{" "}
                con credenciales válidas. La IA detectó una desviación estadística de{" "}
                <strong className="text-chart-5">3.2σ</strong> respecto al patrón habitual del usuario.
                No hay regla fija violada — es una anomalía de comportamiento.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-warn" />
                <span className="text-[10px] text-warn font-mono">
                  Detección por desviación estadística · sin regla fija
                </span>
              </div>
              {!readOnly ? (
                <Button
                  size="sm"
                  className="mt-3 h-7 px-3 text-xs bg-chart-5 hover:bg-chart-5/80 text-primary-foreground font-bold"
                  onClick={markAiReviewed}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Marcar como revisado
                </Button>
              ) : (
                <p className="mt-3 text-xs text-warn/80 font-mono flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-warn shrink-0" />
                  Pendiente de revisión por el operador (solo lectura)
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground/60">
              Marcado como revisado por el operador.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
