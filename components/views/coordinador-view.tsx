"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { Traceability } from "@/components/blocks/traceability"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { AiAnomalyCard } from "@/components/blocks/ai-anomaly-card"
import { StatusPill } from "@/components/status-pill"
import { AlertResolutionModal } from "@/components/blocks/alert-resolution-modal"
import { ManualSignModal } from "@/components/blocks/manual-sign-modal"
import type { AlertItem } from "@/lib/case-data"
import {
  FileSignature, AlertTriangle,
  FileText, ShieldAlert, Hash,
  KeyRound, Building2, User, Clock, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"

function ExecutiveMetric({
  label,
  value,
  subtext,
  tone = "neutral",
}: {
  label: string
  value: React.ReactNode
  subtext?: string
  tone?: "ok" | "warn" | "danger" | "neutral"
}) {
  const toneColor = {
    ok: "text-[#79cf9c]",
    warn: "text-[#cfa25e]",
    danger: "text-[#e5626a]",
    neutral: "text-[#f0f5f9]",
  }[tone]

  return (
    <div className="rounded-xl border border-[#22384d] bg-[#0f1e2c] p-4 flex flex-col justify-between shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#54697c] mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono tracking-tight ${toneColor}`}>{value}</p>
      {subtext && <p className="text-[10px] text-[#7d94a8] mt-1.5 font-sans truncate">{subtext}</p>}
    </div>
  )
}

interface PriorityItem {
  key: string
  tone: "warn" | "danger"
  title: string
  detail: string
  action?: { label: string; onClick: () => void }
}

export function CoordinadorView() {
  const {
    caseData, events, alerts,
    assignmentContract, contractReached,
    signAssignment, scenario,
    simTimeHours, ransomwareActive,
    acknowledgeAlert
  } = useStore()

  const [activeTab, setActiveTab] = useState<"expediente" | "seguridad" | "trazabilidad">("expediente")
  const [selectedAlertToResolve, setSelectedAlertToResolve] = useState<AlertItem | null>(null)
  const [manualSignModalOpen, setManualSignModalOpen] = useState(false)

  const contract = assignmentContract
  const sigs = contract.sigs

  const isAutoSignedIncucai = simTimeHours >= 1.0 || sigs.incucai
  const isAutoSignedHospital = simTimeHours >= 1.25 || sigs.hospital
  const isContractIssued = isAutoSignedIncucai && isAutoSignedHospital

  const insiderVisible = (scenario === "insider" || scenario === "ransomware") && simTimeHours >= 10
  const insiderAlert = alerts.find((a) => a.code === "WAITING_LIST_TAMPER_ATTEMPT")
  const unacknowledged = alerts.filter((a) => !a.acknowledged)

  const priority: PriorityItem | null = useMemo(() => {
    if (scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive) {
      return {
        key: "ransomware",
        tone: "danger",
        title: "Incidente Crítico — Nodo peer0.hospitaldona Aislado",
        detail: "Aislamiento automatizado por sospecha de ransomware. Consensus Raft en operación normal.",
      }
    }
    if (insiderVisible && insiderAlert && !insiderAlert.acknowledged) {
      return {
        key: "insider",
        tone: "danger",
        title: "Intento de Modificación de Lista de Espera Bloqueado",
        detail: "Endorsement Policy rechazó TX unilateral sin segunda firma de organización.",
        action: {
          label: "Auditar y Resolver Alerta",
          onClick: () => setSelectedAlertToResolve(insiderAlert),
        },
      }
    }
    if (contractReached && !sigs.incucai) {
      return {
        key: "sign",
        tone: "warn",
        title: "Firma Pendiente — Contrato de Asignación AR-CONTRACT-001",
        detail: "Requiere endoso institucional de INCUCAI (Org CA) para proceder con el traslado.",
        action: {
          label: "Forzar Firma Manual (ECDSA-256)",
          onClick: () => setManualSignModalOpen(true),
        },
      }
    }
    const critical = unacknowledged.find((a) => a.level === "danger")
    if (critical) {
      return {
        key: critical.id,
        tone: "danger",
        title: critical.title,
        detail: critical.detail,
        action: {
          label: "Resolver Alerta",
          onClick: () => setSelectedAlertToResolve(critical),
        },
      }
    }
    return null
  }, [
    scenario, simTimeHours, ransomwareActive,
    insiderVisible, insiderAlert, contractReached, sigs.incucai,
    unacknowledged
  ])

  const handleResolveAlert = (alertId: string, resolution: string, notes: string) => {
    acknowledgeAlert(alertId)
  }

  return (
    <div className="space-y-4">
      {priority && (
        <div className={`rounded-xl border p-4 shadow-lg transition-all ${
          priority.tone === "danger"
            ? "border-[#e5626a]/50 bg-[#2a1214]"
            : "border-[#cfa25e]/40 bg-[#332818]"
        }`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${priority.tone === "danger" ? "bg-[#e5626a]/20 text-[#e5626a]" : "bg-[#cfa25e]/20 text-[#cfa25e]"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#7d94a8] font-bold">Atención Requerida por Coordinación</p>
                <p className={`text-sm font-bold ${priority.tone === "danger" ? "text-[#e5626a]" : "text-[#f0f5f9]"}`}>{priority.title}</p>
                <p className="text-xs text-[#7d94a8] mt-0.5">{priority.detail}</p>
              </div>
            </div>
            {priority.action && (
              <Button
                size="sm"
                onClick={priority.action.onClick}
                className="bg-[#4fb8c4] hover:bg-[#4fb8c4]/80 text-[#0a141f] font-bold text-xs shrink-0"
              >
                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                {priority.action.label}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── 3 Cards Limpias de Nivel Institucional (KPIs Consolidados) ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ExecutiveMetric
          label="1. Estado Legal del Contrato"
          value={isContractIssued ? "ISSUED (2/2)" : isAutoSignedIncucai ? "PENDIENTE (1/2)" : "EN GENERACIÓN"}
          subtext="Endorsement Policy: INCUCAI (Org CA) + Receptor"
          tone={isContractIssued ? "ok" : "warn"}
        />
        <ExecutiveMetric
          label="2. Estado del Canal Hyperledger"
          value={ransomwareActive ? "NODO AISLADO (3/4)" : "SALUDABLE (4/4)"}
          subtext="Canal: custody-channel · Raft Consensus OK"
          tone={ransomwareActive ? "danger" : "ok"}
        />
        <ExecutiveMetric
          label="3. Auditoría de Seguridad e IA"
          value={unacknowledged.length === 0 ? "0 Anomalías" : `${unacknowledged.length} Alerta(s)`}
          subtext="Monitoreo RBAC · Accesos y firmas verificadas"
          tone={unacknowledged.length === 0 ? "ok" : "danger"}
        />
      </div>

      <div className="border-b border-[#22384d] flex items-center gap-2 pt-2">
        {[
          { id: "expediente", label: "Expediente Digital & Smart Contract", icon: FileText },
          { id: "seguridad", label: "Seguridad & IA (Auditoría de Accesos)", icon: ShieldAlert, badge: unacknowledged.length },
          { id: "trazabilidad", label: "Trazabilidad Criptográfica / Ledger", icon: Hash },
        ].map((t) => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                active
                  ? "border-[#4fb8c4] text-[#4fb8c4] bg-[#4fb8c4]/5"
                  : "border-transparent text-[#7d94a8] hover:text-[#dbe6ef] hover:bg-[#132538]/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="ml-1 rounded-full bg-[#e5626a] text-white px-1.5 py-0.2 text-[9px] font-bold">
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === "expediente" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#22384d] bg-[#0f1e2c] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#22384d] pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#4fb8c4]" />
                  <h3 className="text-sm font-bold text-[#f0f5f9]">Expediente Institucional</h3>
                </div>
                <StatusPill tone="ok">Verificado SINTRA</StatusPill>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#22384d]/50">
                  <span className="text-[#54697c]">Identificador de Caso</span>
                  <span className="font-mono font-bold text-[#dbe6ef]">{caseData.caseId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#22384d]/50">
                  <span className="text-[#54697c]">Órgano Donado</span>
                  <span className="font-bold text-[#dbe6ef]">{caseData.organ}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#22384d]/50">
                  <span className="text-[#54697c]">Hospital de Origen (Donante)</span>
                  <span className="text-[#dbe6ef] flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-[#4fb8c4]" /> {caseData.origin}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#22384d]/50">
                  <span className="text-[#54697c]">Hospital de Destino (Receptor)</span>
                  <span className="text-[#dbe6ef] flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-[#79cf9c]" /> {caseData.destination}
                  </span>
                </div>
              </div>
            </div>
            {/* Smart Contract Assignment Status */}
            <div className="rounded-xl border border-[#22384d] bg-[#0f1e2c] p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#22384d] pb-2">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-[#4fb8c4]" />
                    <h3 className="text-sm font-bold text-[#f0f5f9]">Smart Contract de Asignación</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#54697c]">AR-CONTRACT-001</span>
                </div>

                <div className="mt-3 space-y-3">
                  <p className="text-xs text-[#7d94a8] leading-relaxed">
                    Endorsement Policy: Se requiere la firma criptográfica del Coordinador INCUCAI (Org CA) y de la Autoridad Médica del Hospital Receptor.
                  </p>

                  <div className="space-y-2 pt-1">
                    {/* INCUCAI Signature Row */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[#22384d] bg-[#132538]">
                      <div className="flex items-center gap-2.5">
                        <User className="h-4 w-4 text-[#4fb8c4]" />
                        <div>
                          <p className="text-xs font-bold text-[#f0f5f9]">INCUCAI (Coordinador Nacional)</p>
                          <p className="text-[9px] text-[#54697c] font-mono">Certificado Root CA X.509</p>
                        </div>
                      </div>
                      {sigs.incucai ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-[#79cf9c]/15 text-[#79cf9c] border border-[#79cf9c]/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Firmado (INCUCAI Org CA)
                          </span>
                          <p className="text-[9px] font-mono text-[#4fb8c4] mt-0.5">tx_419914_0x8f2a</p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded font-mono bg-[#cfa25e]/15 text-[#cfa25e] border border-[#cfa25e]/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pendiente de Autorización
                        </span>
                      )}
                    </div>

                    {/* Hospital Signature Row */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[#22384d] bg-[#132538]">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 text-[#79cf9c]" />
                        <div>
                          <p className="text-xs font-bold text-[#f0f5f9]">Hospital Receptor (Córdoba)</p>
                          <p className="text-[9px] text-[#54697c] font-mono">Certificado Org CA</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded font-mono ${
                        sigs.hospital
                          ? "bg-[#79cf9c]/15 text-[#79cf9c] border border-[#79cf9c]/30"
                          : "bg-[#132538] text-[#54697c] border border-[#22384d]"
                      }`}>
                        {sigs.hospital ? "✓ Firmado (Org CA)" : "Esperando Firma..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {!sigs.incucai && (
                <Button
                  onClick={() => setManualSignModalOpen(true)}
                  className="w-full bg-[#4fb8c4] hover:bg-[#4fb8c4]/80 text-[#0a141f] font-bold text-xs h-10 mt-3 rounded-xl shadow-md shadow-[#4fb8c4]/20 flex items-center justify-center gap-2"
                >
                  <FileSignature className="h-4 w-4" />
                  Emitir Autorización Criptográfica
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "seguridad" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <AiAnomalyCard />
          <AlertsPanel
            role="incucai"
            canAcknowledge
            onActionClick={(alert) => setSelectedAlertToResolve(alert)}
            title="Panel de Resolución de Alertas de Seguridad"
            description="Alertas de acceso no autorizado, discrepancias estadísticas e incidentes de red."
          />
        </div>
      )}

      {activeTab === "trazabilidad" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl border border-[#22384d] bg-[#0f1e2c] p-4">
            <div className="flex items-center justify-between border-b border-[#22384d] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-[#4fb8c4]" />
                <h3 className="text-sm font-bold text-[#f0f5f9]">Ledger Criptográfico Inmutable (Hyperledger Fabric)</h3>
              </div>
              <span className="text-[10px] font-mono bg-[#132538] text-[#4fb8c4] px-2.5 py-1 rounded border border-[#22384d]">
                SHA-256 Hash Chain
              </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#22384d]">
              <Traceability techMode role="incucai" />
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <AlertResolutionModal
        alert={selectedAlertToResolve}
        open={!!selectedAlertToResolve}
        onClose={() => setSelectedAlertToResolve(null)}
        onResolve={handleResolveAlert}
      />

      <ManualSignModal
        open={manualSignModalOpen}
        onClose={() => setManualSignModalOpen(false)}
        onSign={async () => {
          await signAssignment("incucai")
        }}
        contractId={contract.id}
      />
    </div>
  )
}