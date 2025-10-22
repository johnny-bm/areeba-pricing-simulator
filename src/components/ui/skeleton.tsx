import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-primary/10", className)}
      style={{
        background: 'linear-gradient(90deg, hsl(var(--primary) / 0.1) 25%, hsl(var(--primary) / 0.2) 50%, hsl(var(--primary) / 0.1) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite'
      }}
      {...props}
    />
  )
}

export { Skeleton }
