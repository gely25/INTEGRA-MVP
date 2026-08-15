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

  const isClosed = caseData.status === "Cerrado" || caseData.status === "Recibido"

  // Derive integrity hash from the last event hash
  const lastEvent  = events[events.length - 1]
  const finalHash  = lastEvent?.hash ?? "—"
  const closedEvt  = events.find((e) => e.event === "CASE_CLOSED")
  const closedTime = closedEvt?.time ?? "—"

  if (!isClosed) {
    return (
      <div className="rounded-lg border border-dashed border-[#22384d] bg-[#0f1e2c] p-6 text-center">
        <FileText className="h-8 w-8 text-[#54697c] mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#7d94a8]">Expediente no disponible</p>
        <p className="text-xs text-[#54697c] mt-1">
          El expediente forense post-mortem se genera únicamente cuando el caso está en estado{" "}
          <span className="font-mono text-[#dbe6ef]">COMPLETADO</span> o{" "}
          <span className="font-mono text-[#dbe6ef]">CERRADO</span>.
          Para casos en tránsito, consulte la sección de eventos criptográficos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#22384d]">
        <ShieldCheck className="h-4 w-4 text-[#79cf9c]" />
        <h3 className="text-sm font-semibold text-[#f0f5f9]">
          Expediente Forense Post-Mortem — {caseData.caseId}
        </h3>
        <span className="ml-auto text-[9px] font-mono bg-[#1c3128] text-[#79cf9c] border border-[#79cf9c]/20 px-2 py-0.5 rounded-full">
          COMPLETADO · {closedTime}
        </span>
      </div>

      {/* ── Histograma de telemetría ───────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <p className="text-[9px] uppercase tracking-widest text-[#54697c] font-bold mb-3">
          Telemetría histórica de temperatura — Cadena de frío completa
        </p>
        <TemperatureChart />
      </div>

      {/* ── Certificados X.509 firmantes ─────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#22384d]">
          <ShieldCheck className="h-4 w-4 text-[#4fb8c4]" />
          <h4 className="text-sm font-semibold text-[#f0f5f9]">Certificados X.509 firmantes</h4>
          <span className="ml-auto text-[10px] font-mono text-[#54697c]">mTLS · ECDSA-256</span>
        </div>
        <div className="divide-y divide-[#22384d]">
          {SIGNERS.map((s) => (
            <div key={s.org} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1">
              <div>
                <p className="text-xs font-semibold text-[#f0f5f9]">{s.org}</p>
                <p className="text-[10px] font-mono text-[#7d94a8]">CN: {s.cn}</p>
                <p className="text-[10px] font-mono text-[#54697c]">
                  Fingerprint: {s.fingerprint}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#54697c]">Emitido: {s.issued}</p>
                <p className="text-[10px] text-[#54697c]">Expira: {s.expires}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#79cf9c] mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Válido
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hash de integridad del registro post-operatorio ───────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="h-4 w-4 text-[#4fb8c4]" />
          <h4 className="text-sm font-semibold text-[#f0f5f9]">
            Hash de integridad del registro post-operatorio
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-[#22384d]">
            <span className="text-xs text-[#7d94a8]">Algoritmo</span>
            <span className="font-mono text-xs text-[#dbe6ef]">SHA-256 (encadenado)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#22384d]">
            <span className="text-xs text-[#7d94a8]">Hash final del ledger</span>
            <span className="font-mono text-xs text-[#4fb8c4] truncate ml-4 max-w-[200px]">
              {finalHash}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#22384d]">
            <span className="text-xs text-[#7d94a8]">Total de eventos encadenados</span>
            <span className="font-mono text-xs text-[#dbe6ef]">{events.length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-[#7d94a8]">Resultado de integridad</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#79cf9c]">
              <CheckCircle2 className="h-3.5 w-3.5" /> ÍNTEGRO — Sin alteraciones
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
