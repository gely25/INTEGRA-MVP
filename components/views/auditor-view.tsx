"use client"

import { useStore } from "@/lib/store"
import { Traceability } from "@/components/blocks/traceability"
import { AiAnomalyCard } from "@/components/blocks/ai-anomaly-card"
import { ForensicPanel } from "@/components/blocks/forensic-panel"
import { StatusPill } from "@/components/status-pill"
import {
  FileSearch, Hash, Server, CheckCircle2, AlertCircle,
  ShieldCheck, AlertTriangle, Lock, ArrowRight,
} from "lucide-react"

// Simulated audit cert expiry date
const CERT_EXPIRY = "2025-02-14T23:59:59Z"

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
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
  const finalStatus   = brokenEvents.length === 0 ? "VALID" : "COMPROMISED"
  const isClosed      = caseData.status === "Cerrado" || caseData.status === "Recibido" || caseData.status === "Fallido — isquemia excedida"
  const isInTransit   = caseData.status === "En traslado"

  const insiderAlert    = alerts.find((a) => a.code === "WAITING_LIST_TAMPER_ATTEMPT")
  const ransomwareAlert = alerts.find((a) => a.code === "RANSOMWARE_NODE_ISOLATED")

  // Key cryptographic events for the transit view
  const transportEvt     = events.find((e) => e.event === "TRANSPORT_STARTED")
  const deviceLinkedEvt  = events.find((e) => e.event === "DEVICE_LINKED")
  const assignmentEndEvt = events.find((e) => e.event === "ASSIGNMENT_SIGNED_HOSPITAL")

  return (
    <div className="space-y-5">

      {/* ── Read-Only badge + cert ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-mono bg-secondary border border-border text-muted-foreground/60 px-2.5 py-1.5 rounded-lg">
          <Lock className="h-3 w-3 text-warn" />
          <span>READ-ONLY — Sin capacidad de escritura</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 border border-border bg-secondary px-2.5 py-1.5 rounded-lg">
          <ShieldCheck className="h-3 w-3 text-warn" />
          Certificado audit=true · Expira: {new Date(CERT_EXPIRY).toLocaleDateString("es-AR")}
        </div>
      </div>

      {/* ── Resumen forense ─────────────────────────────────────────── */}
      <div className="rounded-lg border border-primary/30 bg-card p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-card-foreground">
              Auditoría — {caseData.caseId}
            </h2>
          </div>
          <StatusPill tone={
            caseData.status === "Fallido — isquemia excedida" ? "danger" :
            caseData.status === "Llegó — verificación pendiente" ? "warn" :
            isClosed ? "ok" :
            isInTransit ? "info" : "neutral"
          }>
            {caseData.status}
          </StatusPill>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-secondary p-3 rounded-xl border border-border">
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Resultado</span>
            <div className="mt-2 flex items-center gap-1.5">
              {finalStatus === "VALID"
                ? <><CheckCircle2 className="h-4 w-4 text-ok" /><span className="text-base font-bold text-ok">VALID</span></>
                : <><AlertCircle  className="h-4 w-4 text-danger" /><span className="text-base font-bold text-danger">COMPROMISED</span></>
              }
            </div>
          </div>
          <div className="bg-secondary p-3 rounded-xl border border-border">
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Eventos</span>
            <div className="mt-2 text-2xl font-bold font-mono text-card-foreground">{totalEvents}</div>
          </div>
          <div className="bg-secondary p-3 rounded-xl border border-border">
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Alterados</span>
            <div className={`mt-2 text-2xl font-bold font-mono ${brokenEvents.length > 0 ? "text-danger" : "text-ok"}`}>
              {brokenEvents.length}
            </div>
          </div>
          <div className="bg-secondary p-3 rounded-xl border border-border">
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Canal</span>
            <div className="mt-2 text-xs font-mono font-bold text-primary">audit-channel</div>
          </div>
        </div>
      </div>

      {/* ── Módulo de IA ────────────────────────────────────────────── */}
      <AiAnomalyCard readOnly />

      {/* ── Alertas de seguridad ────────────────────────────────────── */}
      {insiderAlert && (
        <div className="rounded-lg border border-danger/50 bg-danger/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">
                Transacción rechazada por endorsement policy
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Intento de modificación unilateral de la lista de espera. Requería 2 firmas de
                organizaciones distintas. La transacción fue rechazada y grabada en el ledger
                con status BROKEN.
              </p>
              <code className="mt-2 block font-mono text-[10px] bg-danger/10 text-danger px-2 py-1 rounded">
                TxId: tx_REJECTED_0x4f2a · Status: BROKEN · Actor: Coord. R. Silva
              </code>
            </div>
          </div>
        </div>
      )}

      {ransomwareAlert && (
        <div className="rounded-lg border border-warn/40 bg-warn/5 p-4">
          <div className="flex items-start gap-3">
            <Server className="h-5 w-5 text-warn shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-warn">Incidente de ransomware registrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                peer0.hospitaldona fue aislado automáticamente. El orderer Raft continuó operando
                con peers redundantes. Restauración completada en 15 min desde backup offline.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="px-2 py-1 rounded bg-danger/10 text-danger">peer0.hospitaldona: AISLADO → RESTAURADO</div>
                <div className="px-2 py-1 rounded bg-secondary text-ok">orderer.raft: SIN INTERRUPCIÓN</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN CONTEXTUAL: EN TRÁNSITO vs CERRADO ────────────────── */}
      {isInTransit && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider block">
              Evento más reciente destacado
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
            <ArrowRight className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Estado Criptográfico en Tránsito</h3>
            <span className="ml-auto text-[9px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">EN TRÁNSITO</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[10px] text-muted-foreground/60 italic">
              Vista restringida: solo el evento de salida y las firmas del nodo emisor.
              El expediente forense completo estará disponible en estado COMPLETADO/CERRADO.
            </p>
            {transportEvt ? (
              <div className="rounded-lg border border-border bg-secondary p-3 font-mono text-[11px] space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Evento de salida — TRANSPORT_STARTED
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground/60">Actor</span>
                  <span className="text-foreground font-medium">{transportEvt.actor}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground/60">Org. emisora</span>
                  <span className="text-foreground font-medium">{transportEvt.org}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground/60">Timestamp</span>
                  <span className="text-foreground font-medium">{transportEvt.time}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground/60">TxId</span>
                  <span className="text-primary truncate">{transportEvt.txId}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground/60">Hash</span>
                  <span className="text-primary truncate">{transportEvt.hash}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground/60">Estado</span>
                  <span className="text-ok font-bold">{transportEvt.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 text-center py-4">Evento de inicio de traslado aún no registrado.</p>
            )}
            {deviceLinkedEvt && (
              <div className="rounded-lg border border-border bg-secondary p-3 font-mono text-[11px] space-y-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2">Certificado del nodo emisor (IoT)</div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center"><span className="text-muted-foreground/60">DeviceId</span><span className="text-[--color-chart-5]">DEVICE-001</span></div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center"><span className="text-muted-foreground/60">CA emisora</span><span className="text-foreground">IoT CA / INTEGRA</span></div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center"><span className="text-muted-foreground/60">TTL</span><span className="text-foreground">72h</span></div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center"><span className="text-muted-foreground/60">TLS</span><span className="text-ok font-bold">MUTUAL OK</span></div>
              </div>
            )}
            {assignmentEndEvt && (
              <div className="rounded-lg border border-border bg-secondary p-3 font-mono text-[11px] space-y-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2">Firmas del contrato de asignación</div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center"><span className="text-muted-foreground/60">INCUCAI</span><span className="text-ok font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Firmado</span></div>
                <div className="grid grid-cols-[160px_1fr] gap-2 items-center"><span className="text-muted-foreground/60">Hospital Receptor</span><span className="text-ok font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Firmado</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {isClosed && <ForensicPanel />}

      {/* ── Grid de 2 columnas: Red Blockchain e Hitos de custodia ────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Red blockchain */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Red Blockchain</h3>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">Hyperledger Fabric · Raft</span>
          </div>
          <DataRow label="Canal"        value={<span className="font-mono text-foreground">custody-channel + audit-channel</span>} />
          <DataRow label="Chaincode"   value={<span className="font-mono text-foreground">CustodyChain v2.1</span>} />
          <DataRow label="Último bloque" value={<span className="font-mono text-foreground">#14983</span>} />
          <DataRow label="Peers activos" value={<StatusPill tone="ok">4/5 online</StatusPill>} />
          <DataRow label="Modo"        value={<StatusPill tone="warn">Demo / Simulado</StatusPill>} />
        </div>

        {/* Hitos de custodia */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Hitos de custodia</h3>
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
              <div key={event} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                {found
                  ? <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground">{found.time}</span>
                      <StatusPill tone="ok">OK</StatusPill>
                    </div>
                  : <StatusPill tone="warn">Pendiente</StatusPill>
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Ledger completo ───────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Ledger criptográfico completo</h3>
            <span className="ml-auto text-[10px] font-mono bg-secondary text-primary px-2 py-0.5 rounded-full border border-border">
              SHA-256 encadenado
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Historial completo del caso
          </p>
        </div>
        <div className="p-4">
          <Traceability techMode role="auditor" />
        </div>
      </div>
    </div>
  )
}
