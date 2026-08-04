import { motion } from "framer-motion"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  trend?: { value: number; up: boolean }
  accent?: "primary" | "secondary" | "accent" | "success" | "warning"
  className?: string
}

const accentMap = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
}

export function StatCard({ icon: Icon, label, value, hint, trend, accent = "primary", className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
    >
      <Card className={cn("p-5", className)}>
        <div className="flex items-start justify-between">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trend.up ? "text-success" : "text-destructive"
              )}
            >
              {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <p className="mt-4 font-display text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
      </Card>
    </motion.div>
  )
}
