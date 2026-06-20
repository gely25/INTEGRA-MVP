"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"
import { StatusPill } from "@/components/status-pill"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DataRow } from "@/components/blocks/data-row"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { TemperatureChart } from "@/components/blocks/temperature-chart"
import { toast } from "sonner"
import { CheckCircle2, ClipboardCheck, ShieldCheck, Thermometer, ChevronRight, BarChart2 } from "lucide-react"
import Image from "next/image"

export function HospitalView() {
  const { caseData, updateCase, addEvent, alerts } = useStore()
  const [openDrawer, setOpenDrawer] = useState<"expediente" | null>(null)

  const [checklist, setChecklist] = useState({
    temp: false,
    coldChain: false,
    evidence: false,
    alerts: false,
    history: false
  })

  const canReceive = Object.values(checklist).every(Boolean) && caseData.status !== "Recibido"
  const hasCriticalAlerts = alerts.some(a => a.level === "danger")

  const handleReceive = () => {
    updateCase({ status: "Recibido", custodyStatus: "Recepción confirmada" })
    addEvent("CUSTODY_RECEIVED", { actor: "Hospital Receptor", org: "Hosp. Córdoba" })
    toast.success("Custodia recibida", { description: "Órgano recepcionado. Evento registrado." })
  }

  return (
    <div className="space-y-6">
      {/* Fila 1: Gemelo Operativo + Checklist */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Gemelo Operativo */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Gemelo Operativo</CardTitle>
              <CardDescription>Estado digital del órgano en traslado.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative w-48 h-48">
                <Image
                  src="/images/kidney.png"
                  alt="Kidney"
                  sizes="(max-width: 768px) 100vw, 200px"
                  fill
                  className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <StatusPill tone="ok">Condición Óptima</StatusPill>
              </div>
              <div className="w-full border-t pt-4 space-y-1">
                <DataRow label="Temp." value={<span className="font-mono font-bold">{caseData.tempInternal.toFixed(1)} °C</span>} />
                <DataRow label="Batería" value={<span className="font-mono">{caseData.battery}%</span>} />
                <DataRow label="Evidencia" value={<StatusPill tone="ok">{caseData.evidenceStatus}</StatusPill>} />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setOpenDrawer("expediente")}>
                <BarChart2 className="mr-2 h-3 w-3" /> Ver expediente térmico <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Checklist de Recepción */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-full border-primary/50">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" /> Checklist de Recepción
              </CardTitle>
              <CardDescription>Verificación obligatoria antes de aceptar la custodia física.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Checkbox id="chk-temp" checked={checklist.temp} onCheckedChange={(c) => setChecklist(p => ({ ...p, temp: !!c }))} />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="chk-temp" className="font-medium cursor-pointer">Temperatura dentro de rango</Label>
                    <p className="text-xs text-muted-foreground">Actual: {caseData.tempInternal.toFixed(1)}°C (Rango 2–8°C)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="chk-chain" checked={checklist.coldChain} onCheckedChange={(c) => setChecklist(p => ({ ...p, coldChain: !!c }))} />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="chk-chain" className="font-medium cursor-pointer">Cadena de frío íntegra</Label>
                    <p className="text-xs text-muted-foreground">Precinto: {caseData.sealStatus}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="chk-evi" checked={checklist.evidence} onCheckedChange={(c) => setChecklist(p => ({ ...p, evidence: !!c }))} />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="chk-evi" className="font-medium cursor-pointer">Evidencia criptográfica válida</Label>
                    <p className="text-xs text-muted-foreground">Blockchain log integrity verified</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="chk-alerts" checked={checklist.alerts} onCheckedChange={(c) => setChecklist(p => ({ ...p, alerts: !!c }))} />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="chk-alerts" className="font-medium cursor-pointer">Sin alerta crítica activa</Label>
                    <p className="text-xs text-muted-foreground">Alertas críticas: {hasCriticalAlerts ? "⚠ Sí" : "✓ No"}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:col-span-2">
                  <Checkbox id="chk-hist" checked={checklist.history} onCheckedChange={(c) => setChecklist(p => ({ ...p, history: !!c }))} />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="chk-hist" className="font-medium cursor-pointer">Historial térmico revisado</Label>
                    <p className="text-xs text-muted-foreground">Ver el expediente completo antes de confirmar.</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold"
                size="lg"
                disabled={!canReceive}
                onClick={handleReceive}
              >
                {caseData.status === "Recibido" ? (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Recepción Confirmada</>
                ) : (
                  "Confirmar Recepción del Órgano"
                )}
              </Button>

              {caseData.status === "Recibido" && (
                <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ El órgano ha sido transferido al Hospital Receptor exitosamente.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fila 2: Origen y Alertas */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" /> Expediente del caso
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <DataRow label="Caso" value={caseData.caseId} mono />
              <DataRow label="Origen" value={caseData.origin} />
              <DataRow label="Estado" value={<StatusPill tone={caseData.status === "Recibido" ? "ok" : "warn"}>{caseData.status}</StatusPill>} />
              <DataRow label="Custodia" value={<StatusPill tone={caseData.status === "Recibido" ? "ok" : "info"}>{caseData.custodyStatus}</StatusPill>} />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <AlertsPanel title="Alertas del traslado" description="Incidentes registrados durante el traslado." />
        </div>
      </div>

      {/* DRAWER: Expediente Térmico */}
      <Sheet open={openDrawer === "expediente"} onOpenChange={(o) => !o && setOpenDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Expediente Térmico Completo</SheetTitle>
            <SheetDescription>Historial de temperatura durante todo el traslado para validar la cadena de frío.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TemperatureChart />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
