"use client"

import { useState, useEffect } from "react"
import type { AlertItem } from "@/lib/case-data"
import { AlertTriangle, X, ShieldAlert, UserX, CheckCircle, FastForward, FileText } from "lucide-react"
import { toast } from "sonner"

interface Props {
  alert: AlertItem | null
  open: boolean
  onClose: () => void
  onResolve: (alertId: string, resolution: string, notes: string) => void
}

export function AlertResolutionModal({ alert, open, onClose, onResolve }: Props) {
  const [resolutionType, setResolutionType] = useState<string>("JUSTIFY")
  const [notes, setNotes] = useState<string>("")

  useEffect(() => {
    if (!open) {
      setNotes("")
      setResolutionType("JUSTIFY")
    }
  }, [open])

  if (!open || !alert) return null

  const handleConfirm = () => {
    if (!notes.trim() && resolutionType === "JUSTIFY") {
      toast.error("Debe ingresar una justificación o motivo para la auditoría.")
      return
    }

    const labels: Record<string, string> = {
      JUSTIFY: "Acceso justificado operacionalmente",
      BLOCK: "Usuario bloqueado y credenciales revocadas",
      FALSE_POSITIVE: "Marcado como falso positivo",
      ACCELERATE: "Protocolo de aceleración de transporte activado",
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
        className="relative w-full max-w-lg rounded-xl border border-[#22384d] bg-[#0f1e2c] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#22384d] bg-[#132538]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#e5626a]/15 text-[#e5626a] border border-[#e5626a]/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0f5f9]">Resolución de Alerta de Seguridad</h3>
              <p className="text-[10px] text-[#54697c] font-mono">Código: {alert.code} · ID: {alert.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#54697c] hover:bg-[#22384d] hover:text-[#f0f5f9] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Alert summary card */}
          <div className="rounded-lg border border-[#22384d] bg-[#070d12] p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e5626a] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {alert.title}
              </span>
              <span className="text-[10px] font-mono text-[#54697c]">{alert.time}</span>
            </div>
            <p className="text-xs text-[#7d94a8] leading-relaxed">{alert.detail}</p>
          </div>

          {/* Action selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-[#54697c] tracking-wider">
              Acción Correctiva / Resolución Criptográfica
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "JUSTIFY", label: "Justificar Acceso", icon: FileText, desc: "Registrar motivo operacional válido" },
                { id: "BLOCK", label: "Bloquear Usuario", icon: UserX, desc: "Revocar certificado X.509 de inmediato" },
                { id: "FALSE_POSITIVE", label: "Falso Positivo", icon: CheckCircle, desc: "Desestimar y reajustar modelo IA" },
                { id: "ACCELERATE", label: "Acelerar Entrega", icon: FastForward, desc: "Notificar logística por isquemia" },
              ].map((opt) => {
                const Icon = opt.icon
                const selected = resolutionType === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setResolutionType(opt.id)}
                    className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                      selected
                        ? "border-[#4fb8c4] bg-[#4fb8c4]/10 text-[#f0f5f9]"
                        : "border-[#22384d] bg-[#132538] hover:border-[#54697c] text-[#7d94a8]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Icon className={`h-3.5 w-3.5 ${selected ? "text-[#4fb8c4]" : "text-[#54697c]"}`} />
                      {opt.label}
                    </div>
                    <span className="text-[9px] mt-1 opacity-80 leading-normal">{opt.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#54697c] tracking-wider">
              Observaciones del Coordinador (Firmadas en Ledger)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ingrese justificación detallada para el registro inmutable de auditoría..."
              className="w-full h-20 bg-[#070d12] border border-[#22384d] rounded-lg p-2.5 text-xs text-[#f0f5f9] placeholder-[#54697c] focus:outline-none focus:border-[#4fb8c4]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#22384d] bg-[#132538]/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-[#7d94a8] hover:text-[#f0f5f9] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#4fb8c4] hover:bg-[#4fb8c4]/80 text-[#0a141f] transition-all"
          >
            Confirmar y Firmar Resolución
          </button>
        </div>
      </div>
    </div>
  )
}
