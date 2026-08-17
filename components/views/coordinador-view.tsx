"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { Traceability } from "@/components/blocks/traceability"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { AiAnomalyCard } from "@/components/blocks/ai-anomaly-card"
import { StatusPill } from "@/components/status-pill"
import { AlertResolutionModal } from "@/components/blocks/alert-resolution-modal"
import { ManualSignModal } from "@/components/blocks/manual-sign-modal"
import { SimClockBar } from "@/components/blocks/sim-clock-bar"
import type { AlertItem } from "@/lib/case-data"
import {
  FileSignature, AlertTriangle,
  FileText, ShieldAlert, Hash,
  Building2, User, Clock, CheckCircle2,
  LogOut, RefreshCw, ShieldCheck, ShieldX, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function CoordinadorView() {
  const {
    caseData, alerts,
    assignmentContract, contractReached,
    signAssignment, scenario,
    simTimeHours, ransomwareActive,
    acknowledgeAlert, addEvent,
    setScreen,
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
  // All unacknowledged (used for custody aggregate status calculation)
  const unacknowledged = alerts.filter((a) => !a.acknowledged)
  // Security-only unacknowledged — INCUCAI only resolves security alerts per RBAC.
  // Custody alerts (TEMP_CRITICAL, etc.) are handled by the transporter (itprov).
  const unacknowledgedSecurity = unacknowledged.filter(
    (a) => !a.alertCategory || a.alertCategory === "security"
  )

  const scenarioLabel =
    scenario === "normal" ? "Flujo normal" :
    scenario === "insider" ? "Insider amenaza" :
    "Ransomware activo"

  /**
   * Aggregated custody status for INCUCAI — computed from alerts only,
   * without exposing raw sensor readings (RBAC: INCUCAI has no access to "Custodia IoT").
   * - "crítico":   any unacknowledged TEMP_CRITICAL alert exists
   * - "en riesgo": any unacknowledged TEMP_WARNING alert exists
   * - "ok":        no unacknowledged custody alerts
   */
  const custodyAggStatus = useMemo(() => {
    const hasCritical = alerts.some((a) => a.code === "TEMP_CRITICAL" && !a.acknowledged)
    const hasWarning  = alerts.some((a) => a.code === "TEMP_WARNING"  && !a.acknowledged)
    if (hasCritical) return "crítico" as const
    if (hasWarning)  return "en riesgo" as const
    return "ok" as const
  }, [alerts])

  const custodyStatusMeta = {
    ok:          { label: "Custodia Normal",   tone: "text-ok",     bg: "bg-ok/10 border-ok/30",         icon: ShieldCheck },
    "en riesgo": { label: "Custodia en Riesgo", tone: "text-warn",   bg: "bg-warn/10 border-warn/30",     icon: AlertTriangle },
    crítico:     { label: "Custodia Crítica",  tone: "text-danger", bg: "bg-danger/10 border-danger/40", icon: ShieldX },
  }

  const priority = useMemo(() => {
    if (scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive) {
      return {
        key: "ransomware", tone: "danger" as const,
        title: "Incidente Crítico — Nodo peer0.hospitaldona Aislado",
        detail: "Aislamiento automatizado por sospecha de ransomware. Consensus Raft en operación normal.",
      }
    }
    if (insiderVisible && insiderAlert && !insiderAlert.acknowledged) {
      return {
        key: "insider", tone: "danger" as const,
        title: "Intento de Modificación de Lista de Espera Bloqueado",
        detail: "Endorsement Policy rechazó TX unilateral sin segunda firma de organización.",
        action: { label: "Auditar y Resolver Alerta", onClick: () => setSelectedAlertToResolve(insiderAlert) },
      }
    }
    if (contractReached && !sigs.incucai) {
      return {
        key: "sign", tone: "warn" as const,
        title: "Firma Pendiente — Contrato de Asignación AR-CONTRACT-001",
        detail: "Requiere endoso institucional de INCUCAI (Org CA) para proceder con el traslado.",
        action: { label: "Forzar Firma Manual (ECDSA-256)", onClick: () => setManualSignModalOpen(true) },
      }
    }
    const critical = unacknowledgedSecurity.find((a) => a.level === "danger")
    if (critical) {
      return {
        key: critical.id, tone: "danger" as const,
        title: critical.title, detail: critical.detail,
        action: { label: "Resolver Alerta", onClick: () => setSelectedAlertToResolve(critical) },
      }
    }
    return null
  }, [scenario, simTimeHours, ransomwareActive, insiderVisible, insiderAlert, contractReached, sigs.incucai, unacknowledged])

  const handleResolveAlert = (
    alertId: string,
    resolution: string,
    notes: string,
  ) => {
    acknowledgeAlert(alertId)
    // Write the corrective action to the traceability ledger.
    // This event is immutable once committed — it appears in the Trazabilidad tab
    // visible to INCUCAI and the external auditor.
    addEvent("ALERT_RESOLVED", {
      actor: "Coordinador INCUCAI",
      org: "INCUCAI — Coordinación Nacional",
      status: "VALID",
      plainText: notes
        ? `${resolution}. Observaciones: ${notes}`
        : resolution,
      visibleTo: ["incucai", "auditor"],
      tHours: simTimeHours,
    })
  }

  // KPI derived values
  const contractStatus = isContractIssued ? "Firmado 2/2" : isAutoSignedIncucai ? "Pendiente 1/2" : "En generación"
  const contractSubtext = isContractIssued ? "Endorsement: INCUCAI + receptor" : "Requiere firma del receptor"
  const channelStatus = ransomwareActive ? "Degradado 3/4" : "Saludable 4/4"
  const channelSubtext = ransomwareActive ? "peer0.hospitaldona aislado" : "custody-channel · Raft OK"
  // Only security alerts count toward INCUCAI's badge/KPI — custody alerts are
  // the transporter's responsibility and must not inflate INCUCAI's alert count.
  const alertCount = unacknowledgedSecurity.length

  return (
    <div className="space-y-0">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="pb-4 border-b border-border space-y-3">
        {/* Row 1: badge + title + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold font-mono px-2.5 py-1 rounded border uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
              INCUCAI
            </span>
            <div>
              <h1 className="text-base font-bold text-card-foreground tracking-tight leading-tight">
                INTEGRA — Panel operativo del traslado renal
              </h1>
              <p className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5">
                Coordinador nacional · {scenarioLabel}
              </p>
            </div>
          </div>

          {/* Right side: sim clock + role/exit buttons — secondary nav = neutral */}
          <div className="flex flex-wrap items-start gap-2 sm:shrink-0">
            <div className="min-w-[220px]">
              <SimClockBar />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setScreen("portal")}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" /> Cambiar rol
              </button>
              <button
                onClick={() => setScreen("portal")}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all flex items-center gap-1.5"
              >
                <LogOut className="h-3 w-3" /> Salir
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Case info bar */}
        <div className="grid gap-0 sm:grid-cols-4 bg-card border border-border rounded-xl overflow-hidden text-xs font-mono">
          <div className="p-3 border-r border-border">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold font-sans block mb-0.5">Caso activo</span>
            <span className="font-bold text-card-foreground text-sm">{caseData.caseId} ({caseData.organ})</span>
          </div>
          <div className="p-3 border-r border-border">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold font-sans block mb-0.5">Donante</span>
            <span className="text-foreground font-bold">{caseData.origin}</span>
          </div>
          <div className="p-3 border-r border-border">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold font-sans block mb-0.5">Receptor</span>
            <span className="text-foreground font-bold">{caseData.destination}</span>
          </div>
          <div className="p-3 flex items-center justify-end gap-2">
            <span className="text-ok font-bold px-2.5 py-1 rounded-lg bg-ok/10 border border-ok/25 text-[10px] tracking-wide">
              Cadena de frío íntegra · {caseData.tempInternal.toFixed(1)}°C
            </span>
          </div>
        </div>

        {/* Row 3: 3 KPI cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Card 1: Contract — state-driven color */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">Estado del contrato</p>
            <p className={`text-2xl font-bold tracking-tight ${isContractIssued ? "text-ok" : "text-warn"}`}>
              {contractStatus}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5">{contractSubtext}</p>
          </div>

          {/* Card 2: Hyperledger — state-driven color */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">Canal Hyperledger</p>
            <p className={`text-2xl font-bold tracking-tight ${ransomwareActive ? "text-danger" : "text-ok"}`}>
              {channelStatus}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5">{channelSubtext}</p>
          </div>

          {/* Card 3: Security — state-driven, danger left accent when alerts active */}
          <div className={`rounded-xl border bg-card p-4 ${alertCount > 0 ? "border-border border-l-[3px] border-l-danger bg-danger/5" : "border-border"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${alertCount > 0 ? "text-danger" : "text-muted-foreground/60"}`}>
              Auditoría de seguridad
            </p>
            <p className={`text-2xl font-bold tracking-tight ${alertCount > 0 ? "text-danger" : "text-ok"}`}>
              {alertCount === 0 ? "Sin alertas" : `${alertCount} alerta${alertCount > 1 ? "s" : ""} activa${alertCount > 1 ? "s" : ""}`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5">Monitoreo RBAC</p>
          </div>
        </div>
      </div>

      {/* ── Priority banner ─────────────────────────────────────────────────── */}
      {priority && (
        <div className={`rounded-xl border p-4 shadow-lg mt-4 transition-all ${
          priority.tone === "danger"
            ? "border-danger/50 bg-danger/5"
            : "border-warn/40 bg-warn/5"
        }`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${priority.tone === "danger" ? "bg-danger/20 text-danger" : "bg-warn/20 text-warn"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Atención Requerida por Coordinación</p>
                <p className={`text-sm font-bold ${priority.tone === "danger" ? "text-danger" : "text-card-foreground"}`}>{priority.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{priority.detail}</p>
              </div>
            </div>
            {"action" in priority && priority.action && (
              <Button
                size="sm"
                onClick={priority.action.onClick}
                className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold text-xs shrink-0"
              >
                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                {priority.action.label}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="border-b border-border flex items-center gap-1 pt-4">
        {[
          { id: "expediente", label: "Expediente digital", icon: FileText },
          { id: "seguridad",  label: "Seguridad e IA",    icon: ShieldAlert, badge: unacknowledgedSecurity.length },
          { id: "trazabilidad", label: "Trazabilidad",    icon: Hash },
        ].map((t) => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                active
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {"badge" in t && t.badge !== undefined && t.badge > 0 && (
                <span className="ml-0.5 rounded-full bg-danger text-danger-foreground px-1.5 py-px text-[9px] font-bold leading-none">
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab: Expediente ─────────────────────────────────────────────────── */}
      {activeTab === "expediente" && (
        <div className="space-y-4 animate-in fade-in duration-200 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Expediente institucional */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-card-foreground">Expediente Institucional</h3>
                </div>
                <StatusPill tone="ok">Verificado SINTRA</StatusPill>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Identificador de Caso", value: caseData.caseId, mono: true },
                  { label: "Órgano Donado", value: caseData.organ },
                  { label: "Hospital de Origen (Donante)", value: caseData.origin, icon: <Building2 className="h-3 w-3 text-primary" /> },
                  { label: "Hospital de Destino (Receptor)", value: caseData.destination, icon: <Building2 className="h-3 w-3 text-ok" /> },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground/60">{row.label}</span>
                    <span className={`text-foreground flex items-center gap-1 ${row.mono ? "font-mono font-bold" : "font-bold"}`}>
                      {row.icon}{row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Contract */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-card-foreground">Smart Contract de Asignación</h3>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60">AR-CONTRACT-001</span>
                </div>
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Endorsement Policy: Se requiere la firma criptográfica del Coordinador INCUCAI (Org CA) y de la Autoridad Médica del Hospital Receptor.
                  </p>
                  <div className="space-y-2 pt-1">
                    {/* INCUCAI sig row */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted">
                      <div className="flex items-center gap-2.5">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs font-bold text-card-foreground">INCUCAI (Coordinador Nacional)</p>
                          <p className="text-[9px] text-muted-foreground/60 font-mono">Certificado Root CA X.509</p>
                        </div>
                      </div>
                      {sigs.incucai ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-ok/15 text-ok border border-ok/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Firmado (INCUCAI Org CA)
                          </span>
                          <p className="text-[9px] font-mono text-primary mt-0.5">tx_419914_0x8f2a</p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded font-mono bg-warn/15 text-warn border border-warn/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pendiente de Autorización
                        </span>
                      )}
                    </div>
                    {/* Hospital sig row */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 text-ok" />
                        <div>
                          <p className="text-xs font-bold text-card-foreground">Hospital Receptor (Córdoba)</p>
                          <p className="text-[9px] text-muted-foreground/60 font-mono">Certificado Org CA</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded font-mono ${
                        sigs.hospital
                          ? "bg-ok/15 text-ok border border-ok/30"
                          : "bg-muted text-muted-foreground/60 border border-border"
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
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold text-xs h-10 mt-3 rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <FileSignature className="h-4 w-4" />
                  Emitir Autorización Criptográfica
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Seguridad ──────────────────────────────────────────────────── */}
      {activeTab === "seguridad" && (
        <div className="space-y-4 animate-in fade-in duration-200 pt-4">

          {/* ── Aggregated custody status (RBAC: no raw sensor data for INCUCAI) ─ */}
          {(() => {
            const meta = custodyStatusMeta[custodyAggStatus]
            const Icon = meta.icon
            return (
              <div className={`rounded-xl border p-4 ${meta.bg}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.tone}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-bold ${meta.tone}`}>
                        Estado Agregado de Custodia — {meta.label}
                      </p>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${meta.bg} ${meta.tone}`}>
                        {custodyAggStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Estado computado a partir de las alertas operativas de custodia.
                      {custodyAggStatus === "ok"
                        ? " No hay alertas de temperatura o GPS sin resolver."
                        : custodyAggStatus === "en riesgo"
                          ? " Existe al menos una alerta de temperatura sin resolver en el traslado activo."
                          : " Alerta crítica de temperatura o isquemia detectada. Evalúe emitir escalamiento nacional (CRITICAL_ESCALATION)."
                      }
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Info className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <p className="text-[10px] text-muted-foreground/60 italic">
                        Lecturas de temperatura y GPS en crudo: ver panel del transportador (rol Proveedor IT).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          <AiAnomalyCard />
          <AlertsPanel
            role="incucai"
            canAcknowledge
            onActionClick={(alert) => setSelectedAlertToResolve(alert)}
            title="Panel de Resolución de Alertas de Seguridad"
            description="Alertas de acceso no autorizado, discrepancias estadísticas e incidentes de red. Las alertas operativas de temperatura y GPS son gestionadas por el transportador."
          />
        </div>
      )}

      {/* ── Tab: Trazabilidad ───────────────────────────────────────────────── */}
      {activeTab === "trazabilidad" && (
        <div className="space-y-4 animate-in fade-in duration-200 pt-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-card-foreground">Ledger Criptográfico Inmutable (Hyperledger Fabric)</h3>
              </div>
              <span className="text-[10px] font-mono bg-muted text-primary px-2.5 py-1 rounded border border-border">
                SHA-256 Hash Chain
              </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto pr-2">
              <Traceability techMode role="incucai" />
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AlertResolutionModal
        alert={selectedAlertToResolve}
        open={!!selectedAlertToResolve}
        onClose={() => setSelectedAlertToResolve(null)}
        onResolve={handleResolveAlert}
      />
      <ManualSignModal
        open={manualSignModalOpen}
        onClose={() => setManualSignModalOpen(false)}
        onSign={async () => { await signAssignment("incucai") }}
        contractId={contract.id}
      />
    </div>
  )
}