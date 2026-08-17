"use client"

import { useState, useEffect } from "react"
import { FileSignature, X, ShieldCheck, KeyRound, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
  onSign: () => Promise<void>
  contractId: string
  caseId?: string
  organ?: string
}

export function CryptoAuthorizationModal({
  open,
  onClose,
  onSign,
  contractId,
  caseId = "AR-2024-0102",
  organ = "Riñón",
}: Props) {
  const [loading, setLoading] = useState(false)
  const [totp, setTotp] = useState("")

  useEffect(() => {
    if (!open) {
      setTotp("")
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  const handleConfirmSign = async () => {
    if (totp.length < 6) {
      toast.error("Ingrese el código de verificación MFA/TOTP de 6 dígitos.")
      return
    }

    setLoading(true)

    // Simulate 1s cryptographic signing + Fabric chaincode invocation delay
    setTimeout(async () => {
      try {
        await onSign()
        const txId = `tx_419914_${Math.random().toString(16).slice(2, 10)}`
        toast.success("Autorización Criptográfica registrada en Hyperledger Fabric", {
          description: `TxId: ${txId}`,
        })
        onClose()
      } catch {
        toast.error("Error en la verificación del certificado X.509")
      } finally {
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-primary/40 bg-card shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-ok to-primary" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border bg-secondary/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30">
              <FileSignature className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary font-mono">
                INCUCAI Org CA — Endorsement Signature
              </p>
              <h3 className="text-base font-bold text-card-foreground leading-tight mt-0.5">
                Emitir Autorización Criptográfica
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-muted-foreground/60 hover:bg-border hover:text-card-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Case & Organ info */}
          <div className="rounded-xl border border-border bg-background p-4 grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 block font-sans">Caso a Autorizar</span>
              <span className="font-bold text-card-foreground text-sm">{caseId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 block font-sans">Órgano en Traslado</span>
              <span className="font-bold text-primary text-sm">{organ}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-border/60 flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground/60 font-sans">Contrato de Asignación:</span>
              <span className="text-foreground font-bold">{contractId}</span>
            </div>
          </div>

          {/* Signer credential info */}
          <div className="rounded-xl border border-border bg-secondary/70 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-ok font-bold text-xs pb-1 border-b border-border/50">
              <ShieldCheck className="h-4 w-4" />
              Credencial Firmante Verificada (PKI)
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Actor / Rol:</span>
              <span className="text-card-foreground font-semibold">Coordinador Nacional</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Certificado X.509:</span>
              <span className="text-primary font-mono font-bold">INCUCAI Org CA (Root CA)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Esquema de Firma:</span>
              <span className="text-foreground font-mono">ECDSA P-256 / SHA-256</span>
            </div>
          </div>

          {/* MFA / TOTP Token input */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              Segundo Factor de Autenticación (MFA / Token TOTP)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={6}
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                disabled={loading}
                className="w-36 bg-background border border-border rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-[0.3em] font-bold text-primary placeholder-muted-foreground/40 focus:outline-none focus:border-primary"
              />
              <span className="text-[11px] text-muted-foreground/60 leading-tight">
                Ingrese el PIN de 6 dígitos generado por su dispositivo de seguridad institucional.
              </span>
            </div>
          </div>
        </div>

        {/* Loading overlay if submitting */}
        {loading && (
          <div className="absolute inset-0 bg-card/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 animate-in fade-in duration-150">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <div>
              <p className="text-sm font-bold text-card-foreground">Generando firma ECDSA P-256...</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">Registrando Endorsement en Hyperledger Fabric (custody-channel)</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-secondary/60">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            disabled={loading || totp.length < 6}
            onClick={handleConfirmSign}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/80 text-primary-foreground flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <KeyRound className="h-4 w-4" />
            Confirmar y Firmar en Ledger
          </button>
        </div>
      </div>
    </div>
  )
}

// Keep export alias for backward compatibility
export { CryptoAuthorizationModal as ManualSignModal }
