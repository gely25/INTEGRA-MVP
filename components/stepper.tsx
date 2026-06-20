import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Step {
  id: string
  label: string
  status: "complete" | "current" | "pending" | "alert"
}

export function Stepper({ steps, orientation = "horizontal" }: { steps: Step[], orientation?: "horizontal" | "vertical" }) {
  const isVertical = orientation === "vertical"

  return (
    <div className={cn(
      "flex w-full justify-between",
      isVertical ? "flex-col items-start gap-4 py-2" : "items-center overflow-x-auto py-4"
    )}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const isComplete = step.status === "complete"
        const isCurrent = step.status === "current"
        const isAlert = step.status === "alert"

        return (
          <div key={step.id} className={cn("flex", isVertical ? "flex-col" : "flex-1 items-center")}>
            <div className={cn("flex items-center gap-3", !isVertical && "flex-col")}>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors z-10",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary",
                  isAlert && "border-destructive bg-destructive/10 text-destructive",
                  step.status === "pending" && "border-muted bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isComplete || isCurrent ? "text-foreground" : "text-muted-foreground",
                  isAlert && "text-destructive"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  isVertical ? "ml-4 mt-2 h-8 w-[2px]" : "mx-4 h-[2px] flex-1",
                  isComplete ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
