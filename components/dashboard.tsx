"use client"

import { useState, useEffect } from "react"
import { StoreProvider, useStore } from "@/lib/store"
import { HUMAN_ROLES, type RoleInfo } from "@/lib/case-data"
import { CoordinadorView } from "@/components/views/coordinador-view"
import { HospitalView } from "@/components/views/hospital-view"
import { AuditorView } from "@/components/views/auditor-view"
import { IotView } from "@/components/views/iot-view"
import { TransportadorView } from "@/components/views/transportador-view"
import { ProveedorITView } from "@/components/views/proveedor-it-view"
import { SimClockBar } from "@/components/blocks/sim-clock-bar"
import { DirectorPanel } from "@/components/blocks/director-panel"
import { Shield, Key, Database, ChevronRight, LogOut, RefreshCw, Heart, Info } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  )
}

function MainLayout() {
  const {
    screen,
    setScreen,
    roleActor,
    setRoleActor,
    scenario,
    setScenario,
    simTimeHours,
    caseData,
  } = useStore()

  const [selectedRoleInfo, setSelectedRoleInfo] = useState<RoleInfo | null>(null)

  // 1.5s Verifying credentials animation
  useEffect(() => {
    if (screen === "verifying") {
      const timer = setTimeout(() => {
        setScreen("dashboard")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [screen, setScreen])

  // Login Portal Screen
  if (screen === "portal") {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex flex-col justify-between font-sans p-6 sm:p-12">
        {/* Header */}
        <div className="max-w-[1100px] mx-auto w-full flex items-center justify-between pb-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">INTEGRA</h1>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Trazabilidad de Órganos</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-muted-foreground/60 bg-card border border-border px-2 py-1 rounded">
              PROTOTIPO v2.0 · API GATEWAY DEMO
            </span>
            <span className="text-[9px] text-primary font-mono flex items-center gap-1">
              <Info className="h-3 w-3" /> Interfaz de Referencia de la API (RBAC)
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[900px] mx-auto w-full py-10 flex-1 flex flex-col justify-center gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-card-foreground">Portal de Acceso Seguro</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Simulación de trazabilidad IoT + Blockchain en tiempo real. Seleccione un escenario de amenaza y una credencial de actor.
            </p>
          </div>

          {/* 1. Threat Scenario Selector */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">1. Seleccione Escenario de Simulación</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "normal", label: "Flujo Normal", desc: "Traslado sin anomalías o ciberataques." },
                { id: "insider", label: "Insider Amenaza", desc: "Intento unilateral de alterar lista de espera." },
                { id: "ransomware", label: "Ransomware Activo", desc: "Nodo hospitalario cifrado y aislado." },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id as any)}
                  className={`flex flex-col text-left p-3.5 rounded-lg border transition-all ${
                    scenario === sc.id
                      ? "border-primary bg-primary/5 text-card-foreground"
                      : "border-border bg-secondary hover:border-muted-foreground/60 text-muted-foreground"
                  }`}
                >
                  <span className={`text-xs font-bold ${scenario === sc.id ? "text-primary" : "text-foreground"}`}>
                    {sc.label}
                  </span>
                  <span className="text-[10px] mt-1 leading-relaxed">{sc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Credentials selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">2. Autentique Credencial de Actor</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HUMAN_ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRoleInfo(r)
                    setRoleActor(r.id)
                    setScreen("verifying")
                  }}
                  className="group flex flex-col justify-between text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:translate-y-[-2px] duration-300"
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase"
                        style={{ color: r.color, borderColor: `${r.color}30`, backgroundColor: `${r.color}08` }}
                      >
                        {r.org}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-card-foreground tracking-tight">{r.label}</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">{r.method}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 w-full">
                    <p className="text-[9px] text-muted-foreground/60 italic leading-normal">{r.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer con Aclaración Arquitectónica de API */}
        <div className="space-y-2 pt-8 border-t border-border max-w-[1100px] mx-auto w-full text-center">
          <div className="inline-flex items-center gap-2 bg-card border border-primary/30 px-4 py-2 rounded-lg text-xs text-muted-foreground max-w-3xl mx-auto">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <p className="text-left leading-relaxed">
              <strong className="text-card-foreground">Aviso de Arquitectura API:</strong> Este Portal es una interfaz gráfica de referencia para demostrar el consumo de la API de INTEGRA (Hyperledger Fabric Gateway). Los sistemas legados (e.g. SINTRA/HIS) consumirán los endpoints sin alterar sus interfaces actuales.
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            INTEGRA Blockchain + IoT. Prototipo Académico de Seguridad y Auditoría de Trasplantes.
          </p>
        </div>
      </div>
    )
  }

  // Verifying Credentials Screen
  if (screen === "verifying") {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans p-6">
        <div className="max-w-sm w-full bg-card border border-border rounded-2xl p-6 text-center space-y-6 relative overflow-hidden">
          {/* Scanning sweep animation line */}
          <div className="absolute left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_var(--primary)] animate-[sweep_1.5s_ease-in-out_infinite]" />

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary animate-pulse">
            <Shield className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-card-foreground">Verificando credencial...</h3>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed truncate">
              {selectedRoleInfo?.id === "iot" ? "TLS Mutuo Handshake con IoT CA..." : "Estableciendo conexión mTLS y verificando firma..."}
            </p>
          </div>

          <div className="bg-secondary border border-border rounded-lg p-3 text-left font-mono text-[10px] text-muted-foreground/60 space-y-1">
            <p>Actor: {selectedRoleInfo?.label}</p>
            <p>CA: {selectedRoleInfo?.org}</p>
            <p>Status: TLS_MUTUAL_HANDSHAKE</p>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard / Inner view screen
  const currentRole = HUMAN_ROLES.find((r) => r.id === roleActor) ?? HUMAN_ROLES[0]

  // CoordinadorView has its own header — render it standalone
  if (roleActor === "incucai") {
    return (
      <div className="dark min-h-screen bg-background text-foreground font-sans">
        <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6">
          <CoordinadorView />
        </div>
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans">
      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-4">

        {/* ── Top Header Navigation Bar ────────────────────────────────────── */}
        <header className="flex flex-col gap-3 pb-3 border-b border-border lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-[9px] font-bold font-mono px-2.5 py-1 rounded border uppercase tracking-wider bg-opacity-5"
              style={{
                color: currentRole?.color,
                borderColor: `${currentRole?.color}30`,
                backgroundColor: `${currentRole?.color}08`,
              }}
            >
              {currentRole?.org}
            </span>
            <div>
              <h1 className="text-base font-bold text-card-foreground tracking-tight leading-tight">
                INTEGRA — Panel Operativo del Traslado Renal
              </h1>
              <p className="text-[10px] text-muted-foreground/60 font-semibold mt-0.5">
                {currentRole?.label} · Escenario: <span className="text-primary">{scenario === "normal" ? "Flujo Normal" : scenario === "insider" ? "Insider Amenaza" : "Ransomware Activo"}</span>
              </p>
            </div>
          </div>

          {/* Integrated SimClockBar and Action Buttons — identical to Coordinator's */}
          <div className="flex flex-wrap items-start gap-2 sm:shrink-0">
            <div className="min-w-[220px] w-full sm:w-auto">
              <SimClockBar />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <DirectorPanel />
              <button
                onClick={() => {
                  setScreen("portal")
                  toast.info("Sesión cerrada. Seleccione el nuevo actor para continuar la simulación.")
                }}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Cambiar rol
              </button>
              <button
                onClick={() => {
                  setScreen("portal")
                  toast.info("Simulación finalizada. Cerrando sesión...")
                }}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all flex items-center gap-1.5"
              >
                <LogOut className="h-3 w-3" />
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* ── Compact Horizontal Case Summary Header Bar ────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-4 bg-card border border-border rounded-xl p-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Heart className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold block font-sans">Caso Activo</span>
              <span className="font-bold text-card-foreground">{caseData.caseId} ({caseData.organ})</span>
            </div>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold block font-sans">Donante</span>
            <span className="text-foreground truncate block">{caseData.origin}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold block font-sans">Receptor</span>
            <span className="text-foreground truncate block">{caseData.destination}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold font-sans">Cadena de Frío:</span>
            <span className="text-ok font-bold px-2 py-0.5 rounded bg-ok/10 border border-ok/20">
              {caseData.coldChain} ({caseData.tempInternal.toFixed(1)}°C)
            </span>
          </div>
        </div>

        {/* ── Full Width Content Area ───────────────────────────────────────── */}
        <main className="w-full min-w-0">
          {roleActor === "hospital" && <HospitalView />}
          {roleActor === "auditor" && <AuditorView />}
          {roleActor === "iot" && <IotView />}
          {roleActor === "transportador" && <TransportadorView />}
          {roleActor === "itprov" && <ProveedorITView />}
        </main>

      </div>
    </div>
  )
}
