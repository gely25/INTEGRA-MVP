"use client"

import { useState } from "react"
import { StoreProvider, useStore } from "@/lib/store"
import { ROLES, type CaseSnapshot, type CustodyEvent } from "@/lib/case-data"
import { RoleSwitcher } from "@/components/role-switcher"
import { StatusPill } from "@/components/status-pill"
import { CoordinadorView } from "@/components/views/coordinador-view"
import { TransportadorView } from "@/components/views/transportador-view"
import { HospitalView } from "@/components/views/hospital-view"
import { AuditorView } from "@/components/views/auditor-view"
import { Activity, ChevronDown, Wrench } from "lucide-react"
import { Stepper, type Step } from "@/components/stepper"
import { Button } from "@/components/ui/button"

function getFlowSteps(caseData: CaseSnapshot, events: CustodyEvent[]): Step[] {
  const steps: Step[] = [
    { id: "creado", label: "Caso creado", status: "pending" },
    { id: "vinculado", label: "Dispositivo vinculado", status: "pending" },
    { id: "iniciado", label: "Traslado iniciado", status: "pending" },
    { id: "telemetria", label: "Telemetría", status: "pending" },
    { id: "recepcion", label: "Recepción", status: "pending" },
    { id: "auditoria", label: "Auditoría", status: "pending" },
  ]

  const hasEvent = (name: string) => events.some((e) => e.event === name)

  // 1. Caso creado
  if (hasEvent("CASE_CREATED") || caseData.status !== "Preparado") {
    steps[0].status = "complete"
    steps[1].status = "current"
  } else {
    steps[0].status = "current"
  }

  // 2. Dispositivo vinculado
  if (hasEvent("DEVICE_LINKED") || caseData.deviceAuthorized) {
    steps[1].status = "complete"
    if (steps[0].status === "complete") steps[2].status = "current"
  }

  // 3. Traslado iniciado
  if (hasEvent("TRANSPORT_STARTED") || caseData.status === "En traslado" || caseData.status === "Recibido" || caseData.status === "Cerrado") {
    steps[2].status = "complete"
    steps[3].status = "current"
  }

  // 4. Telemetría
  if (hasEvent("IOT_READING_RECEIVED") && steps[2].status === "complete") {
    steps[3].status = "complete"
    steps[4].status = "current"
  }

  // 5. Recepción
  if (hasEvent("CUSTODY_RECEIVED") || caseData.status === "Recibido" || caseData.status === "Cerrado") {
    steps[4].status = "complete"
    steps[5].status = "current"
  }

  // 6. Auditoría
  if (hasEvent("AUDIT_VERIFIED") || caseData.status === "Cerrado") {
    steps[5].status = "complete"
  }

  return steps
}

