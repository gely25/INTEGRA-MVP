"use client"

import { useStore } from "@/lib/store"
import { useState } from "react"
import { ShieldAlert, Server, Lock, CheckCircle2, ShieldCheck, Activity, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function NodeStatus({ name, status, blocks, latency }: { name: string; status: "online" | "offline" | "isolated"; blocks: number; latency: number }) {
  const statusColor = {
    online: "bg-[#79cf9c] text-[#0a141f]",
    offline: "bg-[#e5626a] text-white",
    isolated: "bg-[#cfa25e] text-[#0a141f]"
  }

  const label = {
    online: "Online",
    offline: "Offline",
    isolated: "Aislado (Ransomware)"
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-[#22384d] bg-[#132538]">
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4 text-[#93a4b3]" />
        <div>
          <p className="text-xs font-mono font-bold text-[#f0f5f9]">{name}</p>
          <p className="text-[10px] text-[#7d94a8]">Bloques: {blocks} · Latencia: {latency}ms</p>
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${statusColor[status]}`}>
        {label[status]}
      </span>
    </div>
  )
}

export function TransportadorView() {
  const { pamGranted, setPamGranted, ransomwareActive, simTimeHours, scenario } = useStore()
  const [requesting, setRequesting] = useState(false)

  const handleRequestPAM = () => {
    setRequesting(true)
    setTimeout(() => {
      setPamGranted(true)
      setRequesting(false)
      toast.success("Acceso Privilegiado Temporal (PAM) Aprobado", {
        description: "Sesión grabada y registrada en auditoría."
      })
    }, 1200)
  }

  if (!pamGranted) {
    return (
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-8 text-center max-w-md mx-auto my-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e5626a]/15 text-[#e5626a] mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-[#f0f5f9] mb-2">Acceso Zero Trust por Defecto</h3>
        <p className="text-xs text-[#7d94a8] mb-6 leading-relaxed">
          Su rol de Proveedor IT no cuenta con permisos permanentes ni acceso a datos clínicos de pacientes.
          Requiere solicitar Acceso Privilegiado Temporal (PAM) para mantenimiento de infraestructura.
        </p>
        <Button
          onClick={handleRequestPAM}
          disabled={requesting}
          className="w-full bg-[#4fb8c4] hover:bg-[#4fb8c4]/80 text-[#0a141f] font-bold"
        >
          {requesting ? "Verificando token mTLS/TOTP..." : "Solicitar acceso PAM"}
        </Button>
      </div>
    )
  }

  // Ransomware condition
  const isRansomwareIsolated = scenario === "ransomware" && simTimeHours >= 12 && !ransomwareActive

  return (
    <div className="space-y-5">
      {/* Active PAM session banner */}
      <div className="rounded-lg border border-[#79cf9c]/30 bg-[#1c3128] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#79cf9c]" />
          <span className="text-xs font-semibold text-[#79cf9c]">Sesión PAM Activa (Mantenimiento de Red)</span>
        </div>
        <span className="text-[10px] font-mono text-[#7d94a8]">Sesión ID: PAM-9482 · Grabación: ON</span>
      </div>

      {/* Ransomware Banner */}
      {scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive && (
        <div className="rounded-lg border border-[#e5626a]/40 bg-[#2a1214] p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-[#e5626a] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#e5626a]">INCIDENTE ACTIVO: Ransomware en Nodo Donante</p>
              <p className="text-xs text-[#7d94a8] mt-1">
                peer0.hospitaldona reportó firmas de archivo anómalas (patrón de cifrado).
                El IDS aisló el nodo del canal blockchain. La red continúa operativa gracias a los
                peers redundantes en INCUCAI y Hospital Receptor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health / Nodes status */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <h3 className="text-sm font-semibold text-[#f0f5f9] mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#4fb8c4]" /> Salud de la Red Blockchain
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <NodeStatus
            name="peer0.incucai (INCUCAI)"
            status="online"
            blocks={14983}
            latency={12}
          />
          <NodeStatus
            name="peer0.hospitalrec (Receptor)"
            status="online"
            blocks={14983}
            latency={15}
          />
          <NodeStatus
            name="peer0.hospitaldona (Donante)"
            status={
              scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive
                ? "isolated"
                : "online"
            }
            blocks={scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive ? 14920 : 14983}
            latency={scenario === "ransomware" && simTimeHours >= 12 && ransomwareActive ? 999 : 14}
          />
          <NodeStatus
            name="orderer.raft (Consenso)"
            status="online"
            blocks={14983}
            latency={8}
          />
        </div>
      </div>

      {/* Infrastructure logs */}
      <div className="rounded-lg border border-[#22384d] bg-[#0f1e2c] p-4">
        <h3 className="text-sm font-semibold text-[#f0f5f9] mb-3 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#4fb8c4]" /> Logs de Infraestructura (PAM)
        </h3>
        <div className="bg-[#070d12] p-3 rounded-lg border border-[#22384d] font-mono text-[10px] text-[#7d94a8] space-y-1 h-40 overflow-y-auto">
          <p>[00:00:01] channel=custody-channel joined successfully by 3 peers</p>
          <p>[00:00:02] consensus=Raft initialized with 3 orderer endpoints</p>
          <p>[01:30:15] link-device: authorized TLS tunnel for DEVICE-001</p>
          {scenario === "ransomware" && simTimeHours >= 12 && (
            <>
              <p className="text-[#e5626a]">[12:00:00] SECURITY ALERT: cipher pattern detected on peer0.hospitaldona</p>
              <p className="text-[#e5626a]">[12:00:05] SECURITY STATE: isolation policy enforced for peer0.hospitaldona</p>
              <p className="text-[#cfa25e]">[12:00:10] consensus: raft orderer continues with 2/3 active peers</p>
              {simTimeHours >= 12.25 && (
                <>
                  <p className="text-[#79cf9c]">[12:15:00] PAM ACTION: restore peer0.hospitaldona from offline backup</p>
                  <p className="text-[#79cf9c]">[12:15:30] sync: peer0.hospitaldona catching up to block #14983</p>
                  <p className="text-[#79cf9c]">[12:16:00] status: all nodes synchronized</p>
                </>
              )}
            </>
          )}
          {!ransomwareActive && <p>[{Math.floor(simTimeHours).toString().padStart(2, "0")}:14:00] keep-alive ping OK from 4 endpoints</p>}
        </div>
      </div>
    </div>
  )
}
