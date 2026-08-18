"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { HUMAN_ROLES, type RoleActor } from "@/lib/case-data"
import { Clapperboard, Eye, FileSignature, Info, Check, RotateCcw, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "sonner"

export function DirectorPanel() {
  const {
    roleActor,
    setRoleActor,
    assignmentContract,
    signAssignment,
    resetSim,
  } = useStore()

  const [open, setOpen] = useState(false)

  const handleSwitchRole = (id: RoleActor, label: string) => {
    setRoleActor(id)
    setOpen(false)
    toast.info(`Cambiado a vista de: ${label}`)
  }

  const handleSign = async (actor: "incucai" | "hospital", label: string) => {
    await signAssignment(actor)
    toast.success(`Firma de ${label} registrada exitosamente`, {
      description: "Transacción de acuerdo inscrita en el ledger con firma ECDSA-256.",
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:border-muted-foreground transition-all flex items-center gap-1.5 cursor-pointer"
        title="Panel de Control Multi-Rol para el Presentador"
      >
        <Clapperboard className="h-3.5 w-3.5 text-primary" />
        <span>Modo director</span>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-card border-l border-border flex flex-col gap-5 overflow-y-auto">
        <SheetHeader className="pb-3 border-b border-border text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-card-foreground">
                Consola de Control Multi-Rol
              </SheetTitle>
              <p className="text-[11px] text-muted-foreground">
                Herramientas de conveniencia para la presentación en vivo.
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Demo Presenter Disclaimer Badge */}
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-warn uppercase tracking-wider text-[10px]">
            <Info className="h-3.5 w-3.5 shrink-0" />
            SOLO PARA DEMO / PRESENTADOR
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Permite alternar entre vistas de cada actor y ejecutar acuerdos de firma sin necesidad de cerrar sesión o cambiar de navegador. En producción, cada rol opera exclusivamente desde su nodo autenticado.
          </p>
        </div>

        {/* Roles List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
            Roles del Proceso
          </h4>

          {HUMAN_ROLES.map((r) => {
            const isActiveRole = roleActor === r.id
            const canSignIncucai = r.id === "incucai" && !assignmentContract.sigs.incucai
            const isSignedIncucai = r.id === "incucai" && assignmentContract.sigs.incucai

            const canSignHospital = r.id === "hospital" && assignmentContract.sigs.incucai && !assignmentContract.sigs.hospital
            const isSignedHospital = r.id === "hospital" && assignmentContract.sigs.hospital

            return (
              <div
                key={r.id}
                className={`rounded-lg border p-3 flex flex-col gap-2 transition-all ${
                  isActiveRole
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-secondary/40 hover:bg-secondary/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <div>
                      <span className="text-xs font-bold text-card-foreground block">
                        {r.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 font-mono">
                        {r.org}
                      </span>
                    </div>
                  </div>

                  {isActiveRole && (
                    <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                      VISTA ACTUAL
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                  <Button
                    size="sm"
                    variant={isActiveRole ? "secondary" : "outline"}
                    className="h-7 text-[11px] font-semibold"
                    onClick={() => handleSwitchRole(r.id, r.label)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Ver como {r.short}
                  </Button>

                  {/* Pending signature controls for INCUCAI and Hospital Receptor */}
                  {r.id === "incucai" && (
                    <>
                      {isSignedIncucai ? (
                        <span className="text-[10px] font-mono font-bold text-ok flex items-center gap-1 bg-ok/10 px-2 py-0.5 rounded border border-ok/20">
                          <Check className="h-3 w-3" /> Firmado
                        </span>
                      ) : canSignIncucai ? (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/80"
                          onClick={() => handleSign("incucai", r.label)}
                        >
                          <FileSignature className="mr-1 h-3 w-3" />
                          Firmar como INCUCAI
                        </Button>
                      ) : null}
                    </>
                  )}

                  {r.id === "hospital" && (
                    <>
                      {isSignedHospital ? (
                        <span className="text-[10px] font-mono font-bold text-ok flex items-center gap-1 bg-ok/10 px-2 py-0.5 rounded border border-ok/20">
                          <Check className="h-3 w-3" /> Firmado
                        </span>
                      ) : canSignHospital ? (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] font-bold bg-ok text-ok-foreground hover:bg-ok/80"
                          onClick={() => handleSign("hospital", r.label)}
                        >
                          <FileSignature className="mr-1 h-3 w-3" />
                          Firmar como Receptor
                        </Button>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground/60">
                          Requiere firma INCUCAI previa
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Reset action */}
        <div className="mt-auto pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetSim()
              toast.info("Simulación reiniciada a T+00h00m")
            }}
            className="w-full h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reiniciar caso a T+00h00m
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
