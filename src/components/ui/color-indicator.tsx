"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ColorIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string
  size?: "sm" | "md" | "lg"
}

const ColorIndicator = React.forwardRef<HTMLDivElement, ColorIndicatorProps>(
  ({ className, color, size = "sm", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full flex-shrink-0",
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: color }}
        {...props}
      />
    )
  }
)
ColorIndicator.displayName = "ColorIndicator"

export { ColorIndicator }
