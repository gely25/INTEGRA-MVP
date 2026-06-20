"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"
import { DataRow } from "@/components/blocks/data-row"
import { AlertsPanel } from "@/components/blocks/alerts-panel"
import { TemperatureChart } from "@/components/blocks/temperature-chart"
import { StatusPill } from "@/components/status-pill"
import { toast } from "sonner"
import { QrCode, MapPin, Satellite, BatteryMedium, WifiOff, RefreshCw, Thermometer, ChevronRight, Package, AlertTriangle, BarChart2 } from "lucide-react"

export function TransportadorView() {
  const { caseData, offline, syncOffline } = useStore()
  const [openDrawer, setOpenDrawer] = useState<"ruta" | "termico" | null>(null)

  const pending = offline.filter((o) => !o.synced).length

  return (
    <div className="space-y-6">
      {/* Fila 1: Temperatura central + Estado clave */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Temperatura heroica */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="h-full border-l-4 border-l-blue-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardContent className="p-8 flex flex-col items-center justify-center gap-3 h-full">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium uppercase tracking-widest">Temperatura Interna</span>
              </div>
              <span className="text-8xl font-bold tracking-tighter tabular-nums">
                {caseData.tempInternal.toFixed(1)}°
              </span>
              <StatusPill tone={caseData.tempInternal >= 2 && caseData.tempInternal <= 8 ? "ok" : "danger"}>
                {caseData.tempInternal >= 2 && caseData.tempInternal <= 8 ? "Dentro de rango (2–8°C)" : "¡FUERA DE RANGO!"}
              </StatusPill>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setOpenDrawer("termico")}>
                <BarChart2 className="mr-2 h-3 w-3" /> Ver historial térmico <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Métricas del dispositivo */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-1">
                  <Satellite className="h-3 w-3" /> GPS
                </span>
                <span className="font-mono text-2xl font-bold">{caseData.gpsActive ? "ACTIVO" : "OFF"}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-1">
                  <BatteryMedium className="h-3 w-3" /> Batería
                </span>
                <span className="font-mono text-2xl font-bold">{caseData.battery}%</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-1">
                  <WifiOff className="h-3 w-3" /> Buffer Offline
                </span>
                <span className="font-mono text-lg font-bold">{pending ? `${pending} pendientes` : "OK"}</span>
                {pending > 0 && (
                  <Button size="sm" variant="outline" className="mt-1 h-7 text-xs" onClick={() => { syncOffline(); toast.success("Lecturas reenviadas") }}>
                    <RefreshCw className="mr-1 h-3 w-3" /> Reenviar
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ruta resumida */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" /> Ruta
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setOpenDrawer("ruta")}>
                  Ver detalle <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{caseData.originCity}</span>
                <span className="text-xs text-muted-foreground">{caseData.currentLocation}</span>
                <span className="font-medium">{caseData.destinationCity}</span>
              </div>
              <Progress value={caseData.routeProgress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progreso: <strong className="text-foreground font-mono">{caseData.routeProgress}%</strong></span>
                <span>ETA: <strong className="text-foreground font-mono">{caseData.eta}</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fila 2: Integridad + Alertas */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Integridad del Contenedor
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <DataRow label="Precinto" value={<StatusPill tone="ok">{caseData.sealStatus}</StatusPill>} />
              <DataRow label="Cadena de frío" value={<StatusPill tone="ok">{caseData.coldChain}</StatusPill>} />
              <DataRow label="Dispositivo ID" value={caseData.deviceId} mono />
              <DataRow label="Contenedor" value={caseData.containerId} mono />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <AlertsPanel title="Alertas logísticas en ruta" description="Temperatura, shocks y conexión." />
        </div>
      </div>

      {/* DRAWER: Detalle de Ruta */}
      <Sheet open={openDrawer === "ruta"} onOpenChange={(o) => !o && setOpenDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Detalle de Ruta</SheetTitle>
            <SheetDescription>Progreso detallado del traslado y coordenadas GPS.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{caseData.originCity}</span>
                  <span className="text-muted-foreground">{caseData.currentLocation}</span>
                  <span className="font-medium">{caseData.destinationCity}</span>
                </div>
                <Progress value={caseData.routeProgress} className="h-3" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <DataRow label="Progreso" value={`${caseData.routeProgress}%`} mono />
                  <DataRow label="ETA" value={caseData.eta} mono />
                  <DataRow label="Lat/Lon" value="-32.412, -63.240" mono />
                  <DataRow label="Custodia" value={<StatusPill tone="ok">Activa</StatusPill>} />
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg border overflow-hidden h-64 bg-muted flex items-center justify-center text-muted-foreground text-sm">
              [Mapa GPS integrado — pendiente de implementación]
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* DRAWER: Historial Térmico */}
      <Sheet open={openDrawer === "termico"} onOpenChange={(o) => !o && setOpenDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Historial Térmico</SheetTitle>
            <SheetDescription>Variación de temperatura del contenedor durante el traslado.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TemperatureChart />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
