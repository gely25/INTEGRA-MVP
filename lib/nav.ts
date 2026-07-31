import type { RoleActor } from "./case-data"
import {
  LayoutDashboard,
  FileSignature,
  Activity,
  Bell,
  GitBranch,
  ShieldCheck,
  Server,
  ClipboardList,
  Terminal,
  Lock,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

export const NAV_BY_ROLE: Record<RoleActor, NavItem[]> = {
  incucai: [
    { id: "overview", label: "Consola Nacional", icon: LayoutDashboard },
    { id: "signatures", label: "Firma de Asignación", icon: FileSignature },
    { id: "alerts", label: "Alertas y Telemetría", icon: Bell },
    { id: "trace", label: "Auditoría en Red", icon: GitBranch },
  ],
  hospital: [
    { id: "overview", label: "Mis Casos Entrantes", icon: ClipboardList },
    { id: "alerts", label: "Avisos de Traslado", icon: Bell },
    { id: "confirm", label: "Confirmar Recepción", icon: ShieldCheck },
  ],
  auditor: [
    { id: "overview", label: "Panel Forense", icon: LayoutDashboard },
    { id: "ledger", label: "Ledger Blockchain", icon: GitBranch },
    { id: "alerts", label: "Monitoreo de Anomalías", icon: ShieldCheck },
  ],
  iot: [
    { id: "overview", label: "Consola de Máquina", icon: Terminal },
    { id: "telemetry", label: "Telemetría Pura", icon: Activity },
  ],
  itprov: [
    { id: "overview", label: "Acceso PAM", icon: Lock },
    { id: "nodes", label: "Nodos Blockchain", icon: Server },
  ],
}
