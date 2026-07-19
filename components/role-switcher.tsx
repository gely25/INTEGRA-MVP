"use client";

import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/case-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ChevronsUpDown,
  UserCog,
  LogOut,
} from "lucide-react";

export function RoleSwitcher() {
  const { role } = useStore();

  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  const current = ROLES.find((r) => r.id === role)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-left transition-colors hover:bg-sidebar-accent">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/20 text-sidebar-primary">
          <UserCog className="h-5 w-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-sidebar-foreground">
            {current.short}
          </span>

          <span className="block truncate text-xs text-sidebar-foreground/60">
            Sesión activa
          </span>
        </span>

        <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem disabled>
          <span className="font-medium">
            Rol actual: {current.label}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RoleTabs() {
  const { role } = useStore();

  return (
    <div className="flex flex-wrap gap-1.5">
      {ROLES.map((r) => (
        <span
          key={r.id}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            r.id === role
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          )}
        >
          {r.short}
        </span>
      ))}
    </div>
  );
}