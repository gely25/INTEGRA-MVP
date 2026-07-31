"use client"

import { useStore } from "@/lib/store"
import { Traceability } from "@/components/blocks/traceability"
import { AiAnomalyCard } from "@/components/blocks/ai-anomaly-card"
import { StatusPill } from "@/components/status-pill"
import {
  FileSearch, Hash, Server, Clock, CheckCircle2, AlertCircle,
  ShieldCheck, AlertTriangle
} from "lucide-react"

// Simulated audit cert expiry date
const CERT_EXPIRY = "2025-02-14T23:59:59Z"

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#22384d] last:border-0">
      <span className="text-xs text-[#7d94a8]">{label}</span>
      <span className="text-xs font-medium text-right">{value}</span>
    </div>
  )
}

export function AuditorView() {
  const {
    events, alerts, caseData, simTimeHours, scenario,
  } = useStore()

  const totalEvents   = events.length
  const brokenEvents  = events.filter((e) => e.status === "BROKEN")
  const validEvents   = events.filter((e) => e.status === "VALID")
  const finalStatus   = brokenEvents.length === 0 ? "VALID" : "COMPROMISED"
  const isReceived    = caseData.status === "Recibido" || caseData.status === "Cerrado"

  const insiderAlert   = alerts.find((a) => a.code === "WAITING_LIST_TAMPER_ATTEMPT")
  const ransomwareAlert = alerts.find((a) => a.code === "RANSOMWARE_NODE_ISOLATED")

  return (
    <div className="space-y-5">

      {/* ── Resumen forense ───────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#4fb8c4]/30 bg-[#0f1e2c] p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-[#4fb8c4]" />
            <h2 className="text-base font-semibold text-[#f0f5f9]">
              Auditoría — {caseData.caseId}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#54697c] border border-[#22384d] bg-[#132538] px-2 py-1 rounded">
            <ShieldCheck className="h-3 w-3 text-[#cfa25e]" />
            Certificado audit=true · Expira: {new Date(CERT_EXPIRY).toLocaleDateString("es-AR")}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#132538] p-3 rounded-xl border border-[#22384d]">
            <span className="text-[10px] uppercase text-[#7d94a8] font-medium">Resultado</span>
            <div className="mt-2 flex items-center gap-1.5">
              {finalStatus === "VALID"
                ? <><CheckCircle2 className="h-4 w-4 text-[#79cf9c]" /><span className="text-base font-bold text-[#79cf9c]">VALID</span></>
                : <><AlertCircle  className="h-4 w-4 text-[#e5626a]" /><span className="text-base font-bold text-[#e5626a]">COMPROMISED</span></>
              }
            </div>
          </div>
          <div className="bg-[#132538] p-3 rounded-xl border border-[#22384d]">
            <span className="text-[10px] uppercase text-[#7d94a8] font-medium">Eventos</span>
            <div className="mt-2 text-2xl font-bold font-mono text-[#f0f5f9]">{totalEvents}</div>
          </div>
          <div className="bg-[#132538] p-3 rounded-xl border border-[#22384d]">
            <span className="text-[10px] uppercase text-[#7d94a8] font-medium">Alterados</span>
            <div className={`mt-2 text-2xl font-bold font-mono ${brokenEvents.length > 0 ? "text-[#e5626a]" : "text-[#79cf9c]"}`}>
              {brokenEvents.length}
            </div>
          </div>
          <div className="bg-[#132538] p-3 rounded-xl border border-[#22384d]">
            <span className="text-[10px] uppercase text-[#7d94a8] font-medium">Recepción</span>
            <div className="mt-2 text-base font-bold font-mono">
              {isReceived
                ? <span className="text-[#79cf9c]">Confirmada</span>
                : <span className="text-[#cfa25e]">Pendiente</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Módulo de IA ──────────────────────────────────────────────────── */}
      <AiAnomalyCard />

      {/* ── Alertas de seguridad por escenario ───────────────────────────── */}
      {insiderAlert && (
        <div className="rounded-lg border border-[#e5626a]/50 bg-[#2a1214] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#e5626a] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#e5626a]">
                Transacción rechazada por endorsement policy
              </p>
              <p className="text-xs text-[#7d94a8] mt-1">
                Intento de modificación unilateral de la lista de espera. Requería 2 firmas de
                organizaciones distintas. La transacción fue rechazada y grabada en el ledger
                con status BROKEN.
              </p>
              <code className="mt-2 block font-mono text-[10px] bg-[#1a0a0b] text-[#e5626a] px-2 py-1 rounded">
                TxId: tx_REJECTED_0x4f2a · Status: BROKEN · Actor: Coord. R. Silva
              </code>
            </div>
          </div>
        </div>
      )}

      {ransomwareAlert && (
        <div className="rounded-lg border border-[#cfa25e]/40 bg-[#332818] p-4">
          <div className="flex items-start gap-3">
            <Server className="h-5 w-5 text-[#cfa25e] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#cfa25e]">Incidente de ransomware registrado</p>
              <p className="text-xs text-[#7d94a8] mt-1">
                peer0.hospitaldona fue aislado automáticamente. El orderer Raft continuó operando
                con peers redundantes. Restauración completada en 15 min desde backup offline.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="px-2 py-1 rounded bg-[#1a0a0b] text-[#e5626a]">peer0.hospitaldona: AISLADO → RESTAURADO</div>
                <div className="px-2 py-1 rounded bg-[#132538] text-[#79cf9c]">orderer.raft: SIN INTERRUPCIÓN</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Red blockchain ────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Server className="h-4 w-4 text-[#4fb8c4]" />
          <h3 className="text-sm font-semibold text-[#f0f5f9]">Red Blockchain</h3>
          <span className="ml-auto text-[10px] font-mono text-[#54697c]">Hyperledger Fabric · Raft</span>
        </div>
        <DataRow label="Canal"       value={<span className="font-mono text-[#dbe6ef]">custody-channel</span>} />
        <DataRow label="Chaincode"   value={<span className="font-mono text-[#dbe6ef]">CustodyChain v2.1</span>} />
        <DataRow label="Último bloque" value={<span className="font-mono text-[#dbe6ef]">#14983</span>} />
        <DataRow label="Peers activos" value={<StatusPill tone="ok">4/5 online</StatusPill>} />
        <DataRow label="Modo"        value={<StatusPill tone="warn">Demo / Simulado</StatusPill>} />
      </div>

      {/* ── Hitos del caso ────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-[#4fb8c4]" />
          <h3 className="text-sm font-semibold text-[#f0f5f9]">Hitos de custodia</h3>
        </div>
        {[
          { label: "Caso creado",          event: "CASE_CREATED"           },
          { label: "Match de compatibilidad", event: "COMPATIBILITY_MATCH" },
          { label: "Doble firma completa",  event: "ASSIGNMENT_SIGNED_HOSPITAL" },
          { label: "Traslado iniciado",     event: "TRANSPORT_STARTED"     },
          { label: "Recepción confirmada",  event: "CUSTODY_RECEIVED"      },
          { label: "Caso cerrado",          event: "CASE_CLOSED"           },
        ].map(({ label, event }) => {
          const found = events.find((e) => e.event === event)
          return (
            <div key={event} className="flex items-center justify-between py-2 border-b border-[#22384d] last:border-0">
              <span className="text-xs text-[#7d94a8]">{label}</span>
              {found
                ? <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#dbe6ef]">{found.time}</span>
                    <StatusPill tone="ok">OK</StatusPill>
                  </div>
                : <StatusPill tone="warn">Pendiente</StatusPill>
              }
            </div>
          )
        })}
      </div>

      {/* ── Ledger completo ───────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[#22384d]">
          <Hash className="h-4 w-4 text-[#4fb8c4]" />
          <h3 className="text-sm font-semibold text-[#f0f5f9]">Ledger criptográfico completo</h3>
          <span className="ml-auto text-[10px] font-mono bg-[#132538] text-[#4fb8c4] px-2 py-0.5 rounded-full border border-[#22384d]">
            SHA-256 encadenado
          </span>
        </div>
        <div className="p-4">
          <Traceability techMode role="auditor" />
        </div>
      </div>
    </div>
  )
}
