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
    { label: "Error",     value: "ENDORSEMENT_POLICY_FAILURE", color: "text-[#e5626a]" },
    { label: "TxId",      value: txId,                          color: "text-[#cfa25e]" },
    { label: "Status",    value: "REJECTED",                    color: "text-[#e5626a]" },
    { label: "Channel",   value: "custody-channel",             color: "text-[#4fb8c4]" },
    { label: "Chaincode", value: "CustodyChain v2.1",           color: "text-[#7d94a8]" },
    { label: "Caller",    value: "hospital_donante (Org CA)",   color: "text-[#7d94a8]" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#e5626a]/40 bg-[#100609] shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#e5626a] via-[#cfa25e] to-[#e5626a]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5626a]/15 border border-[#e5626a]/30">
              <ShieldX className="h-5 w-5 text-[#e5626a]" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#e5626a] font-mono">
                Hyperledger Fabric — Endorsement Policy Failure
              </p>
              <h3 className="text-base font-bold text-[#f0f5f9] leading-tight mt-0.5">
                Transacción Rechazada
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[#54697c] hover:bg-[#1a0a0b] hover:text-[#f0f5f9] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main message */}
        <div className="mx-5 rounded-lg bg-[#1a0a0b] border border-[#e5626a]/20 p-4 mb-4">
          <p className="text-sm font-semibold text-[#e5626a] leading-relaxed">
            ⛔ Error de Endorsement Policy
          </p>
          <p className="mt-2 text-xs text-[#7d94a8] leading-relaxed">
            Se requiere la firma del coordinador{" "}
            <span className="text-[#f0f5f9] font-mono font-semibold">INCUCAI (Org CA)</span>{" "}
            y el atributo RBAC{" "}
            <code className="text-[#cfa25e] bg-[#332818] px-1 py-0.5 rounded text-[10px]">
              hospital_donante
            </code>{" "}
            no posee permisos para modificar la lista de espera. La política de endorsamiento
            requiere firmas de al menos{" "}
            <span className="text-[#f0f5f9] font-semibold">2 organizaciones distintas</span>{" "}
            (INCUCAI + Hospital Receptor).
          </p>
        </div>

        {/* Technical detail table */}
        <div className="mx-5 mb-4">
          <p className="text-[9px] uppercase tracking-widest text-[#54697c] font-bold mb-2 font-mono">
            Detalle técnico
          </p>
          <div className="rounded-lg border border-[#22384d] bg-[#0a141f] divide-y divide-[#22384d] font-mono text-[11px]">
            {lines.map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2">
                <span className="text-[#54697c] w-20 shrink-0">{label}</span>
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
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#54697c] hover:text-[#dbe6ef] transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copiar TxId
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#22384d] hover:bg-[#2d4a61] text-[#dbe6ef] text-xs font-bold px-4 py-2 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
