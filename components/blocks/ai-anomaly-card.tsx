"use client"

import { Brain, ShieldAlert, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export function AiAnomalyCard() {
  const { aiAnomalyReviewed, markAiReviewed, simTimeHours } = useStore()

  // Only visible after T=8h
  if (simTimeHours < 8) return null

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-500 ${
        aiAnomalyReviewed
          ? "border-[#22384d] bg-[#0f1e2c] opacity-60"
          : "border-[#8b9dff]/60 bg-[#22254a]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            aiAnomalyReviewed ? "bg-[#22384d]" : "bg-[#8b9dff]/20 ring-1 ring-[#8b9dff]/40"
          }`}
        >
          <Brain
            className={`h-4 w-4 ${aiAnomalyReviewed ? "text-[#54697c]" : "text-[#8b9dff]"}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p
              className={`text-sm font-semibold ${
                aiAnomalyReviewed ? "text-[#54697c]" : "text-[#f0f5f9]"
              }`}
            >
              {aiAnomalyReviewed ? "Evento revisado" : "⚠ Comportamiento anómalo detectado (IA)"}
            </p>
            {!aiAnomalyReviewed && (
              <span className="text-[10px] font-mono bg-[#8b9dff]/20 text-[#8b9dff] px-2 py-0.5 rounded-full border border-[#8b9dff]/30">
                T+08h00m
              </span>
            )}
          </div>

          {!aiAnomalyReviewed ? (
            <>
              <p className="mt-1 text-xs text-[#7d94a8] leading-relaxed">
                Un coordinador consultó registros de compatibilidad a las <strong className="text-[#dbe6ef]">02:14 hs</strong>{" "}
                con credenciales válidas. La IA detectó una desviación estadística de{" "}
                <strong className="text-[#8b9dff]">3.2σ</strong> respecto al patrón habitual del usuario.
                No hay regla fija violada — es una anomalía de comportamiento.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-[#cfa25e]" />
                <span className="text-[10px] text-[#cfa25e] font-mono">
                  Detección por desviación estadística · sin regla fija
                </span>
              </div>
              <Button
                size="sm"
                className="mt-3 h-7 px-3 text-xs bg-[#8b9dff] hover:bg-[#8b9dff]/80 text-[#0a141f] font-bold"
                onClick={markAiReviewed}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Marcar como revisado
              </Button>
            </>
          ) : (
            <p className="mt-1 text-xs text-[#54697c]">
              Marcado como revisado por el operador.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
