"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { IschemiaClock } from "@/components/ischemia-clock"
import { Traceability } from "@/components/blocks/traceability"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { StatusPill } from "@/components/status-pill"
import { toast } from "sonner"
import {
  Clock, Clipboard, CheckCircle2, AlertTriangle,
  ChevronRight, ChevronDown, Thermometer, Server, FileSignature,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Image from "next/image"

function Step({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
        done   ? "border-[#79cf9c] bg-[#79cf9c] text-[#0a141f]" :
        active ? "border-[#4fb8c4] bg-[#0f1e2c] text-[#4fb8c4]" :
                 "border-[#22384d] bg-[#0f1e2c] text-[#54697c]"
      }`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : "·"}
      </div>
      <span className={`text-sm ${done ? "text-[#79cf9c] font-medium" : active ? "text-[#f0f5f9]" : "text-[#54697c]"}`}>
        {label}
      </span>
    </div>
  )
}

export function HospitalView() {
  const {
    caseData, events, simTimeHours, scenario,
    assignmentContract, contractReached, signAssignment,
    ransomwareRestored,
  } = useStore()

  const [showFeed, setShowFeed] = useState(false)
  const [checklist, setChecklist] = useState({
    temp: false, coldChain: false, alerts: false, history: false,
  })

  const contract      = assignmentContract
  const sigs          = contract.sigs
  const isPendingHosp = contractReached && !sigs.hospital
  const isIssued      = sigs.incucai && sigs.hospital

  const canReceive = Object.values(checklist).every(Boolean) && simTimeHours >= 28 && caseData.status !== "Recibido"
  const hasReceived = caseData.status === "Recibido" || caseData.status === "Cerrado"

  // Plain-language steps
  const steps = [
    { label: "Riñón donado y asignado",      done: simTimeHours >= 0.5  },
    { label: "Acuerdo firmado por ambas partes", done: isIssued          },
    { label: "Riñón en camino a su hospital", done: simTimeHours >= 2    },
    { label: "Riñón llegó — verificar condiciones", done: hasReceived    },
    { label: "Caso cerrado exitosamente",     done: caseData.status === "Cerrado" },
  ]
  const activeIdx = steps.findIndex((s) => !s.done)

  return (
    <div className="space-y-5">

      {/* ── Pasos del proceso ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clipboard className="h-4 w-4 text-[#79cf9c]" />
          <h3 className="text-sm font-semibold text-[#f0f5f9]">Estado del proceso</h3>
        </div>
        <div className="space-y-2.5">
          {steps.map((s, i) => (
            <Step key={i} done={s.done} active={i === activeIdx} label={s.label} />
          ))}
        </div>
      </div>

      {/* ── Isquemia ─────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-[#79cf9c]" />
          <h3 className="text-sm font-semibold text-[#f0f5f9]">Tiempo del riñón fuera del cuerpo</h3>
          <span className="text-[10px] text-[#54697c]">(Isquemia fría)</span>
        </div>
        <IschemiaClock compact />
      </div>

      {/* ── Gemelo operativo (riñón) ─────────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <div className="flex gap-4 items-start">
          <div className="relative w-20 h-20 shrink-0">
            <Image
              src="/images/kidney.png"
              alt="Estado del riñón"
              fill
              className="object-contain drop-shadow-xl"
            />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-[#f0f5f9]">
              Riñón — Caso #{caseData.caseId}
            </p>
            <div className="flex items-center gap-2">
              <Thermometer className="h-3.5 w-3.5 text-[#79cf9c]" />
              <span className="text-xs text-[#7d94a8]">Temperatura:</span>
              <span className={`text-xs font-bold font-mono ${
                caseData.tempInternal > 4 ? "text-[#cfa25e]" : "text-[#79cf9c]"
              }`}>
                {caseData.tempInternal.toFixed(1)} °C
              </span>
              {caseData.tempInternal <= 4
                ? <StatusPill tone="ok">Dentro de rango</StatusPill>
                : <StatusPill tone="warn">Temperatura elevada</StatusPill>
              }
            </div>
            <div className="text-xs text-[#7d94a8]">
              {hasReceived
                ? "✓ El riñón llegó a su destino. Condiciones verificadas."
                : simTimeHours >= 2
                  ? "El riñón está en camino. Temperatura siendo monitoreada."
                  : "El riñón está siendo preparado para el traslado."}
            </div>
          </div>
        </div>
      </div>

      {/* ── Módulo de firma (Hospital) ────────────────────────────────────── */}
      {contractReached && (
        <div className={`rounded-lg border p-4 ${
          isIssued
            ? "border-[#79cf9c]/40 bg-[#1c3128]"
            : "border-[#cfa25e]/40 bg-[#332818]"
        }`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileSignature className="h-4 w-4 text-[#79cf9c]" />
                <h3 className="text-sm font-semibold text-[#f0f5f9]">
                  Confirmación del acuerdo
                </h3>
              </div>
              <p className="text-xs text-[#7d94a8]">
                El hospital debe confirmar que acepta recibir el riñón asignado.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  sigs.hospital
                    ? "border-[#79cf9c]/30 bg-[#1c3128] text-[#79cf9c]"
                    : "border-[#cfa25e]/40 bg-[#332818] text-[#cfa25e]"
                }`}>
                  {sigs.hospital ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  Hospital: {sigs.hospital ? "✓ Confirmado" : "Pendiente"}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  sigs.incucai
                    ? "border-[#79cf9c]/30 bg-[#1c3128] text-[#79cf9c]"
                    : "border-[#54697c]/40 bg-[#132538] text-[#7d94a8]"
                }`}>
                  {sigs.incucai ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  INCUCAI: {sigs.incucai ? "✓ Aprobado" : "Esperando aprobación central…"}
                </span>
              </div>
            </div>
            {isIssued ? (
              <div className="text-xs text-[#79cf9c] flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Aprobado por ambas partes
              </div>
            ) : isPendingHosp ? (
              <Button
                className="bg-[#79cf9c] hover:bg-[#79cf9c]/80 text-[#0a141f] font-bold text-xs"
                size="sm"
                onClick={async () => {
                  await signAssignment("hospital")
                  toast.success("Confirmación registrada", {
                    description: "Esperando aprobación de INCUCAI…",
                  })
                }}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Confirmar aceptación
              </Button>
            ) : (
              <div className="text-xs text-[#7d94a8] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Ya confirmaste. Esperando INCUCAI…
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Incidente técnico (Ransomware — texto genérico) ──────────────── */}
      {scenario === "ransomware" && simTimeHours >= 12 && (
        <div className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${
          ransomwareRestored
            ? "border-[#4fb8c4]/20 bg-[#1d3540] text-[#4fb8c4]"
            : "border-[#cfa25e]/30 bg-[#332818] text-[#cfa25e]"
        }`}>
          <Server className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            {ransomwareRestored
              ? "El incidente técnico fue resuelto. El sistema INTEGRA funciona con normalidad."
              : "Se detectó un incidente técnico. El sistema INTEGRA continuó operando con normalidad. Su riñón no fue afectado."}
          </p>
        </div>
      )}

      {/* ── Alertas (texto llano) ─────────────────────────────────────────── */}
      <AlertsPanel
        role="hospital"
        plainMode
        title="Avisos del traslado"
        description="Información relevante para la recepción del órgano."
      />

      {/* ── Checklist de recepción ────────────────────────────────────────── */}
      {simTimeHours >= 26 && (
        <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clipboard className="h-4 w-4 text-[#79cf9c]" />
            <h3 className="text-sm font-semibold text-[#f0f5f9]">Checklist de recepción</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            {[
              { key: "temp",      label: "Temperatura dentro de rango (2–8°C)",     detail: `Actual: ${caseData.tempInternal.toFixed(1)}°C` },
              { key: "coldChain", label: "Cadena de frío íntegra",                  detail: `Precinto: ${caseData.sealStatus}` },
              { key: "alerts",    label: "Sin alertas críticas sin resolver",        detail: "Revisar avisos antes de confirmar" },
              { key: "history",   label: "Historial de temperatura revisado",        detail: "Ver el feed de eventos" },
            ].map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                <Checkbox
                  id={`chk-${item.key}`}
                  checked={checklist[item.key as keyof typeof checklist]}
                  onCheckedChange={(c) => setChecklist((p) => ({ ...p, [item.key]: !!c }))}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor={`chk-${item.key}`} className="text-sm text-[#f0f5f9] cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-xs text-[#7d94a8]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            className={`w-full h-12 font-bold text-base transition-all ${
              hasReceived
                ? "bg-[#1c3128] text-[#79cf9c] border border-[#79cf9c]/30 cursor-default"
                : canReceive
                  ? "bg-[#79cf9c] hover:bg-[#79cf9c]/80 text-[#0a141f]"
                  : "bg-[#132538] text-[#54697c] cursor-not-allowed"
            }`}
            disabled={!canReceive && !hasReceived}
            onClick={() => {
              if (canReceive && !hasReceived) {
                // Trigger simulated reception
                toast.success("Custodia física recibida y confirmada en el Hospital Receptor")
              }
            }}
          >
            {hasReceived
              ? <><CheckCircle2 className="mr-2 h-5 w-5" />Recepción confirmada</>
              : "Confirmar recepción del riñón"}
          </Button>
        </div>
      )}

      {/* ── Módulo Médico Trasplantador: Registrar Resultado ────────────── */}
      {hasReceived && (
        <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clipboard className="h-4 w-4 text-[#79cf9c]" />
            <h3 className="text-sm font-semibold text-[#f0f5f9]">Registrar Resultado del Trasplante</h3>
          </div>
          <p className="text-xs text-[#7d94a8]">
            Como Médico Trasplantador, registre las notas y resultado clínico post-operatorio.
          </p>
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#54697c] font-bold mb-1">
                Resultado de Cirugía
              </label>
              <select className="w-full bg-[#132538] border border-[#22384d] rounded p-2 text-xs text-[#f0f5f9] focus:outline-none focus:border-[#79cf9c]">
                <option value="exitoso">Trasplante Exitoso (Órgano Funcional)</option>
                <option value="complicaciones">Complicaciones Leves (Monitoreo)</option>
                <option value="fallido">Falla de Injerto Primario</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#54697c] font-bold mb-1">
                Notas Post-Operatorias
              </label>
              <textarea
                placeholder="Perfusión renal inmediata, diuresis en mesa quirúrgica..."
                className="w-full h-16 bg-[#132538] border border-[#22384d] rounded p-2 text-xs text-[#f0f5f9] placeholder-[#54697c] focus:outline-none focus:border-[#79cf9c] resize-none"
              />
            </div>
            <Button
              className="bg-[#79cf9c] hover:bg-[#79cf9c]/80 text-[#0a141f] font-bold text-xs"
              onClick={() => {
                toast.success("Resultado del Trasplante Guardado", {
                  description: "Registrado e inmutable en el historial clínico."
                })
              }}
            >
              Guardar Reporte Médico
            </Button>
          </div>
        </div>
      )}

      {/* ── Feed de eventos (texto llano) ────────────────────────────────── */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 hover:bg-[#132538] transition-colors"
          onClick={() => setShowFeed(!showFeed)}
        >
          <span className="text-sm font-semibold text-[#f0f5f9]">Historial de eventos</span>
          {showFeed
            ? <ChevronDown className="h-4 w-4 text-[#54697c]" />
            : <ChevronRight className="h-4 w-4 text-[#54697c]" />
          }
        </button>
        {showFeed && (
          <div className="p-4 border-t border-[#22384d]">
            <Traceability techMode={false} role="hospital" />
          </div>
        )}
      </div>
    </div>
  )
}
