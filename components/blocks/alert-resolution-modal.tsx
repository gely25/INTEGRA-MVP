"use client"

import { useState, useEffect } from "react"
import type { AlertItem } from "@/lib/case-data"
import { AlertTriangle, X, ShieldAlert, UserX, CheckCircle, FastForward, FileText, Bell, MapPin } from "lucide-react"
import { toast } from "sonner"

interface Props {
  alert: AlertItem | null
  open: boolean
  onClose: () => void
  onResolve: (alertId: string, resolution: string, notes: string) => void
}

export function AlertResolutionModal({ alert, open, onClose, onResolve }: Props) {
  const [resolutionType, setResolutionType] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>("")

  useEffect(() => {
    if (!open) {
      setNotes("")
      // Always reset to null — the coordinator must make an explicit selection.
      // This action is immutably signed into the ledger; no default is acceptable.
      setResolutionType(null)
    }
  }, [open])

  if (!open || !alert) return null

  const handleConfirm = () => {
    if (!resolutionType) {
      toast.error("Debe seleccionar una acción correctiva antes de firmar.")
      return
    }

    const labels: Record<string, string> = {
      // Security resolutions
      JUSTIFY:        "Acceso justificado operacionalmente",
      BLOCK:          "Usuario bloqueado y credenciales revocadas",
      FALSE_POSITIVE: "Marcado como falso positivo — modelo IA reajustado",
      // Custody resolutions
      ACCELERATE:  "Protocolo de aceleración de transporte activado",
      NOTIFY_DEST: "Hospital destino notificado sobre estado del traslado",
      IN_RANGE:    "Estado confirmado dentro de rango aceptable",
    }

    onResolve(alert.id, labels[resolutionType] || "Alerta resuelta", notes)
    toast.success(`Alerta resuelta: ${labels[resolutionType]}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-danger/15 text-danger border border-danger/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-card-foreground">Resolución de Alerta de Seguridad</h3>
              <p className="text-[10px] text-muted-foreground/60 font-mono">Código: {alert.code} · ID: {alert.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground/60 hover:bg-border hover:text-card-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Alert summary card */}
          <div className="rounded-lg border border-border bg-background p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-danger flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {alert.title}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/60">{alert.time}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{alert.detail}</p>
          </div>

          {/* Action selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              Acción Correctiva / Resolución Criptográfica
            </label>
            {(() => {
              /**
               * Options set is chosen by alertCategory (see alert-resolution-modal logic).
               * Grid columns adapt dynamically to options.length:
               *   3 options → grid-cols-3 (single row, no orphan cell)
               *   2 options → grid-cols-2
               *   4+        → grid-cols-2 (two rows)
               */
              const options =
                alert.alertCategory === "custody"
                  ? [
                      { id: "ACCELERATE",  label: "Acelerar Entrega",   icon: FastForward, desc: "Activar protocolo urgente de traslado" },
                      { id: "NOTIFY_DEST", label: "Notificar Destino",   icon: Bell,        desc: "Avisar al hospital receptor del estado" },
                      { id: "IN_RANGE",    label: "Confirmar en Rango",  icon: CheckCircle, desc: "Temperatura / GPS dentro de parámetros" },
                    ]
                  : [
                      { id: "JUSTIFY",        label: "Justificar Acceso", icon: FileText,    desc: "Registrar motivo operacional válido" },
                      { id: "BLOCK",          label: "Bloquear Usuario",   icon: UserX,       desc: "Revocar certificado X.509 de inmediato" },
                      { id: "FALSE_POSITIVE", label: "Falso Positivo",     icon: CheckCircle, desc: "Desestimar y reajustar modelo IA" },
                    ]

              const gridClass =
                options.length === 3 ? "grid grid-cols-3 gap-2" :
                options.length === 2 ? "grid grid-cols-2 gap-2" :
                                      "grid grid-cols-2 gap-2"

              return (
                <div className={gridClass}>
                  {options.map((opt) => {
                    const Icon = opt.icon
                    const selected = resolutionType === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setResolutionType(opt.id)}
                        className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-card-foreground"
                            : "border-border bg-secondary hover:border-muted-foreground/60 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Icon className={`h-3.5 w-3.5 ${selected ? "text-primary" : "text-muted-foreground/60"}`} />
                          {opt.label}
                        </div>
                        <span className="text-[9px] mt-1 opacity-80 leading-normal">{opt.desc}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* Notes textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              Observaciones del Coordinador (Firmadas en Ledger)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ingrese justificación detallada para el registro inmutable de auditoría..."
              className="w-full h-20 bg-background border border-border rounded-lg p-2.5 text-xs text-card-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-card-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!resolutionType}
            className="px-4 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            Confirmar y Firmar Resolución
          </button>
        </div>
      </div>
    </div>
  )
}
