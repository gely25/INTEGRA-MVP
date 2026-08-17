"use client"

import { useEffect } from "react"
import { ShieldX, X, Copy } from "lucide-react"
import { toast } from "sonner"

interface EndorsementErrorModalProps {
  open: boolean
  onClose: () => void
  txId?: string
}

export function EndorsementErrorModal({
  open,
  onClose,
  txId = "tx_REJECTED_fraud_sim",
}: EndorsementErrorModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  const lines = [
    { label: "Error",     value: "ENDORSEMENT_POLICY_FAILURE", color: "text-danger" },
    { label: "TxId",      value: txId,                          color: "text-warn" },
    { label: "Status",    value: "REJECTED",                    color: "text-danger" },
    { label: "Channel",   value: "custody-channel",             color: "text-primary" },
    { label: "Chaincode", value: "CustodyChain v2.1",           color: "text-muted-foreground" },
    { label: "Caller",    value: "hospital_donante (Org CA)",   color: "text-muted-foreground" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-danger/40 bg-danger/5 shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-danger via-warn to-danger" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/15 border border-danger/30">
              <ShieldX className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-danger font-mono">
                Hyperledger Fabric — Endorsement Policy Failure
              </p>
              <h3 className="text-base font-bold text-card-foreground leading-tight mt-0.5">
                Transacción Rechazada
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground/60 hover:bg-danger/10 hover:text-card-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main message */}
        <div className="mx-5 rounded-lg bg-danger/10 border border-danger/20 p-4 mb-4">
          <p className="text-sm font-semibold text-danger leading-relaxed">
            ⛔ Error de Endorsement Policy
          </p>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Se requiere la firma del coordinador{" "}
            <span className="text-card-foreground font-mono font-semibold">INCUCAI (Org CA)</span>{" "}
            y el atributo RBAC{" "}
            <code className="text-warn bg-warn/10 px-1 py-0.5 rounded text-[10px]">
              hospital_donante
            </code>{" "}
            no posee permisos para modificar la lista de espera. La política de endorsamiento
            requiere firmas de al menos{" "}
            <span className="text-card-foreground font-semibold">2 organizaciones distintas</span>{" "}
            (INCUCAI + Hospital Receptor).
          </p>
        </div>

        {/* Technical detail table */}
        <div className="mx-5 mb-4">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2 font-mono">
            Detalle técnico
          </p>
          <div className="rounded-lg border border-border bg-background divide-y divide-border font-mono text-[11px]">
            {lines.map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2">
                <span className="text-muted-foreground/60 w-20 shrink-0">{label}</span>
                <span className={`text-right truncate ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-5 pb-5">
          <button
            onClick={() => {
              navigator.clipboard.writeText(txId)
              toast.info("TxId copiado al portapapeles")
            }}
            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copiar TxId
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold px-4 py-2 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
