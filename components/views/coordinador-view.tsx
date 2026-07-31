"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { IschemiaClock } from "@/components/ischemia-clock"
import { Traceability } from "@/components/blocks/traceability"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { AiAnomalyCard } from "@/components/blocks/ai-anomaly-card"
import { StatusPill } from "@/components/status-pill"
import { toast } from "sonner"
import {
  Clock, Shield, FileSignature, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronRight, Activity, Server
} from "lucide-react"
import { Button } from "@/components/ui/button"

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#22384d] last:border-0">
      <span className="text-xs text-[#7d94a8]">{label}</span>
      <span className="text-xs font-medium text-[#dbe6ef] text-right">{value}</span>
    </div>
  )
}

export function CoordinadorView() {
  const {
    caseData, events, alerts,
    assignmentContract, contractReached,
    signAssignment, scenario,
    simTimeHours, ransomwareActive, ransomwareRestored,
  } = useStore()

  const [showTrace, setShowTrace] = useState(false)

  const contract = assignmentContract
  const sigs     = contract.sigs
  const isPendingIncucai  = contractReached && !sigs.incucai
  const isIssued          = sigs.incucai && sigs.hospital

  const insiderVisible = (scenario === "insider" || scenario === "ransomware") && simTimeHours >= 10
  const insiderAlert   = alerts.find((a) => a.code === "WAITING_LIST_TAMPER_ATTEMPT")

  return (
    <div className="space-y-5">

      {/* ── Isquemia + Caso ───────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Gauge */}
        <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-[#4fb8c4]" />
            <h3 className="text-sm font-semibold text-[#f0f5f9]">Isquemia fría</h3>
          </div>
          <IschemiaClock />
        </div>

        {/* Datos del caso */}
        <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#4fb8c4]" />
            <h3 className="text-sm font-semibold text-[#f0f5f9]">Caso {caseData.caseId}</h3>
            <StatusPill tone={
              caseData.status === "Cerrado"  ? "ok" :
              caseData.status === "Recibido" ? "ok" :
              caseData.status === "En traslado" ? "warn" : "neutral"
            }>{caseData.status}</StatusPill>
          </div>
          <DataRow label="Órgano"    value={caseData.organ} />
          <DataRow label="Origen"    value={caseData.originCity} />
          <DataRow label="Destino"   value={caseData.destinationCity} />
          <DataRow label="Ubicación" value={caseData.currentLocation} />
          <DataRow label="Temp. int." value={
            <span className={caseData.tempInternal > 4 ? "text-[#cfa25e] font-bold" : "text-[#79cf9c]"}>
              {caseData.tempInternal.toFixed(1)} °C
            </span>
          } />
          <DataRow label="Custodia"  value={caseData.custodyStatus} />
        </div>
      </div>

      {/* ── Módulo de firma (gate real) ──────────────────────────────────── */}
      {contractReached && (
        <div className={`rounded-lg border p-4 ${
          isIssued
            ? "border-[#79cf9c]/40 bg-[#1c3128]"
            : "border-[#cfa25e]/40 bg-[#332818]"
        }`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileSignature className="h-4 w-4 text-[#cfa25e]" />
                <h3 className="text-sm font-semibold text-[#f0f5f9]">
                  Contrato de Asignación — {contract.id}
                </h3>
              </div>
              <p className="text-xs text-[#7d94a8]">
                Endorsement policy: requiere firma INCUCAI + Hospital Receptor
              </p>
              {/* Signature status pills */}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  sigs.incucai
                    ? "border-[#79cf9c]/30 bg-[#1c3128] text-[#79cf9c]"
                    : "border-[#cfa25e]/40 bg-[#332818] text-[#cfa25e]"
                }`}>
                  {sigs.incucai ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  INCUCAI: {sigs.incucai ? "✓ Firmado" : "Pendiente"}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  sigs.hospital
                    ? "border-[#79cf9c]/30 bg-[#1c3128] text-[#79cf9c]"
                    : "border-[#54697c]/40 bg-[#132538] text-[#7d94a8]"
                }`}>
                  {sigs.hospital ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  Hospital: {sigs.hospital ? "✓ Firmado" : "Esperando…"}
                </span>
              </div>
            </div>

            {/* Action area */}
            {isIssued ? (
              <div className="text-xs text-[#79cf9c] flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Contrato emitido — doble firma completa
              </div>
            ) : isPendingIncucai ? (
              <Button
                className="bg-[#4fb8c4] hover:bg-[#4fb8c4]/80 text-[#0a141f] font-bold text-xs"
                size="sm"
                onClick={async () => {
                  await signAssignment("incucai")
                  toast.success("Firma INCUCAI registrada en ledger", {
                    description: "Esperando firma del Hospital Receptor…",
                  })
                }}
              >
                <FileSignature className="mr-1.5 h-3.5 w-3.5" />
                Firmar mi parte (INCUCAI)
              </Button>
            ) : (
              <div className="text-xs text-[#7d94a8] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Tu firma ya registrada. Esperando Hospital…
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Módulo de IA ──────────────────────────────────────────────────── */}
      <AiAnomalyCard />

      {/* ── Escenario: Insider ────────────────────────────────────────────── */}
      {insiderVisible && insiderAlert && (
        <div className="rounded-lg border border-[#e5626a]/50 bg-[#2a1214] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#e5626a] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#e5626a]">
                Transacción RECHAZADA — Intento de manipulación de lista de espera
              </p>
              <p className="text-xs text-[#7d94a8] mt-1">
                Coord. R. Silva intentó modificar la lista de espera directamente sin la firma de
                una segunda organización. La endorsement policy de Hyperledger Fabric rechazó la
                transacción.
              </p>
              <code className="mt-2 block font-mono text-[10px] text-[#e5626a] bg-[#1a0a0b] px-2 py-1 rounded">
                TxId: tx_REJECTED_0x4f2a · Status: BROKEN · Intentos: 1
              </code>
            </div>
          </div>
        </div>
      )}

      {/* ── Escenario: Ransomware ─────────────────────────────────────────── */}
      {scenario === "ransomware" && simTimeHours >= 12 && (
        <div className={`rounded-lg border p-4 ${
          ransomwareRestored
            ? "border-[#4fb8c4]/30 bg-[#1d3540]"
            : "border-[#e5626a]/50 bg-[#2a1214]"
        }`}>
          <div className="flex items-start gap-3">
            <Server className={`h-5 w-5 shrink-0 mt-0.5 ${ransomwareRestored ? "text-[#4fb8c4]" : "text-[#e5626a]"}`} />
            <div>
              <p className={`text-sm font-semibold ${ransomwareRestored ? "text-[#4fb8c4]" : "text-[#e5626a]"}`}>
                {ransomwareRestored
                  ? "Nodo restaurado desde backup offline — red operativa"
                  : "⚠ Nodo aislado — actividad de cifrado en peer0.hospitaldona"}
              </p>
              <p className="text-xs text-[#7d94a8] mt-1">
                {ransomwareRestored
                  ? "peer0.hospitaldona restaurado. RTO: 15 min. Raft resincronizado. Bloque #14983 verificado. La red nunca dejó de operar (sin punto único de fallo)."
                  : "Actividad de cifrado detectada. Nodo aislado automáticamente. Orderer Raft continuó con peers redundantes. El traslado del órgano no fue interrumpido."}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className={`px-2 py-1 rounded ${ransomwareRestored ? "bg-[#1d3540] text-[#79cf9c]" : "bg-[#1a0a0b] text-[#e5626a]"}`}>
                  peer0.hospitaldona: {ransomwareActive ? "AISLADO" : ransomwareRestored ? "RESTAURADO" : "OK"}
                </div>
                <div className="px-2 py-1 rounded bg-[#132538] text-[#79cf9c]">
                  orderer.raft: ACTIVO (sin interrupción)
                </div>
                <div className="px-2 py-1 rounded bg-[#132538] text-[#79cf9c]">
                  peer0.incucai: SYNC OK · #14983
                </div>
                <div className="px-2 py-1 rounded bg-[#132538] text-[#79cf9c]">
                  peer0.hospitalrec: SYNC OK
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Alertas ───────────────────────────────────────────────────────── */}
      <AlertsPanel
        role="incucai"
        canAcknowledge
        title="Alertas activas"
        description="Temperatura, seguridad, IoT y red."
      />

      {/* ── Feed de trazabilidad ──────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 hover:bg-[#132538] transition-colors"
          onClick={() => setShowTrace(!showTrace)}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#4fb8c4]" />
            <span className="text-sm font-semibold text-[#f0f5f9]">Feed de trazabilidad</span>
            <span className="text-[10px] font-mono bg-[#132538] text-[#4fb8c4] px-2 py-0.5 rounded-full border border-[#22384d]">
              {events.length} eventos
            </span>
          </div>
          {showTrace
            ? <ChevronDown className="h-4 w-4 text-[#54697c]" />
            : <ChevronRight className="h-4 w-4 text-[#54697c]" />
          }
        </button>
        {showTrace && (
          <div className="p-4 border-t border-[#22384d]">
            <Traceability techMode role="incucai" />
          </div>
        )}
      </div>
    </div>
  )
}
