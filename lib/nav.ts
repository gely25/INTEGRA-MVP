import type { Role } from "./case-data"
import {
  LayoutDashboard,
  FilePlus2,
  Link2,
  Play,
  Activity,
  Bell,
  GitBranch,
  ShieldCheck,
  Truck,
  QrCode,
  MapPin,
  Package,
  WifiOff,
  Inbox,
  HeartPulse,
  LineChart,
  BadgeCheck,
  CheckCircle2,
  Lock,
  ScrollText,
  ListTree,
  Database,
  FileCheck,
  FileDown,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  coordinador: [
    { id: "overview", label: "Vista general", icon: LayoutDashboard },
    { id: "prepare", label: "Preparar caso", icon: FilePlus2 },
    { id: "link", label: "Vincular dispositivo", icon: Link2 },
    { id: "start", label: "Iniciar traslado", icon: Play },
    { id: "telemetry", label: "Telemetría", icon: Activity },
    { id: "alerts", label: "Alertas", icon: Bell },
    { id: "trace", label: "Trazabilidad", icon: GitBranch },
    { id: "reception", label: "Estado de recepción", icon: Inbox },
    { id: "security", label: "Seguridad", icon: ShieldCheck },
  ],
  transportador: [
    { id: "logistics", label: "Vista logística", icon: Truck },
    { id: "qr", label: "QR del caso", icon: QrCode },
    { id: "route", label: "Ruta y ubicación", icon: MapPin },
    { id: "container", label: "Contenedor", icon: Package },
    { id: "telemetry", label: "Telemetría actual", icon: Activity },
    { id: "offline", label: "Modo offline", icon: WifiOff },
    { id: "alerts", label: "Alertas logísticas", icon: Bell },
  ],
  hospital: [
    { id: "incoming", label: "Caso entrante", icon: Inbox },
    { id: "twin", label: "Gemelo operativo", icon: HeartPulse },
    { id: "history", label: "Historial temperatura", icon: LineChart },
    { id: "alerts", label: "Alertas del traslado", icon: Bell },
    { id: "evidence", label: "Verificar evidencia", icon: BadgeCheck },
    { id: "confirm", label: "Confirmar recepción", icon: CheckCircle2 },
    { id: "close", label: "Cierre del caso", icon: Lock },
  ],
  auditor: [
    { id: "audit", label: "Panel de auditoría", icon: ScrollText },
    { id: "timeline", label: "Línea de tiempo", icon: ListTree },
    { id: "events", label: "Eventos de custodia", icon: GitBranch },
    { id: "ledger", label: "Evidencia ledger/hash", icon: Database },
    { id: "integrity", label: "Resultado integridad", icon: FileCheck },
    { id: "report", label: "Reporte", icon: FileDown },
  ],
}
