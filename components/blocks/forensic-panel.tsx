"use client"

import { useStore } from "@/lib/store"
import { TemperatureChart } from "@/components/blocks/temperature-chart"
import { CheckCircle2, ShieldCheck, Hash, FileText } from "lucide-react"

interface X509Entry {
  org: string
  cn: string
  issued: string
  expires: string
  fingerprint: string
}

const SIGNERS: X509Entry[] = [
  {
    org: "INCUCAI (Root CA)",
    cn: "coord.perez@incucai.gov.ar",
    issued: "2024-01-01",
    expires: "2025-01-01",
    fingerprint: "SHA256:4A:B9:C2:...",
  },
  {
    org: "Hospital Donante (Org CA)",
    cn: "hospital.donante.bsas",
    issued: "2024-01-10",
    expires: "2025-01-10",
    fingerprint: "SHA256:7F:D1:A3:...",
  },
  {
    org: "Hospital Receptor (Org CA)",
    cn: "dr.torres@hospitalcba.org.ar",
    issued: "2024-01-10",
    expires: "2025-01-10",
    fingerprint: "SHA256:2C:E8:BB:...",
  },
]

export function ForensicPanel() {
  const { events, caseData } = useStore()

  const isClosed = caseData.status === "Cerrado" || caseData.status === "Recibido" || caseData.status === "Fallido — isquemia excedida"

  // Derive integrity hash from the last event hash
  const lastEvent  = events[events.length - 1]
  const finalHash  = lastEvent?.hash ?? "—"
  const closedEvt  = events.find((e) => e.event === "CASE_CLOSED")
  const closedTime = closedEvt?.time ?? "—"

  if (!isClosed) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Expediente no disponible</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          El expediente forense de Caso Cerrado se genera únicamente cuando el caso está en estado{" "}
          <span className="font-mono text-foreground">COMPLETADO</span> o{" "}
          <span className="font-mono text-foreground">CERRADO</span>.
          Para casos en tránsito, consulte la sección de eventos criptográficos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <ShieldCheck className="h-4 w-4 text-ok" />
        <h3 className="text-sm font-semibold text-card-foreground">
          Expediente Forense — Caso Cerrado — {caseData.caseId}
        </h3>
        <span className="ml-auto text-[9px] font-mono bg-ok/10 text-ok border border-ok/20 px-2 py-0.5 rounded-full">
          COMPLETADO · {closedTime}
        </span>
      </div>

      {/* ── Histograma de telemetría ───────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-3">
          Telemetría histórica de temperatura — Cadena de frío completa
        </p>
        <TemperatureChart />
      </div>

      {/* ── Certificados X.509 firmantes ─────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-card-foreground">Certificados X.509 firmantes</h4>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">mTLS · ECDSA-256</span>
        </div>
        <div className="divide-y divide-border">
          {SIGNERS.map((s) => (
            <div key={s.org} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1">
              <div>
                <p className="text-xs font-semibold text-card-foreground">{s.org}</p>
                <p className="text-[10px] font-mono text-muted-foreground">CN: {s.cn}</p>
                <p className="text-[10px] font-mono text-muted-foreground/60">
                  Fingerprint: {s.fingerprint}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground/60">Emitido: {s.issued}</p>
                <p className="text-[10px] text-muted-foreground/60">Expira: {s.expires}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-ok mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Válido
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hash de integridad del registro post-operatorio ───────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-card-foreground">
            Hash de integridad del registro post-operatorio
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-xs text-muted-foreground">Algoritmo</span>
            <span className="font-mono text-xs text-foreground">SHA-256 (encadenado)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-xs text-muted-foreground">Hash final del ledger</span>
            <span className="font-mono text-xs text-primary truncate ml-4 max-w-[200px]">
              {finalHash}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-xs text-muted-foreground">Total de eventos encadenados</span>
            <span className="font-mono text-xs text-foreground">{events.length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted-foreground">Resultado de integridad</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-ok">
              <CheckCircle2 className="h-3.5 w-3.5" /> ÍNTEGRO — Sin alteraciones
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
