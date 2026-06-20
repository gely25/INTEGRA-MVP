import { cn } from "@/lib/utils"

export function DataRow({
  label,
  value,
  mono = false,
  className,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-right text-sm font-medium text-foreground", mono && "font-mono tabular-nums")}>
        {value}
      </span>
    </div>
  )
}