function Shell() {
  const { role, caseData, events, updateCase, addEvent, simulateReading, pushAlert } = useStore()
  const roleInfo = ROLES.find((r) => r.id === role)!
  const steps = getFlowSteps(caseData, events)
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="sticky top-0 hidden h-svh w-72 flex-col border-r bg-background lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-bold text-primary">
          <Activity className="size-5" />
          <span>INTEGRA</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-4">Progreso del Traslado</p>
            <Stepper steps={steps} orientation="vertical" />
          </div>
          
          {/* Panel de Control MVP - Colapsable */}
          <div className="rounded-lg border bg-muted/30 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              onClick={() => setDemoOpen(!demoOpen)}
            >
              <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" /> Herramientas de Demo
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${demoOpen ? "rotate-180" : ""}`} />
            </button>
            {demoOpen && (
              <div className="px-4 pb-4 space-y-2 border-t pt-3">
                <Button
                  variant="outline" size="sm" className="w-full justify-start text-xs"
                  onClick={() => {
                    updateCase({ status: "Creado" })
                    addEvent("CASE_CREATED", { actor: "Coord. L. Pérez", org: "INTEGRA" })
                  }}
                  disabled={caseData.status !== "Preparado"}
                >
                  1. Crear caso
                </Button>
                <Button
                  variant="outline" size="sm" className="w-full justify-start text-xs"
                  onClick={() => {
                    updateCase({ deviceAuthorized: true })
                    addEvent("DEVICE_LINKED", { actor: "Coord. L. Pérez", org: "INTEGRA" })
                  }}
                  disabled={caseData.deviceAuthorized || caseData.status === "Preparado"}
                >
                  2. Vincular dispositivo
                </Button>
                <Button
                  variant="outline" size="sm" className="w-full justify-start text-xs"
                  onClick={() => {
                    updateCase({ status: "En traslado", custodyStatus: "Activa" })
                    addEvent("TRANSPORT_STARTED", { actor: "Transp. J. Ramírez", org: "Logística" })
                  }}
                  disabled={caseData.status !== "Creado" || !caseData.deviceAuthorized}
                >
                  3. Iniciar traslado
                </Button>
                <div className="border-t pt-2 mt-2 space-y-2">
                  <Button
                    variant="secondary" size="sm" className="w-full justify-start text-xs"
                    onClick={() => simulateReading()}
                  >
                    Simular Telemetría
                  </Button>
                  <Button
                    variant="destructive" size="sm" className="w-full justify-start text-xs"
                    onClick={() => {
                      pushAlert({ code: "TEMP_CRITICAL", level: "danger", title: "Temperatura crítica", detail: "Umbral superado" })
                      addEvent("TEMP_CRITICAL", { actor: "DEVICE-001", org: "IoT" })
                    }}
                  >
                    Simular Alerta Crítica
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Cambiar de Rol</p>
          <RoleSwitcher />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Activity className="size-5" />
            <span>INTEGRA</span>
          </div>
          <RoleSwitcher />
        </header>

        <div className="flex-1 space-y-6 p-4 lg:p-8">
          {/* Global Info Header */}
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{roleInfo.title}</h1>
                <p className="text-muted-foreground">{roleInfo.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono text-muted-foreground">{caseData.caseId}</span>
                <span className="text-muted-foreground">|</span>
                <span className="font-medium">{caseData.organ}</span>
                <span className="text-muted-foreground">|</span>
                <StatusPill tone="info" pulse={caseData.status === "En traslado"}>{caseData.status}</StatusPill>
                <span className="text-muted-foreground">|</span>
                <span className="font-mono">Temp. {caseData.tempInternal.toFixed(1)} °C</span>
                <span className="text-muted-foreground">|</span>
                <span className="font-medium">{caseData.gpsActive ? "GPS activo" : "Sin GPS"}</span>
                <span className="text-muted-foreground">|</span>
                <span className="font-mono">Batería {caseData.battery}%</span>
                <span className="text-muted-foreground">|</span>
                <StatusPill tone="ok">Evidencia {caseData.evidenceStatus}</StatusPill>
                <span className="text-muted-foreground">|</span>
                <span className="font-mono">ETA {caseData.eta}</span>
              </div>
            </div>
            {/* Stepper horizontal para móviles */}
            <div className="mt-4 border-t pt-4 lg:hidden">
              <Stepper steps={steps} orientation="horizontal" />
            </div>
          </div>

          {/* Role Content (Control Center) */}
          <div className="w-full">
            <RoleContent role={role} />
          </div>
        </div>

        <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-background">
          INTEGRA MVP · Rediseño de Centro de Control · Datos simulados ({caseData.caseId})
        </footer>
      </main>
    </div>
  )
}

function RoleContent({ role }: { role: string }) {
  switch (role) {
    case "coordinador":
      return <CoordinadorView />
    case "transportador":
      return <TransportadorView />
    case "hospital":
      return <HospitalView />
    case "auditor":
      return <AuditorView />
    default:
      return <CoordinadorView />
  }
}

export function Dashboard() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
