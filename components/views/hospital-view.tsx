"use client"

import { useState } from "react";
import { useStore } from "@/lib/store";
import { CustodyTwin } from "@/components/custody-twin";
import { Traceability } from "@/components/blocks/traceability";
import { StatusPill } from "@/components/status-pill";
import { EndorsementErrorModal } from "@/components/blocks/endorsement-error-modal";
import { EVENT_LABEL } from "@/lib/case-data";
import { toast } from "sonner";
import {
  Clipboard, CheckCircle2, ShieldX,
  Server, FileSignature, X, Clock, Bell, Milestone, Route
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function HospitalView() {
  const {
    caseData, events, simTimeHours, scenario, alerts,
    assignmentContract, contractReached, signAssignment, confirmReception,
  } = useStore();

  const [checklist, setChecklist] = useState({
    temp: false, coldChain: false, alerts: false, history: false,
  });
  const [fraudModalOpen, setFraudModalOpen] = useState(false);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [demoExpanded, setDemoExpanded] = useState(false);

  const contract = assignmentContract;
  const sigs = contract.sigs;
  const isPendingHosp = contractReached && !sigs.hospital;
  const isIssued = sigs.incucai && sigs.hospital;

  const isFailed = caseData.status === "Fallido — isquemia excedida";
  const isPendingVerification = caseData.status === "Llegó — verificación pendiente";
  const canReceive = Object.values(checklist).every(Boolean) && isPendingVerification;
  const hasReceived = caseData.status === "Recibido" || caseData.status === "Cerrado";

  // Mockup shows exactly 4 steps:
  // 1. Asignado
  // 2. Firmado
  // 3. En camino
  // 4. Recibido
  const steps = [
    { label: "Asignado", done: simTimeHours >= 0.5, failed: false, active: false },
    { label: "Firmado", done: isIssued, failed: false, active: false },
    { label: "En camino", done: simTimeHours >= 2, failed: false, active: false },
    { label: "Recibido", done: hasReceived, failed: isFailed, active: isPendingVerification },
  ];

  // Dynamic status text under the stepper
  const getStepperStatusText = () => {
    if (caseData.status === "Cerrado") {
      return "Trasplante finalizado y registrado inmutablemente";
    }
    if (caseData.status === "Fallido — isquemia excedida") {
      return "Caso fallido — ventana de isquemia excedida, órgano no viable";
    }
    if (caseData.status === "Recibido") {
      return "Riñón recibido y custodia física confirmada";
    }
    if (caseData.status === "Llegó — verificación pendiente") {
      return "El riñón llegó al hospital — verificación de recepción pendiente";
    }
    if (simTimeHours >= 2) {
      return "Riñón en camino — llega en ~2h · acuerdo firmado por ambas partes";
    }
    if (isIssued) {
      return "Acuerdo firmado por ambas partes · preparando contenedor y logística";
    }
    return "Contrato de asignación emitido · firma del hospital pendiente";
  };

  // Derive 3 most recent events visible to hospital
  const hospitalEvents = events.filter((e) => {
    if (!e.visibleTo) return true;
    return e.visibleTo.includes("hospital");
  });
  const recentEvents = [...hospitalEvents].slice(-3).reverse();
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-4">

      {/* ── 1. Camino del órgano Stepper ────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Route className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">Camino del órgano</h3>
        </div>
        <div className="flex items-center justify-between w-full gap-4 px-2 py-2">
          {steps.map((s, i) => {
            const done = s.done;
            const failed = s.failed;
            const active = s.active || (!s.done && !s.failed && (i === 0 || steps[i - 1].done));
            
            let bgClass = "border-border bg-secondary text-muted-foreground/60";
            if (done) {
              bgClass = "border-ok bg-ok text-ok-foreground shadow-md shadow-ok/10";
            } else if (failed) {
              bgClass = "border-danger bg-danger text-danger-foreground shadow-md shadow-danger/10";
            } else if (active) {
              bgClass = "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10";
            }

            return (
              <div key={i} className="flex-1 flex items-center last:flex-none">
                <div className="flex items-center gap-2 sm:flex-col sm:gap-1.5 relative w-full sm:w-auto">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${bgClass}`}>
                    {done ? "✓" : failed ? "✗" : i + 1}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-3 rounded transition-all duration-300 ${
                    steps[i + 1].done ? "bg-ok" : steps[i + 1].failed ? "bg-danger" : steps[i].done ? "bg-primary/50" : "bg-border"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-primary/90 mt-2 font-medium px-2">
          {getStepperStatusText()}
        </p>
      </div>

      {/* ── Banners de estado de recepción ── */}
      {caseData.status === "Llegó — verificación pendiente" && (
        <div style={{ backgroundColor: "#1a1c0f", borderLeft: "3px solid #cfa25e" }} className="rounded-r-lg p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span style={{ backgroundColor: "#cfa25e", color: "#1a1c0f" }} className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider shrink-0">
              ACCIÓN REQUERIDA
            </span>
            <span className="text-xs font-semibold text-card-foreground">
              El riñón llegó al hospital — verificación pendiente
            </span>
          </div>
          <span className="text-xs font-mono text-[#cfa25e] shrink-0 font-bold">
            Tiempo restante: {Math.max(0, caseData.ischemiaWindowHours - simTimeHours).toFixed(1)}h
          </span>
        </div>
      )}

      {caseData.status === "Fallido — isquemia excedida" && (
        <div style={{ backgroundColor: "#1e0f10", borderLeft: "3px solid #e5626a" }} className="rounded-r-lg p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span style={{ backgroundColor: "#e5626a", color: "#1e0f10" }} className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider shrink-0">
              CASO FALLIDO
            </span>
            <span className="text-xs font-semibold text-[#e5626a]">
              Isquemia excedida — órgano no viable
            </span>
          </div>
        </div>
      )}

      {/* ── 2. Gemelo Digital de Custodia (Flanked layout) ──────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Gemelo Digital de Custodia</h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">ID: #{caseData.caseId}</span>
        </div>
        <CustodyTwin plainMode compact />
      </div>

      {/* ── 3. Avisos relevantes banner ─────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-card-foreground">Avisos relevantes</span>
        </div>
        {activeAlerts.length === 0 ? (
          <span className="text-xs text-muted-foreground/60">Sin alertas activas para este caso</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-danger-foreground">
              {activeAlerts.length}
            </span>
            <span className="text-xs text-danger font-semibold">{activeAlerts[0].title}</span>
          </div>
        )}
      </div>

      {/* ── 4. Checklist & Últimos eventos grid ─────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Checklist de Recepción */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
              <Clipboard className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">Checklist de recepción</h3>
            </div>
            <div className="grid gap-3 grid-cols-2 pb-4">
              {[
                { key: "temp", label: "Temp. en rango (2-8°C)" },
                { key: "coldChain", label: "Cadena de frío íntegra" },
                { key: "alerts", label: "Avisos revisados" },
                { key: "history", label: "Historial verificado" },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <Checkbox id={`chk-${item.key}`} checked={checklist[item.key as keyof typeof checklist]} onCheckedChange={c => setChecklist(p => ({ ...p, [item.key]: !!c }))} disabled={hasReceived || isFailed} />
                  <Label htmlFor={`chk-${item.key}`} className="text-xs text-card-foreground cursor-pointer font-medium leading-none">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <Button 
            className={`w-full h-10 font-bold text-xs transition-all ${
              hasReceived 
                ? "bg-ok/10 text-ok border border-ok/30 cursor-default" 
                : isFailed
                  ? "bg-secondary text-muted-foreground/40 border border-border cursor-not-allowed"
                  : canReceive 
                    ? "bg-ok hover:bg-ok/80 text-ok-foreground" 
                    : "bg-secondary text-muted-foreground/60 cursor-not-allowed"
            }`} 
            disabled={isFailed || (!canReceive && !hasReceived)} 
            onClick={() => { 
              if (canReceive && !hasReceived && !isFailed) { 
                confirmReception();
                toast.success("Custodia física recibida y confirmada en el Hospital Receptor"); 
              } 
            }}
          >
            {hasReceived ? "Recepción Confirmada" : isFailed ? "Recepción Bloqueada — Caso Fallido" : "Confirmar recepción del riñón"}
          </Button>
        </div>

        {/* Últimos Eventos */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">Últimos eventos</h3>
            </div>
            <div className="space-y-2.5">
              {recentEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 italic text-center py-4">Sin eventos registrados aún.</p>
              ) : (
                recentEvents.map((e) => {
                  const isWarning = e.event.includes("WARN") || e.status === "BROKEN";
                  const isCritical = e.event.includes("CRIT");
                  const colorClass = isCritical ? "text-danger" : isWarning ? "text-warn" : "text-card-foreground";
                  const label = e.plainText || EVENT_LABEL[e.event as keyof typeof EVENT_LABEL] || e.event;
                  return (
                    <div key={e.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0">
                      <span className={`font-semibold truncate ${colorClass}`}>{label}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">T+{e.time.match(/T\+(\d+h\d+m)/)?.[1] || e.time.replace(/T\+|m/g, "").replace("h", "h ")}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button
            onClick={() => setTraceabilityOpen(true)}
            className="text-left text-xs font-semibold text-primary hover:underline flex items-center gap-1 pt-3 border-t border-border/40 mt-3"
          >
            Ver trazabilidad completa →
          </button>
        </div>
      </div>

      {/* Acceptance Agreement Box (Only show when agreement is not fully signed yet) */}
      {contractReached && !isIssued && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FileSignature className="h-4 w-4 text-warn" />
            <div>
              <p className="text-xs font-bold text-card-foreground">Firma de aceptación pendiente</p>
              <p className="text-[10px] text-muted-foreground">Firme el acuerdo para autorizar el traslado y la recepción del riñón.</p>
            </div>
          </div>
          <Button className="bg-ok hover:bg-ok/80 text-ok-foreground font-bold text-xs h-8 px-4" onClick={async () => { await signAssignment("hospital"); toast.success("Confirmación registrada"); }}>
            Firmar Aceptación
          </Button>
        </div>
      )}

      {/* Report module (Only show after kidney is received) */}
      {hasReceived && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
            <Clipboard className="h-4 w-4 text-ok" />
            <h3 className="text-sm font-semibold text-card-foreground">Resultado del Trasplante (Reporte Médico)</h3>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Resultado de Cirugía</label>
                <select className="w-full bg-secondary border border-border rounded p-2 text-xs text-card-foreground focus:outline-none focus:border-primary">
                  <option value="exitoso">Trasplante Exitoso (Órgano Funcional)</option>
                  <option value="complicaciones">Complicaciones Leves (Monitoreo)</option>
                  <option value="fallido">Falla de Injerto Primario</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Notas Post-Operatorias</label>
                <textarea placeholder="Perfusión renal inmediata..." className="w-full h-8 bg-secondary border border-border rounded p-1 text-xs text-card-foreground focus:outline-none focus:border-primary" />
              </div>
            </div>
            <Button className="bg-ok hover:bg-ok/80 text-ok-foreground font-bold text-[10px] h-7" onClick={() => toast.success("Resultado guardado inmutablemente")}>Guardar Reporte Médico</Button>
          </div>
        </div>
      )}

      {/* ── 5. Collapsed Demo Security Tools ────────────────────────────── */}
      <div className="border border-dashed border-border bg-card/40 rounded-lg p-3 opacity-60 hover:opacity-100 transition-opacity mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldX className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Modo demostración — pruebas de seguridad</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-3 text-[10px] border-border text-muted-foreground hover:text-card-foreground hover:bg-secondary"
            onClick={() => setDemoExpanded(!demoExpanded)}
          >
            {demoExpanded ? "Colapsar" : "Expandir"}
          </Button>
        </div>
        {demoExpanded && (
          <div className="mt-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
              Simula un intento de escritura no autorizada sobre la lista de espera para
              demostrar el rechazo de la endorsement policy de Hyperledger Fabric.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-[10px] font-bold border-danger/40 text-danger bg-transparent hover:bg-danger/10 hover:border-danger/60 transition-all"
              onClick={() => setFraudModalOpen(true)}
            >
              <ShieldX className="mr-1.5 h-3.5 w-3.5" />
              Simular Modificación No Autorizada
            </Button>
          </div>
        )}
      </div>

      {/* ── Full Traceability Dialog Overlay (Modal) ───────────────────── */}
      {traceabilityOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setTraceabilityOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Clipboard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-card-foreground">Auditoría de Trazabilidad Completa</h3>
                  <p className="text-[10px] text-muted-foreground/60">Libro mayor criptográfico del caso · Rol Hospital</p>
                </div>
              </div>
              <button
                onClick={() => setTraceabilityOpen(false)}
                className="p-1 rounded-lg text-muted-foreground/60 hover:bg-border hover:text-card-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1">
              <Traceability techMode={false} role="hospital" />
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end px-5 py-3 border-t border-border bg-secondary/50">
              <Button
                onClick={() => setTraceabilityOpen(false)}
                className="h-8 text-[11px] font-bold"
              >
                Cerrar Auditoría
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Endorsement Policy Error Modal */}
      <EndorsementErrorModal
        open={fraudModalOpen}
        onClose={() => setFraudModalOpen(false)}
        txId="tx_REJECTED_fraud_sim"
      />
    </div>
  );
}
