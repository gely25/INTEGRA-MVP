import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Lock } from "lucide-react"

export function SecurityNote() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-start gap-3 py-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium text-foreground">Frontend renderiza. Backend autoriza. Ledger registra.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            El frontend solo muestra los módulos permitidos por rol. En producción la API valida cada permiso
            (RBAC) y el ledger registra cada evento de forma inmutable.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function Restricted({ role }: { role?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Lock className="h-6 w-6 text-muted-foreground" />
        <p className="font-medium text-foreground">No autorizado para este rol</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {role
            ? `El rol "${role}" no tiene permisos para acceder a este módulo.`
            : "Este módulo no está disponible para el rol seleccionado."}
        </p>
      </CardContent>
    </Card>
  )
}
