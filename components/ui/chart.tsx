"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, any>
  }
>(({ className, config, ...props }, ref) => {
  return <div ref={ref} className={cn("w-full", className)} {...props} />
})
ChartContainer.displayName = "ChartContainer"

// Chart tooltip component
const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ active, payload, label, hideLabel, hideIndicator, indicator = "dot", nameKey, labelKey, ...props }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div ref={ref} className="rounded-lg border bg-background p-2 shadow-md" {...props}>
      {!hideLabel && label && <div className="mb-2 font-medium">{label}</div>}
      <div className="grid gap-2">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-[2px]",
                  indicator === "dot" && "rounded-full",
                  indicator === "line" && "w-1",
                )}
                style={{ backgroundColor: item.color }}
              />
            )}
            <div className="flex flex-1 justify-between gap-2">
              <span className="text-muted-foreground">{nameKey ? item.payload[nameKey] : item.name}</span>
              <span className="font-mono font-medium tabular-nums text-foreground">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart legend component
const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<any>
    hideIcon?: boolean
  }
>(({ className, payload, hideIcon, ...props }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props}>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {!hideIcon && <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />}
          <span className="text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
