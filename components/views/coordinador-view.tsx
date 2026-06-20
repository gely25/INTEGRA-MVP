"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"
import { DataRow } from "@/components/blocks/data-row"
import { IschemiaClock } from "@/components/ischemia-clock"
import { TemperatureChart } from "@/components/blocks/temperature-chart"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { Traceability } from "@/components/blocks/traceability"
import { StatusPill } from "@/components/status-pill"
import { toast } from "sonner"
import {
  Thermometer, Satellite, BatteryMedium, Wifi,
  Activity, Link2, Play, FilePlus2, AlertTriangle,
  LayoutDashboard, ClipboardList, ChevronRight
} from "lucide-react"

export function CoordinadorView() {
  const { caseData, updateCase, addEvent, simulateReading, pushAlert } = useStore()
  const [openDrawer, setOpenDrawer] = useState<"telemetria" | "trazabilidad" | null>(null)

  return (
    <div className="space-y-6">
      {/* Fila 1: Vista General + Isquemia */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" /> Vista general del caso
              </CardTitle>
              <CardDescription>Resumen operativo del traslado renal.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-8 sm:grid-cols-2">
              <div className="divide-y">
                <DataRow label="Origen" value={caseData.origin} />
                <DataRow label="Destino" value={caseData.destination} />
                <DataRow label="Ubicación actual" value={caseData.currentLocation} />
              </div>
              <div className="divide-y">
                <DataRow label="Contenedor" value={caseData.containerId} mono />
                <DataRow label="Dispositivo" value={caseData.deviceId} mono />
                <DataRow label="Estado de custodia" value={<StatusPill tone={caseData.custodyStatus === "Activa" ? "ok" : "warn"}>{caseData.custodyStatus}</StatusPill>} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Isquemia fría</CardTitle>
              <CardDescription>Cuenta regresiva al límite clínico.</CardDescription>
            </CardHeader>
            <CardContent>
              <IschemiaClock />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fila 2: KPIs Telemetría + Acciones */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="col-span-12 lg:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" /> Telemetría en vivo
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setOpenDrawer("telemetria")}>
                  Ver historial <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Thermometer className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium uppercase tracking-wide">Temp.</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{caseData.tempInternal.toFixed(1)} °C</p>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Satellite className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium uppercase tracking-wide">GPS</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{caseData.gpsActive ? "Activo" : "Off"}</p>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BatteryMedium className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium uppercase tracking-wide">Batería</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{caseData.battery}%</p>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Wifi className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium uppercase tracking-wide">Red</span>
                </div>
                <p className="mt-1 font-mono text-sm font-semibold">{caseData.connectivity}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4 text-primary" /> Acciones del flujo
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setOpenDrawer("trazabilidad")}>
                  Ver trazabilidad <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                size="sm"
                variant={caseData.status === "Preparado" ? "default" : "outline"}
                onClick={() => {
                  updateCase({ status: "Creado" })
                  addEvent("CASE_CREATED", { actor: "Coord. L. Pérez", org: "INTEGRA" })
                  toast.success("Caso creado", { description: "Evento registrado en el ledger." })
                }}
                disabled={caseData.status !== "Preparado"}
              >
                <FilePlus2 className="mr-2 h-3 w-3" /> Crear caso
              </Button>
              <Button
                size="sm"
                variant={!caseData.deviceAuthorized && caseData.status !== "Preparado" ? "default" : "outline"}
                onClick={() => {
                  updateCase({ deviceAuthorized: true })
                  addEvent("DEVICE_LINKED", { actor: "Coord. L. Pérez", org: "INTEGRA" })
                  toast.success("Dispositivo vinculado")
                }}
                disabled={caseData.deviceAuthorized || caseData.status === "Preparado"}
              >
                <Link2 className="mr-2 h-3 w-3" /> Vincular
              </Button>
              <Button
                size="sm"
                variant={caseData.status === "Creado" && caseData.deviceAuthorized ? "default" : "outline"}
                onClick={() => {
                  updateCase({ status: "En traslado", custodyStatus: "Activa" })
                  addEvent("TRANSPORT_STARTED", { actor: "Transp. J. Ramírez", org: "Logística Norte" })
                  toast.success("Traslado iniciado")
                }}
                disabled={caseData.status !== "Creado" || !caseData.deviceAuthorized}
              >
                <Play className="mr-2 h-3 w-3" /> Iniciar traslado
              </Button>
              <Button size="sm" variant="destructive" onClick={() => {
                pushAlert({ code: "TEMP_CRITICAL", level: "danger", title: "Temperatura crítica", detail: "Contenedor superó el umbral." })
                addEvent("TEMP_CRITICAL", { actor: "DEVICE-001", org: "Sensor IoT" })
                toast.error("Alerta simulada")
              }}>
                <AlertTriangle className="mr-2 h-3 w-3" /> Simular alerta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fila 3: Alertas activas */}
      <AlertsPanel canAcknowledge />

      {/* DRAWER: Historial Térmico + Telemetría */}
      <Sheet open={openDrawer === "telemetria"} onOpenChange={(o) => !o && setOpenDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Historial Térmico</SheetTitle>
            <SheetDescription>Gráfica de temperatura del contenedor durante el traslado.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TemperatureChart />
          </div>
        </SheetContent>
      </Sheet>

      {/* DRAWER: Trazabilidad completa */}
      <Sheet open={openDrawer === "trazabilidad"} onOpenChange={(o) => !o && setOpenDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Trazabilidad de Custodia</SheetTitle>
            <SheetDescription>Registro inmutable de eventos del ledger criptográfico.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Traceability />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
