"use client"

import { useStore } from "@/lib/store"
import { ROLES, type Role } from "@/lib/case-data"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, UserCog, Check } from "lucide-react"

export function RoleSwitcher() {
  const { role, setRole } = useStore()
  const current = ROLES.find((r) => r.id === role)!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-left transition-colors hover:bg-sidebar-accent">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/20 text-sidebar-primary">
          <UserCog className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-sidebar-foreground">{current.short}</span>
          <span className="block truncate text-xs text-sidebar-foreground/60">Cambiar rol</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Rol de demostración</div>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.id}
            onClick={() => setRole(r.id as Role)}
            className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
          >
            <span className="flex w-full items-center justify-between">
              <span className="font-medium">{r.label}</span>
              {r.id === role && <Check className="h-4 w-4 text-primary" />}
            </span>
            <span className="text-xs text-muted-foreground">{r.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RoleTabs() {
  const { role, setRole } = useStore()
  return (
    <div className="flex flex-wrap gap-1.5">
      {ROLES.map((r) => (
        <button
          key={r.id}
          onClick={() => setRole(r.id as Role)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            r.id === role
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-accent",
          )}
        >
          {r.short}
        </button>
      ))}
    </div>
  )
}
