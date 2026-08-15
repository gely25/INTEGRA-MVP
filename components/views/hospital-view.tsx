"use client"

import { useState } from "react";
import { useStore } from "@/lib/store";
import { CustodyTwin } from "@/components/custody-twin";
import { Traceability } from "@/components/blocks/traceability";
import { AlertsPanel } from "@/components/blocks/alerts-panel";
import { StatusPill } from "@/components/status-pill";
import { EndorsementErrorModal } from "@/components/blocks/endorsement-error-modal";
import { toast } from "sonner";
import {
  Clipboard, CheckCircle2, ShieldX,
  Server, FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function Step({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#22384d]/50 last:border-0">
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
        done   ? "border-[#79cf9c] bg-[#79cf9c] text-[#0a141f]" :
        active ? "border-[#4fb8c4] bg-[#0f1e2c] text-[#4fb8c4]" :
                 "border-[#22384d] bg-[#0f1e2c] text-[#54697c]"
      }`}>
        {done ? "✓" : "·"}
      </div>
      <span className={`text-xs ${done ? "text-[#79cf9c] font-medium" : active ? "text-[#f0f5f9]" : "text-[#54697c]"}`}>
        {label}
      </span>
    </div>
  );
}

export function HospitalView() {
  const {
    caseData, events, simTimeHours, scenario,
    assignmentContract, contractReached, signAssignment,
    ransomwareRestored,
  } = useStore();

  const [checklist, setChecklist] = useState({
    temp: false, coldChain: false, alerts: false, history: false,
  });
  const [fraudModalOpen, setFraudModalOpen] = useState(false);

  const contract = assignmentContract;
  const sigs = contract.sigs;
  const isPendingHosp = contractReached && !sigs.hospital;
  const isIssued = sigs.incucai && sigs.hospital;

  const canReceive = Object.values(checklist).every(Boolean) && simTimeHours >= 28 && caseData.status !== "Recibido";
  const hasReceived = caseData.status === "Recibido" || caseData.status === "Cerrado";

  const steps = [
    { label: "Riñón donado y asignado",      done: simTimeHours >= 0.5 },
    { label: "Acuerdo firmado por ambas partes", done: isIssued },
    { label: "Riñón en camino a su hospital", done: simTimeHours >= 2 },
    { label: "Riñón llegó — verificar condiciones", done: hasReceived },
    { label: "Caso cerrado exitosamente",     done: caseData.status === "Cerrado" },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1 */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Left column: Process state */}
        <div className="md:col-span-5 rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-[#22384d] pb-2">
              <Clipboard className="h-4 w-4 text-[#79cf9c]" />
              <h3 className="text-sm font-semibold text-[#f0f5f9]">Estado del Proceso</h3>
            </div>
            <div className="space-y-1">
              {steps.map((s, i) => (
                <Step key={i} done={s.done} active={!s.done && (i === 0 || steps[i - 1].done)} label={s.label} />
              ))}
            </div>
          </div>

          {/* Signature module */}
          {contractReached && (
            <div className={`mt-4 rounded-lg border p-3 ${isIssued ? "border-[#79cf9c]/30 bg-[#1c3128]" : "border-[#cfa25e]/30 bg-[#332818]"}`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <FileSignature className="h-3.5 w-3.5 text-[#79cf9c]" />
                  <span className="text-xs font-semibold text-[#f0f5f9]">Aceptación del Órgano</span>
                </div>
                {isIssued ? (
                  <p className="text-[10px] text-[#79cf9c] font-semibold">✓ Aprobado por ambas partes</p>
                ) : isPendingHosp ? (
                  <Button className="w-full bg-[#79cf9c] hover:bg-[#79cf9c]/80 text-[#0a141f] font-bold text-[10px] h-7" onClick={async () => { await signAssignment("hospital"); toast.success("Confirmación registrada"); }}>
                    Confirmar Aceptación
                  </Button>
                ) : (
                  <p className="text-[10px] text-[#7d94a8]">Aguardando aprobación de INCUCAI...</p>
                )}
              </div>
            </div>
          )}

          {/* ── Simulación de Fraude ─────────────────────────────────────── */}
          <div className="mt-4 rounded-lg border border-dashed border-[#e5626a]/30 bg-[#1a0a0b]/50 p-3">
            <p className="text-[9px] uppercase tracking-widest text-[#54697c] font-bold mb-2">
              Prueba de Seguridad — Solo Demo
            </p>
            <p className="text-[10px] text-[#7d94a8] mb-3 leading-relaxed">
              Simula un intento de escritura no autorizada sobre la lista de espera para
              demostrar el rechazo de la endorsement policy de Hyperledger Fabric.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-[10px] font-bold border-[#e5626a]/40 text-[#e5626a] bg-transparent hover:bg-[#e5626a]/10 hover:border-[#e5626a]/60 transition-all"
              onClick={() => setFraudModalOpen(true)}
            >
              <ShieldX className="mr-1.5 h-3.5 w-3.5" />
              Simular Modificación No Autorizada
            </Button>
          </div>
        </div>

        {/* Right column: Digital twin */}
        <div className="md:col-span-7 rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
          <div className="flex items-center justify-between border-b border-[#22384d] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#79cf9c]" />
              <h3 className="text-sm font-semibold text-[#f0f5f9]">Gemelo Digital de Custodia</h3>
            </div>
            <span className="text-[10px] font-mono text-[#7d94a8]">ID: #{caseData.caseId}</span>
          </div>
          <CustodyTwin plainMode />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alerts */}
        <AlertsPanel role="hospital" plainMode title="Avisos del Traslado" description="Estado técnico y alertas de la red de custodia." />
        {/* Checklist */}
        <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-[#22384d] pb-2">
              <CheckCircle2 className="h-4 w-4 text-[#79cf9c]" />
              <h3 className="text-sm font-semibold text-[#f0f5f9]">Checklist de Recepción</h3>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[{ key: "temp", label: "Temp. en rango (2-8°C)", detail: `${caseData.tempInternal.toFixed(1)}°C` },
                { key: "coldChain", label: "Cadena de frío íntegra", detail: `Precinto: ${caseData.sealStatus}` },
                { key: "alerts", label: "Avisos revisados", detail: "Sin alertas críticas" },
                { key: "history", label: "Historial verificado", detail: "Eventos cargados" },
              ].map(item => (
                <div key={item.key} className="flex items-start gap-2">
                  <Checkbox id={`chk-${item.key}`} checked={checklist[item.key as keyof typeof checklist]} onCheckedChange={c => setChecklist(p => ({ ...p, [item.key]: !!c }))} className="mt-0.5" disabled={hasReceived} />
                  <div>
                    <Label htmlFor={`chk-${item.key}`} className="text-xs text-[#f0f5f9] cursor-pointer">{item.label}</Label>
                    <p className="text-[10px] text-[#7d94a8]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button className={`w-full h-9 font-bold text-xs mt-4 transition-all ${hasReceived ? "bg-[#1c3128] text-[#79cf9c] border border-[#79cf9c]/30 cursor-default" : canReceive ? "bg-[#79cf9c] hover:bg-[#79cf9c]/80 text-[#0a141f]" : "bg-[#132538] text-[#54697c] cursor-not-allowed"}`} disabled={!canReceive && !hasReceived} onClick={() => { if (canReceive && !hasReceived) { toast.success("Custodia física recibida y confirmada en el Hospital Receptor"); } }}>
            {hasReceived ? "Recepción Confirmada" : "Confirmar Recepción del Riñón"}
          </Button>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Transplant result */}
        <div className="md:col-span-2 rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
          <div className="flex items-center gap-2 mb-3 border-b border-[#22384d] pb-2">
            <Clipboard className="h-4 w-4 text-[#79cf9c]" />
            <h3 className="text-sm font-semibold text-[#f0f5f9]">Resultado del Trasplante</h3>
          </div>
          {hasReceived ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#54697c] font-bold mb-1">Resultado de Cirugía</label>
                  <select className="w-full bg-[#132538] border border-[#22384d] rounded p-2 text-xs text-[#f0f5f9]">
                    <option value="exitoso">Trasplante Exitoso (Órgano Funcional)</option>
                    <option value="complicaciones">Complicaciones Leves (Monitoreo)</option>
                    <option value="fallido">Falla de Injerto Primario</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#54697c] font-bold mb-1">Notas Post-Operatorias</label>
                  <textarea placeholder="Perfusión renal inmediata..." className="w-full h-8 bg-[#132538] border border-[#22384d] rounded p-1 text-xs text-[#f0f5f9]" />
                </div>
              </div>
              <Button className="bg-[#79cf9c] hover:bg-[#79cf9c]/80 text-[#0a141f] font-bold text-[10px] h-7" onClick={() => toast.success("Resultado guardado inmutablemente")}>Guardar Reporte Médico</Button>
            </div>
          ) : (
            <p className="text-xs text-[#54697c] py-4 text-center">Disponible tras confirmar la recepción del órgano.</p>
          )}
        </div>

        {/* Event history */}
        <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4 flex flex-col h-[180px]">
          <div className="flex items-center justify-between border-b border-[#22384d] pb-2 mb-2">
            <span className="text-xs font-semibold text-[#f0f5f9]">Historial de Eventos</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            <Traceability techMode={false} role="hospital" />
          </div>
        </div>
      </div>

      {/* ── Endorsement Policy Error Modal ──────────────────────────────── */}
      <EndorsementErrorModal
        open={fraudModalOpen}
        onClose={() => setFraudModalOpen(false)}
        txId="tx_REJECTED_fraud_sim"
      />
    </div>
  );
}
