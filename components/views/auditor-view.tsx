"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"
import { StatusPill } from "@/components/status-pill"
import { Traceability } from "@/components/blocks/traceability"
import { FileSearch, CheckCircle2, AlertCircle, Server, Hash, ChevronRight, Clock } from "lucide-react"

export function AuditorView() {
  const { caseData, events } = useStore()
  const [openLedger, setOpenLedger] = useState(false)

  const totalEvents = events.length
  const alteredEvents = events.filter(e => e.status === "BROKEN").length
  const finalStatus = alteredEvents === 0 ? "VALID" : "BROKEN"
  const isReceived = caseData.status === "Recibido"

  return (
    <div className="space-y-6">
      {/* Fila 1: Resumen Forense */}
      <Card className="border-t-4 border-t-primary shadow-sm bg-slate-900 text-slate-50 border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-100">
                <FileSearch className="h-6 w-6 text-blue-400" /> Auditoría — {caseData.caseId}
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">Revisión forense de cadena de custodia y telemetría.</CardDescription>
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setOpenLedger(true)}>
              <Hash className="mr-2 h-4 w-4" /> Examinar Ledger Completo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-xs uppercase text-slate-400 font-medium">Resultado Final</span>
              <div className="mt-2 flex items-center gap-2">
                {finalStatus === "VALID" ? (
                  <><CheckCircle2 className="h-5 w-5 text-emerald-400" /><span className="text-xl font-bold text-emerald-400">VALID</span></>
                ) : (
                  <><AlertCircle className="h-5 w-5 text-red-400" /><span className="text-xl font-bold text-red-400">BROKEN</span></>
                )}
              </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-xs uppercase text-slate-400 font-medium">Eventos Totales</span>
              <div className="mt-2 text-2xl font-bold font-mono">{totalEvents}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-xs uppercase text-slate-400 font-medium">Eventos Alterados</span>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{alteredEvents}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-xs uppercase text-slate-400 font-medium">Recepción</span>
              <div className="mt-2 text-xl font-bold font-mono text-slate-300">
                {isReceived ? <span className="text-emerald-400">Confirmada</span> : <span className="text-yellow-400">Pendiente</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fila 2: Red + Hitos */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4 text-primary" /> Información de Red Blockchain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Canal</span>
                <span className="text-sm font-mono font-medium">custody-channel</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Chaincode</span>
                <span className="text-sm font-mono font-medium">CustodyChain</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Último Bloque</span>
                <span className="text-sm font-mono font-medium">#14982</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Estado</span>
                <StatusPill tone="ok">Sincronizado</StatusPill>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Modo</span>
                <StatusPill tone="info">Demo / Simulado</StatusPill>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" /> Hitos de Custodia
              </CardTitle>
              <CardDescription>Timestamps de los eventos clave del flujo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              {[
                { label: "Generación de Caso", event: "CASE_CREATED" },
                { label: "Dispositivo Vinculado", event: "DEVICE_LINKED" },
                { label: "Inicio de Traslado", event: "TRANSPORT_STARTED" },
                { label: "Primera Telemetría", event: "IOT_READING_RECEIVED" },
                { label: "Recepción Confirmada", event: "CUSTODY_RECEIVED" },
              ].map(({ label, event }) => {
                const found = events.find(e => e.event === event)
                return (
                  <div key={event} className="flex justify-between items-center py-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    {found ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{found.time}</span>
                        <StatusPill tone="ok">OK</StatusPill>
                      </div>
                    ) : (
                      <StatusPill tone="warn">Pendiente</StatusPill>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DRAWER: Ledger Criptográfico Completo */}
      <Sheet open={openLedger} onOpenChange={setOpenLedger}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Hash className="h-4 w-4" /> Ledger Criptográfico Completo</SheetTitle>
            <SheetDescription>Registro inmutable de todos los eventos de la cadena de custodia.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Traceability />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
