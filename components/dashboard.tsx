"use client"

import { useState, useEffect } from "react"
import { StoreProvider, useStore } from "@/lib/store"
import { HUMAN_ROLES, IOT_ROLE, type RoleInfo } from "@/lib/case-data"
import { CoordinadorView } from "@/components/views/coordinador-view"
import { HospitalView } from "@/components/views/hospital-view"
import { AuditorView } from "@/components/views/auditor-view"
import { IotView } from "@/components/views/iot-view"
import { TransportadorView } from "@/components/views/transportador-view" // IT Prov
import { SimClockBar } from "@/components/blocks/sim-clock-bar"
import { Shield, Key, Database, ChevronRight, LayoutDashboard, LogOut, Terminal, Lock, Heart, RefreshCw, Clock, Thermometer, Radio, ChevronDown, Info } from "lucide-react"
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
  const [showEdgeSim, setShowEdgeSim] = useState(false)

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
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-[#54697c] bg-[#0f1e2c] border border-[#22384d] px-2 py-1 rounded">
              PROTOTIPO v2.0 · API GATEWAY DEMO
            </span>
            <span className="text-[9px] text-[#4fb8c4] font-mono flex items-center gap-1">
              <Info className="h-3 w-3" /> Interfaz de Referencia de la API (RBAC)
            </span>
          </div>
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
              {HUMAN_ROLES.map((r) => (
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

        {/* Footer con Aclaración Arquitectónica de API */}
        <div className="space-y-2 pt-8 border-t border-[#22384d] max-w-[1100px] mx-auto w-full text-center">
          <div className="inline-flex items-center gap-2 bg-[#0f1e2c] border border-[#4fb8c4]/30 px-4 py-2 rounded-lg text-xs text-[#7d94a8] max-w-3xl mx-auto">
            <Info className="h-4 w-4 text-[#4fb8c4] shrink-0" />
            <p className="text-left leading-relaxed">
              <strong className="text-[#f0f5f9]">Aviso de Arquitectura API:</strong> Este Portal es una interfaz gráfica de referencia para demostrar el consumo de la API de INTEGRA (Hyperledger Fabric Gateway). Los sistemas legados (e.g. SINTRA/HIS) consumirán los endpoints sin alterar sus interfaces actuales.
            </p>
          </div>
          <p className="text-[10px] text-[#54697c]">
            INTEGRA Blockchain + IoT. Prototipo Académico de Seguridad y Auditoría de Trasplantes.
          </p>
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
  const currentRole = HUMAN_ROLES.find((r) => r.id === roleActor) ?? HUMAN_ROLES[0]
  
  // Calculate ischemia for header stats
  const remainingHoursRaw = Math.max(0, caseData.ischemiaWindowHours - simTimeHours)
  const remH = Math.floor(remainingHoursRaw)
  const remM = Math.round((remainingHoursRaw - remH) * 60)
  const formatRemaining = `${String(remH).padStart(2, "0")}h ${String(remM).padStart(2, "0")}m`
  
  const organStatus = caseData.tempInternal > 4.2 || simTimeHours >= 20 ? "Crítico" : "Óptimo"
  const organStatusColor = organStatus === "Óptimo" ? "text-[#79cf9c]" : "text-[#e5626a]"

  return (
    <div className="dark min-h-screen bg-[#0a141f] text-[#dbe6ef] font-sans">
      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-4">

        {/* ── Top Header Navigation Bar ────────────────────────────────────── */}
        <header className="flex flex-col gap-3 pb-3 border-b border-[#22384d] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase"
              style={{
                color: currentRole?.color,
                borderColor: `${currentRole?.color}40`,
                backgroundColor: `${currentRole?.color}08`,
              }}
            >
              {currentRole?.org}
            </span>
            <div>
              <h1 className="text-base font-bold text-[#f0f5f9] tracking-tight">
                INTEGRA — Panel Operativo del Traslado Renal
              </h1>
              <p className="text-[10px] text-[#54697c] font-semibold">
                Perfil: <span className="text-[#f0f5f9]">{currentRole?.label}</span> · Escenario: <span className="text-[#4fb8c4]">{scenario === "normal" ? "Flujo Normal" : scenario === "insider" ? "Insider Amenaza" : "Ransomware Activo"}</span>
              </p>
            </div>
          </div>

          {/* Integrated SimClockBar and Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Integrated floating demo clock bar */}
            <div className="w-full sm:w-auto">
              <SimClockBar />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setScreen("portal")
                  toast.info("Sesión cerrada. Seleccione el nuevo actor para continuar la simulación.")
                }}
                className="px-3 py-1.5 text-[10px] font-bold rounded bg-[#cfa25e]/15 border border-[#cfa25e]/30 text-[#cfa25e] hover:bg-[#cfa25e]/25 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                Cambiar Rol
              </button>
              <button
                onClick={() => {
                  setScreen("portal")
                  toast.info("Simulación finalizada. Cerrando sesión...")
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#132538] border border-[#22384d] text-[#7d94a8] hover:text-[#dbe6ef] hover:border-[#54697c] transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* ── Compact Horizontal Case Summary Header Bar ────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-4 bg-[#0f1e2c] border border-[#22384d] rounded-xl p-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Heart className="h-4 w-4 text-[#4fb8c4] shrink-0" />
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#54697c] font-bold block font-sans">Caso Activo</span>
              <span className="font-bold text-[#f0f5f9]">{caseData.caseId} ({caseData.organ})</span>
            </div>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#54697c] font-bold block font-sans">Donante</span>
            <span className="text-[#dbe6ef] truncate block">{caseData.origin}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#54697c] font-bold block font-sans">Receptor</span>
            <span className="text-[#dbe6ef] truncate block">{caseData.destination}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-[9px] uppercase tracking-wider text-[#54697c] font-bold font-sans">Cadena de Frío:</span>
            <span className="text-[#79cf9c] font-bold px-2 py-0.5 rounded bg-[#79cf9c]/10 border border-[#79cf9c]/20">
              {caseData.coldChain} ({caseData.tempInternal.toFixed(1)}°C)
            </span>
          </div>
        </div>

        {/* ── Full Width Content Area (Zero sidebar, 100% width) ───────────── */}
        <main className="w-full min-w-0">
          {roleActor === "incucai" && <CoordinadorView />}
          {roleActor === "hospital" && <HospitalView />}
          {roleActor === "auditor" && <AuditorView />}
          {roleActor === "iot" && <IotView />}
          {roleActor === "itprov" && <TransportadorView />}
        </main>

      </div>
    </div>
  )
}
