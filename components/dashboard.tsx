"use client"

import { useState, useEffect } from "react"
import { StoreProvider, useStore } from "@/lib/store"
import { ROLES, type RoleInfo } from "@/lib/case-data"
import { CoordinadorView } from "@/components/views/coordinador-view"
import { HospitalView } from "@/components/views/hospital-view"
import { AuditorView } from "@/components/views/auditor-view"
import { IotView } from "@/components/views/iot-view"
import { TransportadorView } from "@/components/views/transportador-view" // IT Prov
import { SimClockBar } from "@/components/blocks/sim-clock-bar"
import { Shield, Key, Database, ChevronRight, LayoutDashboard, LogOut, Terminal, Lock, Heart, RefreshCw } from "lucide-react"
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
      <div className="dark min-h-screen bg-[#0a141f] text-[#dbe6ef] flex flex-col justify-between font-sans p-6 sm:p-12">
        {/* Header */}
        <div className="max-w-[1100px] mx-auto w-full flex items-center justify-between pb-8 border-b border-[#22384d]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4fb8c4]/10 border border-[#4fb8c4]/30">
              <Heart className="h-6 w-6 text-[#4fb8c4]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">INTEGRA</h1>
              <p className="text-[10px] text-[#54697c] uppercase tracking-wider font-semibold">Trazabilidad de Órganos</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#54697c] bg-[#0f1e2c] border border-[#22384d] px-2 py-1 rounded">
            PROTOTIPO v2.0
          </span>
        </div>

        {/* Main Content */}
        <div className="max-w-[900px] mx-auto w-full py-10 flex-1 flex flex-col justify-center gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[#f0f5f9]">Portal de Acceso Seguro</h2>
            <p className="text-sm text-[#7d94a8] max-w-md mx-auto">
              Simulación de trazabilidad IoT + Blockchain en tiempo real. Seleccione un escenario de amenaza y una credencial de actor.
            </p>
          </div>

          {/* 1. Threat Scenario Selector */}
          <div className="bg-[#0f1e2c] border border-[#22384d] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#4fb8c4]" />
              <h3 className="text-sm font-semibold text-[#f0f5f9]">1. Seleccione Escenario de Simulación</h3>
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
                      ? "border-[#4fb8c4] bg-[#4fb8c4]/5 text-[#f0f5f9]"
                      : "border-[#22384d] bg-[#132538] hover:border-[#54697c] text-[#7d94a8]"
                  }`}
                >
                  <span className={`text-xs font-bold ${scenario === sc.id ? "text-[#4fb8c4]" : "text-[#dbe6ef]"}`}>
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
              <Key className="h-4 w-4 text-[#4fb8c4]" />
              <h3 className="text-sm font-semibold text-[#f0f5f9]">2. Autentique Credencial de Actor</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRoleInfo(r)
                    setRoleActor(r.id)
                    setScreen("verifying")
                  }}
                  className="group flex flex-col justify-between text-left p-4 rounded-xl border border-[#22384d] bg-[#0f1e2c] hover:border-[#4fb8c4]/50 transition-all hover:translate-y-[-2px] duration-300"
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase"
                        style={{ color: r.color, borderColor: `${r.color}30`, backgroundColor: `${r.color}08` }}
                      >
                        {r.org}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#54697c] group-hover:text-[#4fb8c4] transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-[#f0f5f9] tracking-tight">{r.label}</h4>
                    <p className="text-[10px] text-[#7d94a8] leading-normal">{r.method}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#22384d]/50 w-full">
                    <p className="text-[9px] text-[#54697c] italic leading-normal">{r.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-[#54697c] pt-8 border-t border-[#22384d] max-w-[1100px] mx-auto w-full">
          INTEGRA Blockchain + IoT. Prototipo Académico de Seguridad y Auditoría de Trasplantes.
        </div>
      </div>
    )
  }

  // Verifying Credentials Screen
  if (screen === "verifying") {
    return (
      <div className="dark min-h-screen bg-[#0a141f] text-[#dbe6ef] flex flex-col items-center justify-center font-sans p-6">
        <div className="max-w-sm w-full bg-[#0f1e2c] border border-[#22384d] rounded-2xl p-6 text-center space-y-6 relative overflow-hidden">
          {/* Scanning sweep animation line */}
          <div className="absolute left-0 w-full h-[2px] bg-[#4fb8c4] shadow-[0_0_8px_#4fb8c4] animate-[sweep_1.5s_ease-in-out_infinite]" />

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4fb8c4]/15 text-[#4fb8c4] animate-pulse">
            <Shield className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#f0f5f9]">Verificando credencial...</h3>
            <p className="text-xs text-[#7d94a8] font-mono leading-relaxed truncate">
              {selectedRoleInfo?.id === "iot" ? "TLS Mutuo Handshake con IoT CA..." : "Estableciendo conexión mTLS y verificando firma..."}
            </p>
          </div>

          <div className="bg-[#132538] border border-[#22384d] rounded-lg p-3 text-left font-mono text-[10px] text-[#54697c] space-y-1">
            <p>Actor: {selectedRoleInfo?.label}</p>
            <p>CA: {selectedRoleInfo?.org}</p>
            <p>Status: TLS_MUTUAL_HANDSHAKE</p>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard / Inner view screen
  return (
    <div className="dark min-h-screen bg-[#0a141f] text-[#dbe6ef] font-sans">
      <div className="max-w-[1280px] mx-auto p-4 sm:p-5 pb-12 space-y-4">

        {/* ── Dashboard Header ────────────────────────────────────────────── */}
        <header className="flex flex-col gap-3 pb-3 border-b border-[#22384d] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase"
              style={{
                color: ROLES.find((r) => r.id === roleActor)?.color,
                borderColor: `${ROLES.find((r) => r.id === roleActor)?.color}40`,
                backgroundColor: `${ROLES.find((r) => r.id === roleActor)?.color}08`,
              }}
            >
              {ROLES.find((r) => r.id === roleActor)?.org}
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#f0f5f9] leading-tight">
                {ROLES.find((r) => r.id === roleActor)?.label}
              </h2>
              <p className="text-[9px] text-[#54697c] uppercase tracking-wider font-semibold">
                Escenario activo: <span className="text-[#4fb8c4]">{scenario === "normal" ? "Flujo Normal" : scenario === "insider" ? "Insider Amenaza" : "Ransomware Activo"}</span>
              </p>
            </div>
          </div>

          {/* SUTILE QUICK ROLE SWITCHER FOR DEMO OPERATORS */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setScreen("portal")
                toast.info("Sesión cerrada. Seleccione el nuevo actor para continuar la simulación.")
              }}
              className="px-3 py-1.5 text-[10px] font-bold rounded bg-[#cfa25e]/15 border border-[#cfa25e]/30 text-[#cfa25e] hover:bg-[#cfa25e]/25 transition-all flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3 animate-spin-slow" />
              Cambiar Rol (Modo Simulación)
            </button>
          </div>

          <button
            onClick={() => {
              setScreen("portal")
              // Reset simulation on formal logout
              toast.info("Simulación finalizada. Cerrando sesión...")
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#132538] border border-[#22384d] text-[#7d94a8] hover:text-[#dbe6ef] hover:border-[#54697c] transition-all self-end sm:self-auto"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </header>

        {/* ── Main Layout Grid (Optimized for no vertical scroll) ─────────── */}
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">

          {/* Left Column: Clock and Stepper */}
          <aside className="space-y-3">
            <SimClockBar />

            {/* Stepper showing main status in vertical layout */}
            <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-3 space-y-3">
              <h4 className="text-[9px] uppercase tracking-widest text-[#54697c] font-bold">
                Trazabilidad General
              </h4>
              <div className="relative border-l border-[#22384d] ml-1.5 pl-3 space-y-2 text-xs font-semibold">
                {[
                  { label: "Caso Creado",      active: simTimeHours >= 0 },
                  { label: "Acuerdo Firmado",  active: simTimeHours >= 1.25 },
                  { label: "En Traslado",      active: simTimeHours >= 2 },
                  { label: "Llegada Órgano",   active: simTimeHours >= 28 },
                  { label: "Caso Cerrado",     active: simTimeHours >= 30 }
                ].map((st, i) => (
                  <div key={i} className="relative">
                    <span className={`absolute left-[-16px] top-1 h-1.5 w-1.5 rounded-full ring-4 ${
                      st.active ? "bg-[#4fb8c4] ring-[#4fb8c4]/15" : "bg-[#132538] ring-transparent"
                    }`} />
                    <span className={st.active ? "text-[#f0f5f9]" : "text-[#54697c]"}>
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: View injected based on active role */}
          <main className="min-w-0">
            {roleActor === "incucai" && <CoordinadorView />}
            {roleActor === "hospital" && <HospitalView />}
            {roleActor === "auditor" && <AuditorView />}
            {roleActor === "iot" && <IotView />}
            {roleActor === "itprov" && <TransportadorView />}
          </main>
        </div>

      </div>
    </div>
  )
}
