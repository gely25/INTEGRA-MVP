"use client"

import { useStore } from "@/lib/store"
import { EVENT_LABEL } from "@/lib/case-data"
import type { EventName, RoleActor } from "@/lib/case-data"
import { StatusPill } from "@/components/status-pill"
import { Hash, AlertTriangle, Clock, Search, ChevronDown, X, Filter } from "lucide-react"
import { useState, useMemo, useCallback } from "react"
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select"

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

/**
 * Events that require attention — shown when "Solo alertas" toggle is active.
 */
const ALERT_EVENTS = new Set<EventName>([
  "TEMP_WARNING",
  "TEMP_CRITICAL",
  "ANOMALY_WARNING",
  "AI_ANOMALY_DETECTED",
  "WAITING_LIST_TAMPER_ATTEMPT",
  "RANSOMWARE_NODE_ISOLATED",
  "ALERT_RESOLVED",
])

/**
 * Event categories for the grouped type selector.
 * Each group maps a human label to the EventName members it covers.
 */
const EVENT_GROUPS: { group: string; events: EventName[] }[] = [
  {
    group: "Creación y firma",
    events: [
      "CASE_CREATED",
      "COMPATIBILITY_MATCH",
      "ASSIGNMENT_PENDING",
      "ASSIGNMENT_SIGNED_INCUCAI",
      "ASSIGNMENT_SIGNED_HOSPITAL",
      "ASSIGNMENT_ENDORSED",
      "DEVICE_LINKED",
    ],
  },
  {
    group: "Traslado y custodia",
    events: [
      "TRANSPORT_STARTED",
      "IOT_READING_RECEIVED",
      "OFFLINE_GAP_CLOSED",
      "CUSTODY_RECEIVED",
      "CASE_CLOSED",
    ],
  },
  {
    group: "Alertas operativas",
    events: ["TEMP_WARNING", "TEMP_CRITICAL", "ANOMALY_WARNING", "AI_ANOMALY_DETECTED"],
  },
  {
    group: "Seguridad e incidentes",
    events: [
      "WAITING_LIST_TAMPER_ATTEMPT",
      "RANSOMWARE_NODE_ISOLATED",
      "RANSOMWARE_NODE_RESTORED",
      "ALERT_RESOLVED",
    ],
  },
  {
    group: "Auditoría",
    events: ["AUDIT_VERIFIED", "EVIDENCE_VERIFIED"],
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** If false (Hospital mode), hide hashes and use plain-language text */
  techMode?: boolean
  /** If provided, filter to only events visible to this role */
  role?: RoleActor
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({
  id,
  value,
  onChange,
  placeholder,
  children,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-lg border border-border bg-secondary px-3 py-1.5 pr-8 text-xs text-card-foreground focus:outline-none focus:border-primary transition-colors ${
          value ? "border-primary/60" : ""
        }`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/60" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Traceability({ techMode = true, role }: Props) {
  const { events } = useStore()

  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchText, setSearchText]   = useState("")
  const [actorFilter, setActorFilter] = useState("")
  const [eventFilter, setEventFilter] = useState("")
  const [onlyAlerts, setOnlyAlerts]   = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const resetPagination = useCallback(() => setCurrentPage(1), [])

  // ── Derived actor list from live events (deduped) ──────────────────────────
  const actors = useMemo(() => {
    const seen = new Set<string>()
    events.forEach((e) => {
      if (e.actor) seen.add(e.actor)
    })
    return Array.from(seen).sort()
  }, [events])

  // ── Role-visibility filter (existing behavior) ──────────────────────────────
  const roleFiltered = useMemo(
    () =>
      events.filter((e) => {
        if (!role) return true
        if (!e.visibleTo) return true
        return e.visibleTo.includes(role)
      }),
    [events, role],
  )

  // ── Apply all UI filters ────────────────────────────────────────────────────
  const fullyFiltered = useMemo(() => {
    const q = searchText.trim().toLowerCase()

    return roleFiltered.filter((e) => {
      // Text search: hash, txId, actor, org
      if (q) {
        const haystack = `${e.hash} ${e.txId ?? ""} ${e.actor} ${e.org}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }

      // Actor filter
      if (actorFilter && e.actor !== actorFilter) return false

      // Event-type filter
      if (eventFilter && e.event !== eventFilter) return false

      // Alerts-only toggle
      if (onlyAlerts && !ALERT_EVENTS.has(e.event as EventName)) return false

      return true
    })
  }, [roleFiltered, searchText, actorFilter, eventFilter, onlyAlerts])

  // ── Paginate ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(fullyFiltered.length / PAGE_SIZE))
  const safePage   = Math.min(currentPage, totalPages)
  const visible    = useMemo(
    () => fullyFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [fullyFiltered, safePage],
  )

  const hasActiveFilters = searchText || actorFilter || eventFilter || onlyAlerts

  const clearFilters = () => {
    setSearchText("")
    setActorFilter("")
    setEventFilter("")
    setOnlyAlerts(false)
    setCurrentPage(1)
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (roleFiltered.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-10 text-center">
        <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground/60">Sin eventos registrados aún.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Inicia la simulación para ver el feed de custodia.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Filtros de trazabilidad
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-danger transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {/* Free-text search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); resetPagination() }}
              placeholder="Buscar hash, txId, actor…"
              className={`w-full rounded-lg border border-border bg-secondary py-1.5 pl-7 pr-3 text-xs text-card-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary transition-colors ${
                searchText ? "border-primary/60" : ""
              }`}
            />
          </div>

          {/* Actor select */}
          <FilterSelect
            id="actor-filter"
            value={actorFilter}
            onChange={(v) => { setActorFilter(v); resetPagination() }}
            placeholder="Todos los actores"
          >
            {actors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </FilterSelect>

          {/* Event-type select (grouped) */}
          <Select
            value={eventFilter}
            onValueChange={(val) => {
              setEventFilter(val ?? "")
              resetPagination()
            }}
          >
            <SelectTrigger className={eventFilter ? "border-primary/60" : ""}>
              <SelectValue placeholder="Todos los eventos">
                {eventFilter ? (
                  <span className="flex items-center gap-2">
                    {EVENT_GROUPS.find((g) => g.group === "Alertas operativas")?.events.includes(eventFilter as any) ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#cfa25e] shrink-0" />
                    ) : EVENT_GROUPS.find((g) => g.group === "Seguridad e incidentes")?.events.includes(eventFilter as any) ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e5626a] shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/40 shrink-0" />
                    )}
                    <span>{EVENT_LABEL[eventFilter as keyof typeof EVENT_LABEL] ?? eventFilter}</span>
                  </span>
                ) : (
                  "Todos los eventos"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                  <span>Todos los eventos</span>
                </span>
              </SelectItem>

              {EVENT_GROUPS.map(({ group, events: evts }) => {
                const isWarningGroup = group === "Alertas operativas"
                const isSecurityGroup = group === "Seguridad e incidentes"

                return (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {evts.map((ev) => {
                      const dotColor = isWarningGroup
                        ? "bg-[#cfa25e]"
                        : isSecurityGroup
                          ? "bg-[#e5626a]"
                          : "bg-emerald-500/40"

                      return (
                        <SelectItem key={ev} value={ev}>
                          <span className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
                            <span>{EVENT_LABEL[ev as keyof typeof EVENT_LABEL] ?? ev}</span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                )
              })}
            </SelectContent>
          </Select>

          {/* Alerts-only toggle */}
          <button
            onClick={() => { setOnlyAlerts((p) => !p); resetPagination() }}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              onlyAlerts
                ? "border-warn/60 bg-warn/10 text-warn"
                : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground/40"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Solo alertas
          </button>
        </div>
      </div>

      {/* ── Event list ──────────────────────────────────────────────────────── */}
      {fullyFiltered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground/60">
            Sin eventos que coincidan con los filtros aplicados.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <ol className="relative space-y-0">
          {visible.map((e, i) => {
            const isBroken  = e.status === "BROKEN"
            const isAlert   = ALERT_EVENTS.has(e.event as EventName)
            const label     = techMode
              ? EVENT_LABEL[e.event as keyof typeof EVENT_LABEL] ?? e.event
              : (e.plainText || (EVENT_LABEL[e.event as keyof typeof EVENT_LABEL] ?? e.event))

            return (
              <li key={e.id} className="flex gap-4 pb-5 last:pb-0">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <span
                    className={`mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${
                      isBroken
                        ? "bg-danger ring-danger/15"
                        : isAlert
                          ? "bg-warn ring-warn/15"
                          : "bg-primary ring-primary/15"
                    }`}
                  />
                  {i < visible.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>

                {/* Event content */}
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-card-foreground flex items-center gap-1.5">
                      {isBroken && (
                        <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />
                      )}
                      {label}
                    </p>
                    <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
                      {e.time}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {e.actor} · {e.org}
                  </p>

                  {techMode && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <code className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60">
                        <Hash className="h-2.5 w-2.5" />
                        {e.hash}
                      </code>
                      {e.txId && (
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60">
                          {e.txId.slice(0, 18)}…
                        </code>
                      )}
                      <StatusPill
                        tone={
                          e.status === "VALID"
                            ? "ok"
                            : e.status === "BROKEN"
                              ? "danger"
                              : "warn"
                        }
                      >
                        {e.status}
                      </StatusPill>
                    </div>
                  )}

                  {!techMode && isBroken && (
                    <div className="mt-1.5">
                      <StatusPill tone="danger">Alerta registrada</StatusPill>
                    </div>
                  )}

                  {/* Plain-text resolution note */}
                  {e.plainText && techMode && (
                    <p className="mt-1 text-[10px] text-muted-foreground/60 italic leading-relaxed">
                      {e.plainText}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {/* ── Pagination controls ─────────────────────────────────────────────── */}
      {fullyFiltered.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border sm:flex-row sm:items-center sm:justify-between">

          {/* Counter */}
          <span className="text-[10px] text-muted-foreground/60 tabular-nums">
            Página{" "}
            <span className="font-semibold text-muted-foreground">{safePage}</span>
            {" "}de{" "}
            <span className="font-semibold text-muted-foreground">{totalPages}</span>
            {" — "}
            <span className="font-semibold text-muted-foreground">{fullyFiltered.length}</span>
            {" "}evento{fullyFiltered.length !== 1 ? "s" : ""}
            {hasActiveFilters && (
              <span className="text-muted-foreground/40">
                {" "}(filtrado{fullyFiltered.length !== 1 ? "s" : ""} de{" "}
                {roleFiltered.length} total)
              </span>
            )}
          </span>

          {/* Page buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">

              {/* Prev */}
              <button
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary text-xs text-muted-foreground transition-all hover:border-primary/60 hover:text-card-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Página anterior"
              >
                ‹
              </button>

              {/* Page pills — show up to 5 with ellipsis */}
              {(() => {
                const delta = 2
                const range: (number | "...")[] = []
                let last = 0

                for (let p = 1; p <= totalPages; p++) {
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= safePage - delta && p <= safePage + delta)
                  ) {
                    if (last && p - last > 1) range.push("...")
                    range.push(p)
                    last = p
                  }
                }

                return range.map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground/40">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-all ${
                        p === safePage
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:border-primary/60 hover:text-card-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )
              })()}

              {/* Next */}
              <button
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary text-xs text-muted-foreground transition-all hover:border-primary/60 hover:text-card-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Página siguiente"
              >
                ›
              </button>

            </div>
          )}
        </div>
      )}
    </div>
  )
}
